'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Profile } from '@/lib/types';
import Link from 'next/link';

export default function MarketPage() {
    const { user, isLoaded } = useUser();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [pinFilter, setPinFilter] = useState('');
    const [userProfile, setUserProfile] = useState<Profile | null>(null);

    const categories = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Tools'];

    useEffect(() => {
        fetchProducts();
        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        const { data } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .maybeSingle();
        if (data) {
            setUserProfile(data as Profile);
            setPinFilter(data.pin_code || '');
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await insforge.database
            .from('products')
            .select(`
                *,
                vendor:profiles(*)
            `)
            .order('created_at', { ascending: false });

        if (data) setProducts(data as any[]);
        setLoading(false);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesPin = !pinFilter ||
            product.pin_code === pinFilter ||
            product.pin_code?.startsWith(pinFilter.substring(0, 3));
        const isVerifiedVendor = product.vendor?.is_verified;
        return matchesSearch && matchesCategory && matchesPin && isVerifiedVendor;
    });

    return (
        <div className="min-h-screen bg-earth-deep text-slate-200">
            <Navbar />

            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-900/10 blur-[150px] rounded-full" />
            </div>

            <main className="relative z-10 pt-32 pb-40 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <header className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md mb-8"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">Integrated Marketplace v1.0</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
                            Buy Agricultural <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-600">Essentials</span> Near You
                        </h1>
                        <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">
                            Browse products listed by verified local vendors and place orders directly.
                        </p>
                    </header>

                    {/* Filters Section */}
                    <div className="flex flex-col lg:flex-row gap-6 mb-16 items-center justify-between">
                        <div className="w-full lg:max-w-md relative group">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-earth-card border border-earth-border text-white placeholder:text-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all shadow-xl"
                            />
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full lg:w-auto px-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat
                                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-glow-emerald/20'
                                        : 'bg-earth-card text-emerald-500/60 border-earth-border hover:border-emerald-500/30'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="w-full lg:w-48 relative">
                            <input
                                type="text"
                                placeholder="PIN Code"
                                value={pinFilter}
                                onChange={(e) => setPinFilter(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 rounded-xl bg-earth-card border border-earth-border text-white placeholder:text-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40">📍</span>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {loading ? (
                            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-96 bg-earth-card border border-earth-border rounded-[2.5rem] animate-pulse" />
                            ))
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -8 }}
                                    className="group"
                                >
                                    <Card className="h-full rounded-[2.5rem] bg-earth-card border-earth-border hover:border-emerald-500/30 transition-all shadow-2xl relative">
                                        {/* Product Image */}
                                        <div className="h-56 relative bg-emerald-950/20 overflow-hidden">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                                            )}
                                            {(userProfile?.pin_code === product.pin_code || (userProfile?.pin_code && product.pin_code && userProfile.pin_code.substring(0, 3) === product.pin_code.substring(0, 3))) && (
                                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                    {userProfile?.pin_code === product.pin_code ? 'Same PIN' : 'Nearby'}
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                                {product.category}
                                            </div>
                                        </div>

                                        <div className="p-8 flex-grow flex flex-col">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-black text-white tracking-tight mb-1 truncate">{product.name}</h3>
                                                <p className="text-emerald-500/40 text-[10px] uppercase font-black tracking-widest">By {product.vendor?.shop_name || product.vendor?.full_name || 'Verified Vendor'}</p>
                                            </div>

                                            <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">
                                                {product.description || 'Professional grade agricultural essential for optimal crop growth and yield.'}
                                            </p>

                                            <div className="mt-auto">
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className="text-3xl font-black text-white tracking-tighter">₹{product.price}</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${product.stock_quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {product.stock_quantity > 0 ? `${product.stock_quantity} In Stock` : 'Out of Stock'}
                                                    </span>
                                                </div>

                                                <Link href={`/market/checkout/${product.id}`}>
                                                    <Button
                                                        fullWidth
                                                        disabled={product.stock_quantity <= 0}
                                                        className="rounded-2xl h-14 text-xs font-black uppercase tracking-[0.2em] bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-glow-emerald/10"
                                                    >
                                                        Place Order
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-40 text-center">
                                <div className="text-6xl mb-6 opacity-20">🚜</div>
                                <h3 className="text-white font-black text-3xl mb-2 tracking-tighter">No Products Found</h3>
                                <p className="text-emerald-500/40 text-[10px] font-black uppercase tracking-[0.5em]">Try adjusting your filters or search terms</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
