import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export const runtime = "nodejs";

/**
 * API Route for Text-Based Plant Consultation
 */
export async function POST(req: Request) {
    const hfToken = process.env.HUGGINGFACE_API_KEY;

    try {
        const { description, userId, lang = 'en' } = await req.json();

        if (!userId || !description) {
            return NextResponse.json({ error: 'Please provide a symptom description.' }, { status: 400 });
        }

        if (!hfToken) {
            throw new Error('HUGGINGFACE_API_KEY is not configured in the environment.');
        }

        const langMap: Record<string, string> = {
            'en': 'English',
            'hi': 'Hindi',
            'kn': 'Kannada'
        };

        const targetLang = langMap[lang] || 'English';

        // --- AI Reasoning Phase (Pure Text) ---
        const reasoningModel = 'Qwen/Qwen2.5-7B-Instruct';
        const systemPrompt = `Act as a senior plant pathologist. 
Provide a comprehensive medical report for the plant based on the provided symptom description.
You MUST provide the response in ${targetLang}.

REQUIRED SECTIONS in ${targetLang}: 1. Disease Explanation, 2. Causes, 3. Immediate Treatment, 4. Preventive Measures, 5. Suggested Fertilizers/Pesticides.

IMPORTANT: Your response MUST be a single-line JSON object. 
DO NOT include any text before or after the JSON. 
DO NOT use actual newlines or tabs inside the JSON values; use '\\n' for any line breaks.
KEEP JSON KEYS in English: "plant_name", "disease_name", "confidence", "is_healthy", "treatment_suggestions".

{
  "plant_name": string (Translated to ${targetLang}),
  "disease_name": string (Translated to ${targetLang}),
  "confidence": number (0-1),
  "is_healthy": boolean,
  "treatment_suggestions": string (Full report translated to ${targetLang})
}`;

        const userPrompt = `DIAGNOSIS TASK:
Symptom Description: "${description}"

Identify the potential plant and its issues based on these symptoms. Provide a detailed remediation protocol.`;

        const res = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: reasoningModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.1,
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'AI Reasoning failed');

        const output = data.choices[0].message.content;

        // --- Robust JSON Extraction ---
        const extractJSON = (str: string) => {
            const start = str.indexOf('{');
            const end = str.lastIndexOf('}');
            if (start === -1 || end === -1) return null;
            return str.substring(start, end + 1);
        };

        const jsonString = extractJSON(output);
        if (!jsonString) throw new Error('AI failed to generate a structured report');

        let diagnosis;
        try {
            // First try direct parse
            diagnosis = JSON.parse(jsonString);
        } catch (e) {
            // Fallback: Surgical cleaning for common LLM parsing issues
            try {
                const fixedJson = jsonString
                    .replace(/([^\n,:{}\[\]])\n([^\n,:{}\[\]])/g, '$1\\n$2') // Fix unescaped internal newlines
                    .replace(/\t/g, ' '); // Replace tabs
                diagnosis = JSON.parse(fixedJson);
            } catch (e2) {
                console.error('[AgriDoctor JSON Error]:', output);
                throw new Error('Could not parse the diagnostic report. Please try again.');
            }
        }

        // Save to database
        await insforge.database.from('diagnoses').insert([{
            user_id: userId,
            plant_name: diagnosis.plant_name,
            disease_name: diagnosis.disease_name,
            confidence: diagnosis.confidence || 0.85,
            is_healthy: diagnosis.is_healthy,
            treatment_suggestions: diagnosis.treatment_suggestions
        }]);

        return NextResponse.json(diagnosis);

    } catch (error: unknown) {
        console.error('[AgriDoctor Pipeline Error]:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
    }
}
