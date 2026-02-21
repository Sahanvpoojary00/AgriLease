'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';
import type { Contract, UserRole } from '@/lib/types';

export default function ContractsPage() {
    const { user, isLoaded } = useUser();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const role = user?.profile?.role as UserRole | undefined;

    useEffect(() => {
        const fetchContracts = async () => {
            if (!user) return;
            setLoading(true);

            const { data, error } = await insforge.database
                .from('contracts')
                .select('*, listings(*), profiles(*)')
                .or(`farmer_id.eq.${user.id},landowner_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (!error) {
                setContracts((data as unknown as Contract[]) || []);
            }
            setLoading(false);
        };

        if (isLoaded) fetchContracts();
    }, [isLoaded, user]);

    if (!isLoaded || loading) return <div className="min-h-screen bg-earth-deep flex items-center justify-center"><div className="w-8 h-8 border-2 border-success border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-earth-deep">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-12 page-transition">
                <div className="mb-10">
                    <h1 className="font-heading font-bold text-4xl text-white mb-2">Smart Lease Contracts</h1>
                    <p className="text-muted">Legally secure, digital agreements between farmers and landowners.</p>
                </div>

                {contracts.length === 0 ? (
                    <Card className="text-center py-20 bg-earth-surface/30">
                        <div className="w-16 h-16 rounded-full bg-earth-card flex items-center justify-center mx-auto mb-4 text-muted">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold text-xl mb-2">No contracts found</h3>
                        <p className="text-muted max-w-sm mx-auto">
                            Once an application is accepted and terms are finalized, your digital contracts will appear here.
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contracts.map((contract) => (
                            <Link key={contract.id} href={`/contracts/${contract.id}`}>
                                <Card hover padding="md" className="h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <StatusBadge status={contract.status} />
                                            <span className="text-muted text-xs capitalize">{contract.status.replace('_', ' ')}</span>
                                        </div>
                                        <h3 className="text-white font-bold text-xl mb-2">{contract.listings?.title}</h3>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted">Lease Period:</span>
                                                <span className="text-white">{contract.lease_start} to {contract.lease_end}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted">Profit Share:</span>
                                                <span className="text-white font-semibold">{contract.profit_share_percent}%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted">Base Rent:</span>
                                                <span className="text-sand">₹{contract.rent_amount || '0'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-earth-border flex items-center justify-between">
                                        <span className="text-muted text-[10px] uppercase tracking-tighter">ID: {contract.id.slice(0, 8)}</span>
                                        <span className="text-success text-sm font-medium">View Agreement →</span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
