import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-earth-border bg-earth-deep">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-green flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a10 10 0 0 0-6.88 17.34" />
                                    <path d="M12 2v10" />
                                    <path d="m16.24 7.76-4.24 4.24" />
                                    <path d="M5.17 12H2" />
                                    <path d="M12 22V12" />
                                    <circle cx="12" cy="12" r="2" />
                                </svg>
                            </div>
                            <span className="font-heading font-bold text-xl text-white">
                                Agri<span className="text-success">Lease</span>
                            </span>
                        </div>
                        <p className="text-muted text-sm leading-relaxed max-w-sm">
                            Digitizing agricultural land leasing in India. Connecting landowners with landless farmers through transparent, secure smart contracts.
                        </p>
                        <p className="text-muted/50 text-xs mt-6">
                            © {new Date().getFullYear()} AgriLease. All rights reserved.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
                        <ul className="space-y-2.5">
                            {[
                                { href: '/listings', label: 'Find Land' },
                                { href: '/listings/new', label: 'List Property' },
                                { href: '/dashboard', label: 'Dashboard' },
                                { href: '/contracts', label: 'Smart Contracts' },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-muted text-sm hover:text-success transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
                        <ul className="space-y-2.5">
                            {[
                                { href: '/#how-it-works', label: 'How It Works' },
                                { href: '/#pricing', label: 'Pricing' },
                                { href: '/privacy', label: 'Privacy Policy' },
                                { href: '/terms', label: 'Terms of Service' },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-muted text-sm hover:text-success transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
