'use client';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@insforge/nextjs';
import { useUser } from '@insforge/nextjs';
import { useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';

import { useLanguage } from '@/components/providers/LanguageProvider';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function Navbar() {
    const { user, isLoaded } = useUser();
    const { t } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | undefined>(user?.profile?.role as string);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data, error } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (data) {
                if (data.role) {
                    setUserRole(data.role);
                }
            }
        };

        fetchProfile();
    }, [user]);

    const role = userRole;

    const farmerLinks = [
        { href: '/dashboard', label: t('nav.dashboard') },
        { href: '/listings', label: t('nav.findLand') },
        { href: '/applications', label: t('nav.myApplications') },
        { href: '/contracts', label: t('nav.contracts') },
    ];

    const landownerLinks = [
        { href: '/dashboard', label: t('nav.dashboard') },
        { href: '/listings/new', label: t('nav.listProperty') },
        { href: '/applications', label: t('nav.applications') },
        { href: '/contracts', label: t('nav.contracts') },
    ];

    const vendorLinks = [
        { href: '/dashboard', label: t('nav.dashboard') },
        { href: '/market', label: t('nav.agriMarket') },
    ];

    const navLinks = role === 'landowner' ? landownerLinks : role === 'farmer' ? farmerLinks : role === 'vendor' ? vendorLinks : [];

    return (
        <nav className="sticky top-0 z-50 border-b border-earth-border glass-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 flex items-center justify-center group-hover:drop-shadow-glow transition-all">
                            <img src="/brand/logo.png" alt="AgriLease Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-heading font-bold text-xl text-white">
                            Agri<span className="text-success">Lease</span>
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    {isLoaded && navLinks.length > 0 && (
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-white hover:bg-earth-card transition-all duration-200"
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Specialized Features */}
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-earth-border">
                                <Link href="/crop-doctor">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest hover:bg-emerald-500/20 hover:shadow-glow-emerald/20 hover:scale-105 transition-all">
                                        <span className="text-base">🩺</span>
                                        {t('nav.cropDoctor')}
                                    </button>
                                </Link>
                                <Link href="/market">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 text-white text-xs font-black uppercase tracking-widest shadow-glow-emerald/30 hover:shadow-glow-emerald/50 hover:scale-105 transition-all">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {t('nav.agriMarket')}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Auth Controls & Language */}
                    <div className="flex items-center gap-3">
                        <div className="mr-2">
                            <LanguageSelector />
                        </div>
                        <SignedOut>
                            <Link
                                href="/"
                                className="hidden sm:block text-sm font-medium text-muted hover:text-white transition-colors"
                            >
                                {t('nav.signIn')}
                            </Link>
                            <SignInButton>
                                <button className="px-4 py-2 rounded-lg bg-gradient-green text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-glow-olive">
                                    {t('nav.getStarted')}
                                </button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            <Link
                                href="/profile"
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-white hover:bg-earth-card transition-all"
                            >
                                <span className="text-xs bg-primary/30 text-success px-2 py-0.5 rounded-full font-medium capitalize">
                                    {role || 'user'}
                                </span>
                            </Link>
                            <UserButton />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </nav>
    );
}
