'use client';
import { useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ListingCard } from '@/components/listings/ListingCard';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SOIL_TYPES, type Listing } from '@/lib/types';

export default function BrowseListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        pin_code: '',
        soil_type: '',
        min_acres: '',
    });

    const fetchListings = async () => {
        setLoading(true);
        let query = insforge.database.from('listings').select('*').eq('status', 'active');

        if (filter.pin_code) {
            query = query.eq('pin_code', filter.pin_code);
        }
        if (filter.soil_type) {
            query = query.eq('soil_type', filter.soil_type);
        }
        if (filter.min_acres) {
            query = query.gte('area_size', parseFloat(filter.min_acres));
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error) {
            setListings((data as Listing[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchListings();
    };

    return (
        <div className="min-h-screen bg-earth-deep">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="font-heading font-bold text-4xl text-white mb-2">Find Land to Lease</h1>
                        <p className="text-muted">Browse verified agricultural plots within your proximity.</p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <form onSubmit={handleSearch} className="bg-earth-card border border-earth-border rounded-2xl p-6 mb-12 shadow-card">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <Input
                            label="PIN Code"
                            placeholder="e.g. 110001"
                            value={filter.pin_code}
                            onChange={(e) => setFilter({ ...filter, pin_code: e.target.value })}
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                        />
                        <Select
                            label="Soil Type"
                            options={SOIL_TYPES.map(s => ({ value: s, label: s }))}
                            placeholder="Any Soil Type"
                            value={filter.soil_type}
                            onChange={(e) => setFilter({ ...filter, soil_type: e.target.value })}
                        />
                        <Input
                            label="Min Acres"
                            type="number"
                            placeholder="0"
                            value={filter.min_acres}
                            onChange={(e) => setFilter({ ...filter, min_acres: e.target.value })}
                            suffix="Acres"
                        />
                        <Button type="submit" fullWidth size="lg" loading={loading}>
                            Apply Filters
                        </Button>
                    </div>
                </form>

                {/* Listings Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-earth-card border border-earth-border rounded-2xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} showApply />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-earth-surface/50 rounded-3xl border border-dashed border-earth-border">
                        <div className="w-16 h-16 rounded-full bg-earth-card flex items-center justify-center mx-auto mb-4 text-muted">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold text-xl mb-2">No lands found</h3>
                        <p className="text-muted max-w-sm mx-auto">
                            We couldn't find any land matching your filters. Try adjusting your PIN code or soil type.
                        </p>
                        <Button variant="outline" className="mt-6" onClick={() => setFilter({ pin_code: '', soil_type: '', min_acres: '' })}>
                            Clear All Filters
                        </Button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
