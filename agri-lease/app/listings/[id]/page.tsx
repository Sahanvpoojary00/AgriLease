'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import type { Listing } from '@/lib/types';

export default function ListingDetailPage() {
    const { id } = useParams();
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState('');
    const [applied, setApplied] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchListing = async () => {
            const { data, error } = await insforge.database
                .from('listings')
                .select('*, profiles(*)')
                .eq('id', id)
                .maybeSingle();

            if (!error) {
                setListing(data as unknown as Listing);
            }
            setLoading(false);
        };

        if (id) fetchListing();
    }, [id]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !listing) return;
        setApplying(true);

        try {
            const { error } = await insforge.database
                .from('applications')
                .insert([{
                    listing_id: listing.id,
                    farmer_id: user.id,
                    message: message,
                    status: 'pending'
                }]);

            if (!error) {
                setApplied(true);
            } else {
                alert('Failed to submit application.');
            }
        } finally {
            setApplying(false);
        }
    };

    if (loading || !isLoaded) return <div className="min-h-screen bg-earth-deep flex items-center justify-center"><div className="w-8 h-8 border-2 border-success border-t-transparent rounded-full animate-spin" /></div>;
    if (!listing) return <div className="min-h-screen bg-earth-deep text-white flex flex-col items-center justify-center p-4">Listing not found.<Button onClick={() => router.push('/listings')} className="mt-4">Back to Search</Button></div>;

    const isOwner = user?.id === listing.owner_id;

    return (
        <div className="min-h-screen bg-earth-deep">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-transition">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <StatusBadge status={listing.status} />
                                {listing.verified && (
                                    <Badge variant="success" dot>Verified Land</Badge>
                                )}
                            </div>
                            <h1 className="font-heading font-bold text-4xl text-white mb-4">{listing.title}</h1>
                            <div className="flex items-center gap-4 text-muted">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {listing.district}, {listing.state} (PIN: {listing.pin_code})
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <div className="aspect-video bg-earth-surface rounded-3xl border border-earth-border overflow-hidden">
                                {listing.image_urls?.[activeImageIndex] ? (
                                    <img src={listing.image_urls[activeImageIndex]} alt={listing.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-earth-border">
                                        <svg className="w-20 h-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        No images provided
                                    </div>
                                )}
                            </div>

                            {listing.image_urls && listing.image_urls.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {listing.image_urls.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImageIndex(i)}
                                            className={`relative w-24 aspect-square rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIndex === i ? 'border-success' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <section>
                            <h2 className="font-heading font-semibold text-2xl text-white mb-4">Description</h2>
                            <p className="text-muted leading-relaxed whitespace-pre-wrap">{listing.description || 'No description provided.'}</p>
                        </section>

                        {/* Specifications */}
                        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Card padding="sm" className="text-center">
                                <p className="text-success font-bold text-xl">{listing.area_size}</p>
                                <p className="text-muted text-xs uppercase tracking-wider">Acres</p>
                            </Card>
                            <Card padding="sm" className="text-center">
                                <p className="text-sand font-bold text-xl capitalize">{listing.soil_type || 'N/A'}</p>
                                <p className="text-muted text-xs uppercase tracking-wider">Soil Type</p>
                            </Card>
                            <Card padding="sm" className="text-center">
                                <p className="text-white font-bold text-xl">{listing.profit_share_percent}%</p>
                                <p className="text-muted text-xs uppercase tracking-wider">Profit Share</p>
                            </Card>
                            <Card padding="sm" className="text-center">
                                <p className="text-white font-bold text-xl">₹{listing.price_expected || '—'}</p>
                                <p className="text-muted text-xs uppercase tracking-wider">Base Rent</p>
                            </Card>
                        </section>

                        {/* Legal Terms */}
                        {listing.legal_terms && (
                            <section className="bg-earth-surface/40 border border-earth-border rounded-2xl p-6">
                                <h3 className="font-heading font-semibold text-white mb-2">Legal Terms & Conditions</h3>
                                <p className="text-muted text-sm leading-relaxed italic">"{listing.legal_terms}"</p>
                            </section>
                        )}
                    </div>

                    {/* Sidebar / Apply Panel */}
                    <div className="space-y-6">
                        <Card padding="lg" className="sticky top-24">
                            <div className="mb-6">
                                <h3 className="text-muted text-sm font-medium uppercase tracking-widest mb-2">Landowner</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-success font-bold text-xl">
                                        {listing.profiles?.full_name?.[0] || 'L'}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{listing.profiles?.full_name || 'Verified Landowner'}</p>
                                        <p className="text-muted text-xs">Joined {new Date(listing.profiles?.updated_at || '').toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="section-divider my-6" />

                            {isOwner ? (
                                <div className="text-center py-4">
                                    <p className="text-muted text-sm mb-4">This is your listing.</p>
                                    <Button fullWidth variant="secondary" onClick={() => router.push(`/listings/${listing.id}/edit`)}>
                                        Edit Listing
                                    </Button>
                                </div>
                            ) : applied ? (
                                <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
                                    <p className="text-success font-medium mb-1">Application Submitted!</p>
                                    <p className="text-muted text-xs mb-4">The landowner will review your request and contact you shortly.</p>
                                    <Button fullWidth variant="secondary" onClick={() => router.push('/applications')}>
                                        View My Applications
                                    </Button>
                                </div>
                            ) : user?.profile?.role === 'landowner' ? (
                                <div className="text-center p-4">
                                    <p className="text-muted text-sm italic">Switch to a Farmer profile to apply for land leases.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleApply} className="space-y-4">
                                    <h3 className="text-white font-semibold">Lease Application</h3>
                                    <Textarea
                                        placeholder="Introduce yourself and describe your farming experience..."
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                    <Button type="submit" fullWidth size="lg" loading={applying}>
                                        Apply for Lease
                                    </Button>
                                    <p className="text-muted text-[10px] text-center px-4">
                                        By applying, you agree to the platform's terms and will start a smart conversation after landowner approval.
                                    </p>
                                </form>
                            )}
                        </Card>

                        <Card padding="md" className="border-success/20 bg-success/5">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">🛡️</span>
                                <h4 className="text-white font-semibold text-sm">AgriLease Protection</h4>
                            </div>
                            <p className="text-muted text-xs leading-relaxed">
                                Your lease is secured by a smart digital contract once both parties agree. Payments and profit sharing are tracked through our secure gateway.
                            </p>
                        </Card>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
