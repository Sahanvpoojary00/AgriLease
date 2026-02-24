'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import type { Diagnosis } from '@/lib/types';

export default function CropDoctorPage() {
    const { user, isLoaded } = useUser();
    const [symptoms, setSymptoms] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [report, setReport] = useState<Partial<Diagnosis> | null>(null);
    const [analyzeError, setAnalyzeError] = useState<string | null>(null);
    const [history, setHistory] = useState<Diagnosis[]>([]);
    const [fetchingHistory, setFetchingHistory] = useState(true);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        if (!user) return;
        setFetchingHistory(true);
        const { data } = await insforge.database
            .from('diagnoses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (data) setHistory(data as Diagnosis[]);
        setFetchingHistory(false);
    };

    const handleAnalyze = async () => {
        if (!symptoms.trim() || !user) return;
        setAnalyzing(true);
        setReport(null);
        setAnalyzeError(null);

        try {
            const res = await fetch('/api/analyze-crop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: symptoms, userId: user.id }),
            });

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Server error — please check your API key or endpoint.');
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Analysis failed');

            setReport(data);
            await fetchHistory();
            window.scrollTo({ top: 300, behavior: 'smooth' });

        } catch (error) {
            console.error('AI Error:', error);
            setAnalyzeError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleHistoryClick = (diagnosis: Diagnosis) => {
        setReport(diagnosis);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    if (!isLoaded) return (
        <div className="min-h-screen bg-earth-deep flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-earth-deep text-slate-200 selection:bg-emerald-500/30">
            <Navbar />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-900/10 blur-[150px] rounded-full" />
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-emerald-500/[0.03] blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 pt-32 pb-40 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <header className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md mb-8"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">Agricultural AI Specialist v3</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none"
                        >
                            Agri<span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-600">Doctor</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed"
                        >
                            Advanced clinical analysis for your crops. Describe symptoms in natural language for a localized treatment protocol.
                        </motion.p>
                    </header>

                    {/* Main Interaction Area */}
                    <div className="space-y-12">
                        {/* Input Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="p-1 rounded-[3rem] border-earth-border bg-earth-card backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="p-10 relative z-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-glow-emerald/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tight">Consultation Log</h3>
                                            <p className="text-emerald-500/40 text-[10px] uppercase font-black tracking-[0.3em] leading-none mt-1">Symptom Observation Interface</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="relative">
                                            <textarea
                                                value={symptoms}
                                                onChange={(e) => setSymptoms(e.target.value)}
                                                placeholder="Describe symptoms in detail... (e.g., 'Lower tomato leaves have circular yellow spots with dark concentric rings. Stems show brown sunken lesions.')"
                                                className="w-full h-80 p-8 rounded-[2.5rem] bg-black/40 border border-emerald-500/10 text-emerald-50 text-xl font-medium placeholder:text-emerald-500/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all resize-none leading-relaxed shadow-inner"
                                            />
                                            <div className="absolute bottom-8 right-10 text-[10px] font-black text-emerald-500/20 uppercase tracking-[0.2em]">
                                                {symptoms.length} Characters
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {['Yellowing', 'Wilting', 'Spots', 'Browning', 'Curling', 'Stunted'].map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => setSymptoms(prev => prev ? `${prev}, ${tag}` : tag)}
                                                    className="px-5 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400/60 font-black uppercase tracking-widest hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 transition-all"
                                                >
                                                    + {tag}
                                                </button>
                                            ))}
                                        </div>

                                        <Button
                                            fullWidth
                                            size="lg"
                                            disabled={!symptoms.trim() || analyzing}
                                            loading={analyzing}
                                            onClick={handleAnalyze}
                                            className="h-24 text-2xl font-black rounded-[2.5rem] shadow-[0_20px_40px_rgba(16,185,129,0.15)] bg-emerald-600 hover:bg-emerald-500 text-white border-none mt-4 transition-all"
                                        >
                                            {analyzing ? 'Processing Pathogens...' : 'Start Clinical Diagnosis'}
                                        </Button>

                                        {analyzeError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-start gap-4 p-6 rounded-[2.5rem] bg-red-500/5 border border-red-500/20"
                                            >
                                                <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0 text-xl">⚠️</div>
                                                <div>
                                                    <p className="text-red-500/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Diagnostic Interface Error</p>
                                                    <p className="text-red-200/80 text-sm font-bold leading-snug">{analyzeError}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Results Section */}
                        <AnimatePresence mode="wait">
                            {report && (
                                <motion.div
                                    key="report-card"
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <Card className="p-10 rounded-[3.5rem] border-earth-border bg-earth-card backdrop-blur-3xl overflow-hidden relative shadow-2xl">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

                                        <div className="flex justify-between items-start mb-16 px-4">
                                            <div className="max-w-[70%]">
                                                <span className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.4em] mb-4 block">Formal AI Diagnosis</span>
                                                <h2 className="text-5xl font-black text-white tracking-tighter mb-2 leading-none">{report.plant_name}</h2>
                                                <p className="text-emerald-200/60 text-2xl font-bold tracking-tight">{report.disease_name}</p>
                                            </div>
                                            <div className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border shadow-glow-emerald/10 ${report.is_healthy
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                }`}>
                                                {report.is_healthy ? 'Optimal Condition' : 'Action Required'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                                            <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-inner group/stat">
                                                <p className="text-[10px] text-emerald-500/40 uppercase font-black tracking-[0.2em] mb-3">AI Confidence</p>
                                                <p className="text-5xl font-black text-white tracking-tighter leading-none">{Math.round((report.confidence || 0) * 100)}%</p>
                                            </div>
                                            <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-inner">
                                                <p className="text-[10px] text-emerald-500/40 uppercase font-black tracking-[0.2em] mb-3">Priority Level</p>
                                                <p className={`text-5xl font-black tracking-tighter leading-none ${report.is_healthy ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    {report.is_healthy ? 'None' : 'Urgent'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            <div>
                                                <h4 className="flex items-center gap-4 text-white text-[11px] font-black uppercase tracking-[0.4em] mb-8">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                                    Prescribed Clinical protocol
                                                </h4>
                                                <div className="bg-white/[0.03] rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500/50" />
                                                    <p className="text-emerald-50/80 text-xl leading-relaxed font-semibold italic text-justify pr-4">
                                                        "{report.treatment_suggestions}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-16 text-center border-t border-earth-border pt-10">
                                            <p className="text-[10px] text-emerald-500/20 font-black uppercase tracking-[0.5em] mb-2">
                                                Clinical Signature: LLM-AGRI-{user?.id.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* History Archive */}
                        <section className="mt-40 border-t border-emerald-500/10 pt-32">
                            <div className="flex items-end justify-between mb-24 px-8">
                                <div>
                                    <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Archives</h2>
                                    <p className="text-emerald-500/40 text-[12px] font-black uppercase tracking-[0.6em] mt-4">Verified Case History</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-emerald-500/10 font-black text-9xl leading-none select-none tracking-tighter">{history.length}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {fetchingHistory ? (
                                    [1, 2].map(i => <div key={i} className="h-64 bg-white/[0.02] border border-white/5 rounded-[3rem] animate-pulse" />)
                                ) : history.length > 0 ? (
                                    history.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            whileHover={{ y: -10, scale: 1.02 }}
                                            onClick={() => handleHistoryClick(item)}
                                            className="cursor-pointer group"
                                        >
                                            <Card className="p-10 bg-earth-card border-earth-border hover:border-emerald-500/30 transition-all rounded-[3rem] relative overflow-hidden h-full flex flex-col justify-between group shadow-xl">
                                                <div>
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div>
                                                            <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mb-2">{item.plant_name}</p>
                                                            <h4 className="text-white font-black text-2xl truncate tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{item.disease_name}</h4>
                                                        </div>
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-glow-emerald/5 ${item.is_healthy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                            }`}>
                                                            {item.is_healthy ? '✓' : '!'}
                                                        </div>
                                                    </div>

                                                    <p className="text-slate-500 text-sm font-semibold line-clamp-3 mb-10 leading-relaxed italic pr-4">
                                                        "{item.treatment_suggestions}"
                                                    </p>
                                                </div>

                                                <div className="flex justify-between items-center pt-8 border-t border-white/5 text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                                    <span className="group-hover:text-emerald-500 transition-colors tracking-[0.2em]">{Math.round((item.confidence || 0) * 100)}% Match</span>
                                                    <span className="opacity-40">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[4rem]">
                                        <div className="text-4xl mb-6 opacity-20">🌿</div>
                                        <p className="text-emerald-500/20 font-black uppercase tracking-[0.8em] text-sm">ARCHIVE EMPTY</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
