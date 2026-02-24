'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@insforge/nextjs';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { Profile } from '@/lib/types';

const roleOptions = [
    { value: 'farmer', label: '🌾 Farmer – I want to lease land for farming' },
    { value: 'landowner', label: '🏡 Landowner – I want to list my land for lease' },
    { value: 'vendor', label: '🏪 Vendor – I want to sell agricultural products' },
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
    const [detecting, setDetecting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        full_name: '',
        username: '',
        phone: '',
        role: '',
        language: 'en',
        website: '',
        state: '',
        district: '',
        pin_code: '',
        latitude: null as number | null,
        longitude: null as number | null,
        shop_name: '',
        business_address: '',
        is_verified: false,
    });

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (data) {
                const profile = data as Profile;
                setForm({
                    full_name: profile.full_name || '',
                    username: profile.username || '',
                    phone: profile.phone || '',
                    role: profile.role || '',
                    language: profile.language || 'en',
                    website: profile.website || '',
                    state: profile.state || '',
                    district: profile.district || '',
                    pin_code: profile.pin_code || '',
                    latitude: profile.latitude || null,
                    longitude: profile.longitude || null,
                    shop_name: profile.shop_name || '',
                    business_address: profile.business_address || '',
                    is_verified: profile.is_verified || false,
                });
            } else if (user.profile) {
                const p = user.profile as any as Profile;
                setForm({
                    full_name: p.full_name || '',
                    username: p.username || '',
                    phone: p.phone || '',
                    role: p.role || '',
                    language: p.language || 'en',
                    website: p.website || '',
                    state: p.state || '',
                    district: p.district || '',
                    pin_code: p.pin_code || '',
                    latitude: p.latitude || null,
                    longitude: p.longitude || null,
                    shop_name: p.shop_name || '',
                    business_address: p.business_address || '',
                    is_verified: p.is_verified || false,
                });
            }
        };

        fetchProfile();
    }, [user]);

    useEffect(() => {
        const detectPin = async () => {
            if (form.pin_code?.length === 6) {
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${form.pin_code}`);
                    const data = await res.json();
                    if (data?.[0]?.Status === 'Success') {
                        const info = data[0].PostOffice[0];
                        setForm(f => ({
                            ...f,
                            district: info.District,
                            state: info.State
                        }));
                    }
                } catch (err) {
                    console.error('PIN detection error:', err);
                }
            }
        };
        detectPin();
    }, [form.pin_code]);

    const handleDetectLocation = () => {
        setDetecting(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setForm(f => ({
                        ...f,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    }));
                    setDetecting(false);
                    // In a more advanced version, we'd reverse-geocode here
                    alert('Location coordinates detected! Saved for accurate weather reporting.');
                },
                (err) => {
                    console.error(err);
                    setDetecting(false);
                    alert('Could not detect location. Please enter manually.');
                }
            );
        } else {
            setDetecting(false);
            alert('Geolocation not supported by your browser.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please sign in to save your profile.');
            return;
        }

        setSaving(true);
        try {
            const payload: Profile = {
                id: user.id,
                full_name: form.full_name,
                username: form.username,
                phone: form.phone,
                role: form.role as any,
                language: form.language,
                state: form.state,
                district: form.district,
                pin_code: form.pin_code,
                latitude: form.latitude,
                longitude: form.longitude,
                shop_name: form.shop_name,
                business_address: form.business_address,
                is_verified: form.is_verified,
                updated_at: new Date().toISOString(),
                avatar_url: null,
                website: form.website || null
            };

            const { error } = await insforge.database
                .from('profiles')
                .upsert([payload]);

            if (error) {
                console.error('Database Error:', error);
                alert(`Error saving profile: ${error.message} (Code: ${error.code})`);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            }
        } catch (err: any) {
            console.error('Submission crash:', err);
            alert(`Submission failed: ${err.message}`);
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
                    <p className="text-muted">Complete your profile for localized weather and market updates.</p>
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                        {form.role === 'vendor' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 gap-4">
                                    <Input
                                        label="Shop Name"
                                        placeholder="AgriEssentials Store"
                                        value={form.shop_name}
                                        onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))}
                                        required
                                    />
                                    <Input
                                        label="Business Address"
                                        placeholder="123, Market Road, Near City Center"
                                        value={form.business_address}
                                        onChange={e => setForm(f => ({ ...f, business_address: e.target.value }))}
                                        required
                                    />
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                                        <input
                                            type="checkbox"
                                            id="is_verified"
                                            checked={form.is_verified}
                                            onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))}
                                            className="w-5 h-5 rounded border-emerald-500 text-emerald-500 focus:ring-emerald-500"
                                        />
                                        <label htmlFor="is_verified" className="text-sm font-medium text-emerald-400">
                                            Apply for Verified Vendor Status (Self-verify for Demo)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

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

                        {/* Location Header */}
                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-semibold">Your Location</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    loading={detecting}
                                    onClick={handleDetectLocation}
                                    className="text-xs"
                                >
                                    Detect My Location
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="PIN Code"
                                    placeholder="132001"
                                    value={form.pin_code}
                                    onChange={e => setForm(f => ({ ...f, pin_code: e.target.value }))}
                                    required
                                    hint="Type 6 digits to auto-fill"
                                />
                                <Input
                                    label="District"
                                    placeholder="Karnal"
                                    value={form.district}
                                    onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="State"
                                    placeholder="Haryana"
                                    value={form.state}
                                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                                    required
                                />
                            </div>
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
