'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@insforge/nextjs';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const roleOptions = [
    { value: 'farmer', label: '🌾 Farmer – I want to lease land for farming' },
    { value: 'landowner', label: '🏡 Landowner – I want to list my land for lease' },
];

const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'mr', label: 'Marathi' },
    { value: 'bn', label: 'Bengali' },
    { value: 'kn', label: 'Kannada' },
    { value: 'pa', label: 'Punjabi' },
];

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        full_name: '',
        username: '',
        phone: '',
        role: '',
        language: 'en',
        website: '',
    });

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data, error } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (data) {
                setForm({
                    full_name: (data as any).full_name || '',
                    username: (data as any).username || '',
                    phone: (data as any).phone || '',
                    role: (data as any).role || '',
                    language: (data as any).language || 'en',
                    website: (data as any).website || '',
                });
            } else if (user.profile) {
                setForm({
                    full_name: (user.profile as Record<string, unknown>).full_name as string || '',
                    username: (user.profile as Record<string, unknown>).username as string || '',
                    phone: (user.profile as Record<string, unknown>).phone as string || '',
                    role: (user.profile as Record<string, unknown>).role as string || '',
                    language: (user.profile as Record<string, unknown>).language as string || 'en',
                    website: (user.profile as Record<string, unknown>).website as string || '',
                });
            }
        };

        fetchProfile();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await insforge.database
                .from('profiles')
                .upsert([{ ...form, id: user.id, updated_at: new Date().toISOString() }]);
            if (!error) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            }
        } finally {
            setSaving(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-earth-deep flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-success border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-earth-deep">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 page-transition">
                <div className="mb-8">
                    <h1 className="font-heading font-bold text-3xl text-white mb-2">Your Profile</h1>
                    <p className="text-muted">Complete your profile to access all AgriLease features.</p>
                </div>

                {success && (
                    <div className="bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Profile saved! Redirecting to dashboard...
                    </div>
                )}

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-white/80">
                                I am a <span className="text-danger">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {roleOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, role: opt.value }))}
                                        className={`text-left px-4 py-3.5 rounded-xl border transition-all ${form.role === opt.value
                                            ? 'border-success bg-success/10 text-white'
                                            : 'border-earth-border bg-earth-surface text-muted hover:border-primary-light hover:text-white'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                placeholder="Ravi Kumar"
                                value={form.full_name}
                                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                required
                            />
                            <Input
                                label="Username"
                                placeholder="ravikumar09"
                                value={form.username}
                                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            />
                            <Select
                                label="Preferred Language"
                                options={languageOptions}
                                value={form.language}
                                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                            />
                        </div>

                        <Input
                            label="Account Email"
                            value={user?.email || ''}
                            disabled
                            hint="Email cannot be changed here"
                        />

                        <Button type="submit" loading={saving} fullWidth size="lg">
                            Save Profile & Continue
                        </Button>
                    </form>
                </Card>
            </main>
        </div>
    );
}
