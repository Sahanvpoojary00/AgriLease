'use client';

import { useState, useEffect, use } from 'react';
import { useUser } from '@insforge/nextjs';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { Product, Profile } from '@/lib/types';
import Link from 'next/link';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [form, setForm] = useState({
        delivery_address: '',
        phone_number: ''
    });

    useEffect(() => {
        if (id) fetchProduct();
        if (user) fetchProfile();
    }, [id, user]);

    const fetchProduct = async () => {
        const { data } = await insforge.database
            .from('products')
            .select('*, vendor:profiles(*)')
            .eq('id', id)
            .single();
        if (data) setProduct(data as any);
        setLoading(false);
    };

    const fetchProfile = async () => {
        const { data } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();
        if (data) {
            setForm({
                delivery_address: `${data.district || ''}, ${data.state || ''} - ${data.pin_code || ''}`,
                phone_number: data.phone || ''
            });
        }
    };

    const handleOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !product) return;
        setSubmitting(true);

        const { error } = await insforge.database
            .from('orders')
            .insert([{
                buyer_id: user.id,
                vendor_id: product.vendor_id,
                product_id: product.id,
                quantity,
                total_price: product.price * quantity,
                delivery_address: form.delivery_address,
                phone_number: form.phone_number,
                status: 'Pending'
            }]);

        if (!error) {
            alert('Order placed successfully!');
            router.push('/dashboard');
        } else {
            alert('Failed to place order. Please try again.');
        }
        setSubmitting(false);
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-earth-deep flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) return <div>Product not found</div>;

    return (
        <div className="min-h-screen bg-earth-deep text-slate-200">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-24">
                <header className="mb-12">
                    <Link href="/market" className="text-emerald-500 text-sm font-bold hover:underline mb-4 block">← Back to Market</Link>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Complete Your <span className="text-emerald-500">Order</span></h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Summary */}
                    <div className="space-y-8">
                        <Card className="p-8 rounded-[2.5rem] bg-earth-card border-earth-border">
                            <div className="aspect-square rounded-2xl bg-emerald-500/10 mb-6 overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">{product.name}</h2>
                            <p className="text-emerald-500/60 text-xs font-black uppercase tracking-widest mb-4">Vendor: {product.vendor?.shop_name || product.vendor?.full_name}</p>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">{product.description}</p>
                            <div className="flex justify-between items-center py-6 border-t border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Unit Price</span>
                                <span className="text-2xl font-black text-white">₹{product.price}</span>
                            </div>
                        </Card>
                    </div>

                    {/* Order Form */}
                    <div>
                        <Card className="p-8 rounded-[2.5rem] bg-emerald-950/10 border-emerald-500/20 shadow-glow-emerald/5">
                            <form onSubmit={handleOrder} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Quantity</label>
                                    <div className="flex items-center gap-4">
                                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-xl hover:bg-white/5">-</button>
                                        <span className="text-xl font-black w-12 text-center">{quantity}</span>
                                        <button type="button" onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-xl hover:bg-white/5">+</button>
                                    </div>
                                </div>

                                <Input
                                    label="Delivery Address"
                                    placeholder="Enter your full address"
                                    value={form.delivery_address}
                                    onChange={e => setForm({ ...form, delivery_address: e.target.value })}
                                    required
                                />

                                <Input
                                    label="Phone Number"
                                    placeholder="+91 98765 43210"
                                    value={form.phone_number}
                                    onChange={e => setForm({ ...form, phone_number: e.target.value })}
                                    required
                                />

                                <div className="pt-6 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                                        <span className="text-3xl font-black text-white">₹{product.price * quantity}</span>
                                    </div>
                                    <Button type="submit" loading={submitting} fullWidth size="lg" className="rounded-2xl h-16 text-sm font-black uppercase tracking-[0.2em] bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald/20">
                                        Confirm & Place Order
                                    </Button>
                                    <p className="text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">Pay on delivery to the vendor directly</p>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
