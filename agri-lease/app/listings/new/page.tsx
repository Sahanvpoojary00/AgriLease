'use client';
import { useState } from 'react';
import { useUser } from '@insforge/nextjs';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { SOIL_TYPES } from '@/lib/types';
import Link from 'next/link';

export default function NewListingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        pin_code: '',
        state: '',
        district: '',
        area_size: '',
        price_expected: '',
        soil_type: '',
        survey_id: '',
        profit_share_percent: '30',
        legal_terms: '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setUploading(true);

        try {
            // 1. Upload images first
            const uploadedUrls: string[] = [];
            for (const file of images) {
                const { data, error: uploadError } = await insforge.storage
                    .from('listings')
                    .uploadAuto(file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    continue;
                }
                if (data?.url) {
                    uploadedUrls.push(data.url);
                }
            }

            // 2. Insert listing with image URLs
            const { error } = await insforge.database.from('listings').insert([
                {
                    ...form,
                    owner_id: user.id,
                    area_size: parseFloat(form.area_size),
                    price_expected: parseFloat(form.price_expected) || null,
                    profit_share_percent: parseFloat(form.profit_share_percent),
                    status: 'active',
                    image_urls: uploadedUrls,
                },
            ]);

            if (!error) {
                router.push('/dashboard');
            } else {
                console.error('Error creating listing:', error);
                alert('Failed to create listing. Please check your data.');
            }
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-earth-deep">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-10">
                    <Link href="/dashboard" className="text-success text-sm flex items-center gap-1 mb-4 hover:underline">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="font-heading font-bold text-4xl text-white mb-2">List Your Property</h1>
                    <p className="text-muted">Register your agricultural land to connect with reliable farmers.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card padding="lg">
                        <h2 className="font-heading font-semibold text-xl text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-success text-sm">1</span>
                            Basic Information
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Listing Title"
                                placeholder="e.g. Fertile 5-acre plot in Karnal"
                                required
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                            <Textarea
                                label="Land Description"
                                placeholder="Describe the land, water availability, last crop harvested, etc."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="PIN Code"
                                    placeholder="132001"
                                    required
                                    value={form.pin_code}
                                    onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
                                />
                                <Input
                                    label="Survey ID / Khata Number"
                                    placeholder="For verification purposes"
                                    required
                                    value={form.survey_id}
                                    onChange={(e) => setForm({ ...form, survey_id: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card padding="lg">
                        <h2 className="font-heading font-semibold text-xl text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-success text-sm">2</span>
                            Land Specifications
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Total Area"
                                type="number"
                                step="0.1"
                                placeholder="5.0"
                                required
                                suffix="Acres"
                                value={form.area_size}
                                onChange={(e) => setForm({ ...form, area_size: e.target.value })}
                            />
                            <Select
                                label="Soil Type"
                                required
                                options={SOIL_TYPES.map(s => ({ value: s, label: s }))}
                                value={form.soil_type}
                                onChange={(e) => setForm({ ...form, soil_type: e.target.value })}
                                placeholder="Select Soil Type"
                            />
                            <Input
                                label="District"
                                placeholder="Karnal"
                                required
                                value={form.district}
                                onChange={(e) => setForm({ ...form, district: e.target.value })}
                            />
                            <Input
                                label="State"
                                placeholder="Haryana"
                                required
                                value={form.state}
                                onChange={(e) => setForm({ ...form, state: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card padding="lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-heading font-semibold text-xl text-white flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-success text-sm">3</span>
                                Property Images
                            </h2>
                            <p className="text-muted text-xs">Add up to 5 clear photos of the land</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                            {previews.map((src, i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-earth-border group">
                                    <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {previews.length < 5 && (
                                <label className="aspect-square rounded-xl border-2 border-dashed border-earth-border hover:border-success/50 hover:bg-success/5 flex flex-col items-center justify-center cursor-pointer transition-all group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                    <svg className="w-8 h-8 text-muted group-hover:text-success transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-[10px] text-muted font-medium uppercase tracking-wider">Add Photo</span>
                                </label>
                            )}
                        </div>
                    </Card>

                    <Card padding="lg">
                        <h2 className="font-heading font-semibold text-xl text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-success text-sm">4</span>
                            Lease Terms
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Profit Share"
                                type="number"
                                required
                                suffix="%"
                                value={form.profit_share_percent}
                                onChange={(e) => setForm({ ...form, profit_share_percent: e.target.value })}
                                hint="Landowner's share of total crop profit"
                            />
                            <Input
                                label="Base Rent (Optional)"
                                type="number"
                                placeholder="0"
                                suffix="/Year"
                                value={form.price_expected}
                                onChange={(e) => setForm({ ...form, price_expected: e.target.value })}
                            />
                        </div>
                        <div className="mt-6">
                            <Textarea
                                label="Custom Legal Terms"
                                placeholder="Any specific rules about water usage, fertilizers, or crop types..."
                                value={form.legal_terms}
                                onChange={(e) => setForm({ ...form, legal_terms: e.target.value })}
                            />
                        </div>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" size="lg" loading={loading} className="px-12">
                            Publish Listing
                        </Button>
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
}

