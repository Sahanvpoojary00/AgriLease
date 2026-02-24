import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

/**
 * API Route for Text-Based Plant Consultation via Hugging Face Router
 */
export async function POST(req: Request) {
    try {
        const { description, userId } = await req.json();

        if (!description || !userId) {
            return NextResponse.json({ error: 'Missing symptom description' }, { status: 400 });
        }

        const hfToken = process.env.HUGGINGFACE_API_KEY;

        if (!hfToken) {
            throw new Error('HUGGINGFACE_API_KEY is not configured in the environment.');
        }

        // --- Hugging Face Router API (OpenAI Compatible) ---
        const model = 'Qwen/Qwen2.5-7B-Instruct';
        const systemPrompt = `Act as a professional agricultural plant pathologist. 
Analyze the plant symptoms provided and identify the issues.
Output ONLY a valid JSON object with NO markdown code blocks and NO additional text.
JSON Schema:
{
  "plant_name": string,
  "disease_name": string,
  "confidence": number,
  "is_healthy": boolean,
  "treatment_suggestions": string
}`;

        const res = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${hfToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Analyze these symptoms: "${description}"` }
                ],
                max_tokens: 1000,
                temperature: 0.2,
            }),
        });

        const resText = await res.text();
        let data;
        try {
            data = JSON.parse(resText);
        } catch (e) {
            console.error('[HuggingFace Router] Non-JSON response:', resText);
            throw new Error(`AI returned an unexpected response format: ${resText.slice(0, 50)}...`);
        }

        if (!res.ok) {
            console.error('[HuggingFace Router] API error:', JSON.stringify(data));
            throw new Error(data?.error?.message || data?.error || `Hugging Face error: ${res.status}`);
        }

        const output = data.choices?.[0]?.message?.content || '';

        // Clean output to find JSON
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('[AI Output Parse Error] Content:', output);
            throw new Error('AI failed to generate a valid diagnostic report. Please try describing symptoms differently.');
        }

        const diagnosis = JSON.parse(jsonMatch[0]);

        // Save to database
        await insforge.database.from('diagnoses').insert([{
            user_id: userId,
            plant_name: diagnosis.plant_name,
            disease_name: diagnosis.disease_name,
            confidence: diagnosis.confidence,
            is_healthy: diagnosis.is_healthy,
            treatment_suggestions: diagnosis.treatment_suggestions,
            image_url: null
        }]);

        return NextResponse.json(diagnosis);

    } catch (error: unknown) {
        console.error('[consult-ai] Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
