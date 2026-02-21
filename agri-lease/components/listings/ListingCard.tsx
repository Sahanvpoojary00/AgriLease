import Link from 'next/link';
import { StatusBadge } from '@/components/ui/Badge';
import type { Listing } from '@/lib/types';

interface ListingCardProps {
    listing: Listing;
    showApply?: boolean;
}

export function ListingCard({ listing, showApply = false }: ListingCardProps) {
    const imageUrl = listing.image_urls?.[0];

    return (
        <div className="group bg-earth-card border border-earth-border rounded-2xl overflow-hidden hover:border-primary-light hover:shadow-card transition-all duration-300">
            {/* Image */}
            <div className="relative h-48 bg-earth-surface overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-earth-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                )}
                {/* Verified badge */}
                {listing.verified && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 border border-success/40 text-success text-xs font-medium backdrop-blur-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <StatusBadge status={listing.status} />
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-heading font-semibold text-white text-lg leading-tight mb-1 group-hover:text-success transition-colors line-clamp-1">
                    {listing.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-muted text-sm mb-3">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                        {[listing.district, listing.state].filter(Boolean).join(', ') || listing.pin_code}
                    </span>
                    <span className="text-earth-border">•</span>
                    <span>PIN: {listing.pin_code}</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-earth-surface rounded-xl p-2.5 text-center">
                        <p className="text-white font-bold text-sm">{listing.area_size}</p>
                        <p className="text-muted text-xs">Acres</p>
                    </div>
                    <div className="bg-earth-surface rounded-xl p-2.5 text-center">
                        <p className="text-success font-bold text-sm">{listing.profit_share_percent ?? '—'}%</p>
                        <p className="text-muted text-xs">Profit Share</p>
                    </div>
                    <div className="bg-earth-surface rounded-xl p-2.5 text-center">
                        <p className="text-sand font-bold text-sm capitalize">{listing.soil_type ?? 'N/A'}</p>
                        <p className="text-muted text-xs">Soil</p>
                    </div>
                </div>

                {/* Action */}
                <Link
                    href={`/listings/${listing.id}`}
                    className={`
            block text-center py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
            ${showApply
                            ? 'bg-gradient-green text-white hover:opacity-90 shadow-glow-olive'
                            : 'border border-earth-border text-muted hover:border-primary-light hover:text-white'}
          `}
                >
                    {showApply ? 'Apply to Lease' : 'View Details'}
                </Link>
            </div>
        </div>
    );
}
