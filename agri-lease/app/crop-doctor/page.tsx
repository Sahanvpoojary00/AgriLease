'use client';
import { useState } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

export default function CropDoctorPage() {
    const { isLoaded } = useUser();
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [diagnosis, setDiagnosis] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setDiagnosis(null);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setAnalyzing(true);
        setDiagnosis(null);

        try {
            // Convert image to base64 for AI SDK
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(image);
            });
            const base64Image = await base64Promise;

            const completion = await insforge.ai.chat.completions.create({
                model: 'anthropic/claude-3.5-haiku',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Analyze this crop photo. Identify any diseases, pests, or nutrient deficiencies. Provide a clear diagnosis, 3 immediate actions, and organic/chemical treatment recommendations. Format with headers and bullet points.'
                            },
                            {
                                type: 'image_url',
                                image_url: { url: base64Image }
                            }
                        ]
                    }
                ]
            });

            setDiagnosis(completion.choices[0].message.content);
        } catch (error) {
            console.error('AI Error:', error);
            alert('Failed to analyze the image. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (!isLoaded) return <div className="min-h-screen bg-earth-deep flex items-center justify-center"><div className="w-8 h-8 border-2 border-success border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-earth-deep">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-success/30 bg-success/10 text-success text-sm font-medium mb-6"
                    >
                        <span className="text-lg">🩺</span>
                        AI Crop Doctor
                    </motion.div>
                    <h1 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-4">
                        Protect Your <span className="text-success">Harvest</span>
                    </h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto">
                        Upload a clear photo of your crop's leaves or affected areas for an instant AI-powered health assessment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Upload Section */}
                    <Card padding="lg" className="border-earth-border bg-earth-card/50">
                        <div className="space-y-6">
                            <div
                                className={`aspect-square rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden relative group ${preview ? 'border-success/50' : 'border-earth-border hover:border-success/30 hover:bg-success/5'
                                    }`}
                            >
                                {preview ? (
                                    <>
                                        <img src={preview} alt="Crop preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-medium border border-white/20">
                                                Change Photo
                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center p-8">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-success mb-4 transition-transform group-hover:scale-110">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-white font-semibold mb-1">Click to upload photo</span>
                                        <span className="text-muted text-xs">JPG, PNG or WEBP (Max 10MB)</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>

                            <Button
                                fullWidth
                                size="lg"
                                disabled={!image || analyzing}
                                loading={analyzing}
                                onClick={handleAnalyze}
                                className="shadow-glow-olive h-14 text-lg"
                            >
                                {analyzing ? 'Analyzing Crop Health...' : 'Start AI Scan'}
                            </Button>
                        </div>
                    </Card>

                    {/* Result Section */}
                    <AnimatePresence mode="wait">
                        {diagnosis ? (
                            <motion.div
                                key="diagnosis"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card padding="lg" className="border-success/20 bg-success/5 h-full">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-white font-bold text-xl">Diagnosis Report</h2>
                                    </div>
                                    <div className="prose prose-invert prose-sm max-w-none text-muted leading-relaxed">
                                        <div className="whitespace-pre-wrap">
                                            {diagnosis}
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-earth-border">
                                        <p className="text-[10px] text-muted text-center italic">
                                            AI-generated advice should be verified with a local agricultural expert. AgriLease is not liable for outcomes.
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center p-8 border border-earth-border border-dashed rounded-3xl"
                            >
                                <div className="w-20 h-20 rounded-full bg-earth-surface flex items-center justify-center mb-6">
                                    <span className="text-4xl">🌾</span>
                                </div>
                                <h3 className="text-white font-semibold mb-2">Ready to Scan</h3>
                                <p className="text-muted text-sm">Upload a photo to see the AI diagnosis report here.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
}
