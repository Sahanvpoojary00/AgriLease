'use client';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@insforge/nextjs';
import { useUser } from '@insforge/nextjs';
import { useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';

export function Navbar() {
    const { user, isLoaded } = useUser();
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
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/listings', label: 'Find Land' },
        { href: '/applications', label: 'My Applications' },
        { href: '/contracts', label: 'Contracts' },
        { href: '/crop-doctor', label: 'Crop Doctor' },
    ];

    const landownerLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/listings/new', label: 'List Property' },
        { href: '/applications', label: 'Applications' },
        { href: '/contracts', label: 'Contracts' },
        { href: '/crop-doctor', label: 'Crop Doctor' },
    ];

    const navLinks = role === 'landowner' ? landownerLinks : role === 'farmer' ? farmerLinks : [];

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
                        </div>
                    )}

                    {/* Auth Controls */}
                    <div className="flex items-center gap-3">
                        <SignedOut>
                            <Link
                                href="/"
                                className="hidden sm:block text-sm font-medium text-muted hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <SignInButton>
                                <button className="px-4 py-2 rounded-lg bg-gradient-green text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-glow-olive">
                                    Get Started
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
