'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';
import type { Application, UserRole } from '@/lib/types';

export default function ApplicationsPage() {
    const { user, isLoaded } = useUser();
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole | undefined>(user?.profile?.role as UserRole);

    const fetchApps = async () => {
        if (!user) return;
        setLoading(true);

        // Fetch latest role
        const { data: profileData } = await insforge.database
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const activeRole = (profileData as any)?.role || userRole;
        if (activeRole) setUserRole(activeRole);

        let query;
        if (activeRole === 'landowner') {
            // Get apps for listings owned by this user
            // Note: InsForge doesn't support complex joins in direct SDK calls easily for RLS, 
            // but the API handles the policy we set earlier.
            query = insforge.database
                .from('applications')
                .select('*, listings(*), profiles(*)');
        } else {
            query = insforge.database
                .from('applications')
                .select('*, listings(*), profiles(*)')
                .eq('farmer_id', user.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error) {
            setApps((data as unknown as Application[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isLoaded && user) fetchApps();
    }, [isLoaded, user]);

    const handleStatusUpdate = async (appId: string, newStatus: string) => {
        const { error } = await insforge.database
            .from('applications')
            .update([{ status: newStatus }])
            .eq('id', appId);

        if (!error) {
            fetchApps();
        } else {
            alert('Failed to update application status.');
        }
    };

    if (!isLoaded || loading) return <div className="min-h-screen bg-earth-deep flex items-center justify-center"><div className="w-8 h-8 border-2 border-success border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-earth-deep">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-12 page-transition">
                <div className="mb-10">
                    <h1 className="font-heading font-bold text-4xl text-white mb-2">Lease Applications</h1>
                    <p className="text-muted">
                        {userRole === 'landowner' ? 'Manage incoming requests for your property.' : 'Track the status of your land lease requests.'}
                    </p>
                </div>

                {apps.length === 0 ? (
                    <Card className="text-center py-20">
                        <h3 className="text-white font-semibold text-xl mb-2">No applications yet</h3>
                        <p className="text-muted">Your lease request history will appear here.</p>
                        {userRole === 'farmer' && (
                            <Link href="/listings" className="mt-6 inline-block">
                                <Button>Find Land to Lease</Button>
                            </Link>
                        )}
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {apps.map((app) => (
                            <Card key={app.id} padding="md" className="hover:border-primary-light transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <StatusBadge status={app.status} />
                                            <span className="text-muted text-xs">{new Date(app.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <Link href={`/listings/${app.listing_id}`} className="text-white font-bold text-xl hover:text-success transition-colors">
                                            {app.listings?.title}
                                        </Link>
                                        <p className="text-muted text-sm mt-1">{app.listings?.district}, {app.listings?.state} • {app.listings?.area_size} Acres</p>

                                        <div className="mt-4 p-4 bg-earth-surface/50 rounded-xl border border-earth-border">
                                            <p className="text-xs text-muted uppercase tracking-wider mb-2">{userRole === 'landowner' ? 'Message from Farmer' : 'Your Message'}</p>
                                            <p className="text-white text-sm italic">"{app.message || 'No message provided.'}"</p>
                                        </div>

                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-success font-bold text-sm">
                                                {userRole === 'landowner' ? app.profiles?.full_name?.[0] : (app.listings as any)?.profiles?.full_name?.[0]}
                                            </div>
                                            <span className="text-muted text-sm capitalize">
                                                {userRole === 'landowner' ? `Farmer: ${app.profiles?.full_name}` : `Landowner: ${(app.listings as any)?.profiles?.full_name || 'Verified Landowner'}`}
                                            </span>
                                        </div>
                                    </div>

                                    {userRole === 'landowner' && app.status === 'pending' && (
                                        <div className="flex md:flex-col gap-3">
                                            <Button onClick={() => handleStatusUpdate(app.id, 'accepted')} className="bg-success hover:bg-success/90">
                                                Accept Request
                                            </Button>
                                            <Button variant="outline" onClick={() => handleStatusUpdate(app.id, 'rejected')} className="border-danger text-danger hover:bg-danger hover:text-white">
                                                Reject
                                            </Button>
                                        </div>
                                    )}

                                    {userRole === 'landowner' && app.status === 'accepted' && (
                                        <Button variant="secondary">
                                            Start Negotiation
                                        </Button>
                                    )}

                                    {userRole === 'farmer' && app.status === 'accepted' && (
                                        <Button>
                                            Continue to Contract
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
