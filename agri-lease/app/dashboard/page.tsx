'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ListingCard } from '@/components/listings/ListingCard';
import type { Listing, Application, Contract, UserRole } from '@/lib/types';

export default function DashboardPage() {
    const { user, isLoaded } = useUser();

    const [listings, setListings] = useState<Listing[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);

            // Explicitly fetch user profile to ensure we have the latest role/data
            const { data: profileData } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            const userRole = (profileData as any)?.role as UserRole | undefined;

            if (userRole === 'landowner') {
                const { data: listData } = await insforge.database
                    .from('listings')
                    .select('*')
                    .eq('owner_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(6);
                setListings((listData as Listing[]) || []);
            } else if (userRole === 'farmer') {
                const { data: appData } = await insforge.database
                    .from('applications')
                    .select('*, listings(*)')
                    .eq('farmer_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);
                setApplications((appData as Application[]) || []);
            }

            const { data: contractData } = await insforge.database
                .from('contracts')
                .select('*, listings(*)')
                .or(`farmer_id.eq.${user.id},landowner_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(5);
            setContracts((contractData as Contract[]) || []);

            if (profileData) {
                setProfile(profileData);
            }

            setLoading(false);
        };

        fetchData();
    }, [user]);

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-earth-deep flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-success border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const profileData = profile || user?.profile;
    const profileName = profileData?.full_name || user?.email?.split('@')[0] || 'User';
    const activeRole = profileData?.role as UserRole | undefined;

    return (
        <div className="min-h-screen bg-earth-deep">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-transition">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <p className="text-muted text-sm mb-1">Good day,</p>
                        <h1 className="font-heading font-bold text-3xl text-white">
                            {profileName} 👋
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-success text-xs font-medium capitalize border border-success/20">
                                {activeRole || 'Complete your profile'}
                            </span>
                            {!activeRole && (
                                <Link href="/profile" className="text-sand text-xs hover:underline">→ Set your role</Link>
                            )}
                        </div>
                    </div>
                    {activeRole === 'landowner' && (
                        <Link href="/listings/new">
                            <Button icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            }>
                                List New Property
                            </Button>
                        </Link>
                    )}
                    {activeRole === 'farmer' && (
                        <Link href="/listings">
                            <Button icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }>
                                Find Land to Lease
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    {activeRole === 'landowner' ? (
                        <>
                            <StatCard value={listings.length} label="My Listings" color="text-success" />
                            <StatCard value={listings.filter(l => l.status === 'active').length} label="Active" color="text-success" />
                            <StatCard value={listings.filter(l => l.status === 'leased').length} label="Leased" color="text-sand" />
                            <StatCard value={contracts.filter(c => c.status === 'active').length} label="Contracts" color="text-blue-400" />
                        </>
                    ) : (
                        <>
                            <StatCard value={applications.length} label="Applications" color="text-success" />
                            <StatCard value={applications.filter(a => a.status === 'pending').length} label="Pending" color="text-warning" />
                            <StatCard value={applications.filter(a => a.status === 'accepted').length} label="Accepted" color="text-success" />
                            <StatCard value={contracts.filter(c => c.status === 'active').length} label="Active Leases" color="text-sand" />
                        </>
                    )}
                    <Link href="/crop-doctor">
                        <Card padding="sm" hover className="border-success/20 bg-success/5 h-full flex flex-col justify-center">
                            <p className="font-heading font-bold text-3xl">🩺</p>
                            <p className="text-success text-sm font-semibold mt-1">Crop Doctor AI</p>
                        </Card>
                    </Link>
                </div>

                {/* Landowner: My Listings */}
                {activeRole === 'landowner' && (
                    <section className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-heading font-semibold text-xl text-white">My Listings</h2>
                            <Link href="/listings" className="text-success text-sm hover:underline">View all</Link>
                        </div>
                        {listings.length === 0 ? (
                            <EmptyState
                                title="No listings yet"
                                desc="Start by listing your first property to connect with farmers."
                                cta={{ href: '/listings/new', label: 'Create Listing' }}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {listings.map(l => <ListingCard key={l.id} listing={l} />)}
                            </div>
                        )}
                    </section>
                )}

                {/* Farmer: My Applications */}
                {activeRole === 'farmer' && (
                    <section className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-heading font-semibold text-xl text-white">My Applications</h2>
                            <Link href="/applications" className="text-success text-sm hover:underline">View all</Link>
                        </div>
                        {applications.length === 0 ? (
                            <EmptyState
                                title="No applications yet"
                                desc="Browse available land listings and submit your first lease application."
                                cta={{ href: '/listings', label: 'Browse Listings' }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {applications.map(app => (
                                    <Card key={app.id} hover>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-medium">{app.listings?.title || 'Unknown Listing'}</p>
                                                <p className="text-muted text-sm mt-0.5">
                                                    {app.listings?.district}, {app.listings?.state} • PIN {app.listings?.pin_code}
                                                </p>
                                            </div>
                                            <StatusBadge status={app.status} />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Contracts */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading font-semibold text-xl text-white">Recent Contracts</h2>
                        <Link href="/contracts" className="text-success text-sm hover:underline">View all</Link>
                    </div>
                    {contracts.length === 0 ? (
                        <Card>
                            <p className="text-muted text-center py-6">No contracts yet. Complete a lease application to generate your first smart contract.</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {contracts.map(c => (
                                <Link key={c.id} href={`/contracts/${c.id}`}>
                                    <Card hover className="mb-0">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-medium">{c.listings?.title || 'Contract'}</p>
                                                <p className="text-muted text-sm mt-0.5">
                                                    {c.lease_start} → {c.lease_end} • {c.profit_share_percent}% profit share
                                                </p>
                                            </div>
                                            <StatusBadge status={c.status} />
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
    return (
        <Card padding="sm">
            <p className={`font-heading font-bold text-3xl ${color}`}>{value}</p>
            <p className="text-muted text-sm mt-1">{label}</p>
        </Card>
    );
}

function EmptyState({ title, desc, cta }: { title: string; desc: string; cta: { href: string; label: string } }) {
    return (
        <Card className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-earth-surface flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">{title}</h3>
            <p className="text-muted text-sm mb-5">{desc}</p>
            <Link href={cta.href}>
                <Button size="sm">{cta.label}</Button>
            </Link>
        </Card>
    );
}
