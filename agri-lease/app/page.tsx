'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SignInButton } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Counter } from '@/components/animations/Counter';
import { CropGrowth } from '@/components/animations/CropGrowth';
import { Scene3D } from '@/components/animations/Scene3D';
import { RealTimeDashboard } from '@/components/home/RealTimeDashboard';
import type { Listing } from '@/lib/types';

const howItWorksSteps = [
  {
    step: '01',
    title: 'Register & Set Location',
    desc: 'Sign up as a Farmer or Landowner. Enable location to activate PIN-based proximity matching.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'PIN-Based Matching',
    desc: 'Browse verified land listings within your PIN code radius. Filter by soil type, acreage, and profit share.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Smart Negotiation',
    desc: 'Chat directly with the other party. Negotiate lease duration and profit sharing transparently.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Smart Digital Contract',
    desc: 'Auto-generate a tamper-proof lease contract. Both parties sign digitally. Download your copy.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const stats = [
  { value: '5', label: 'Platform Commission (%)', icon: '💰', suffix: '%' },
  { value: '250', label: 'Active Listings', icon: '📍', suffix: '+' },
  { value: '12', label: 'Verified Partners', icon: '📄', suffix: '' },
  { value: '98', label: 'Success Rate (%)', icon: '🌾', suffix: '%' },
];

const features = [
  {
    emoji: '📍',
    title: 'PIN-Based Proximity',
    desc: 'See only lands within your PIN code radius. Sorted by distance, acreage, soil type, and profit share.',
    color: 'from-primary/20 to-transparent',
  },
  {
    emoji: '📄',
    title: 'Smart Digital Contracts',
    desc: 'Auto-generated, tamper-proof contracts. Digital signatures. Timestamped. Downloadable PDF.',
    color: 'from-soil/20 to-transparent',
  },
  {
    emoji: '🌾',
    title: 'Crop Doctor AI',
    desc: 'Get AI-powered crop disease recommendations and fertilizer guidance from photos.',
    color: 'from-success/10 to-transparent',
  },
  {
    emoji: '💬',
    title: 'Smart Negotiation',
    desc: 'Built-in chat for lease negotiation. Profit share slider. Real-time agreement preview.',
    color: 'from-sand/10 to-transparent',
  },
  {
    emoji: '🔒',
    title: 'Verified Listings',
    desc: 'Survey ID verification prevents fake listings. Admin-reviewed properties get a verified badge.',
    color: 'from-primary/20 to-transparent',
  },
  {
    emoji: '🛒',
    title: 'Agri Marketplace',
    desc: 'Buy seeds, fertilizers, and tools from verified vendors. Cart and checkout included.',
    color: 'from-soil/20 to-transparent',
  },
];

export default function LandingPage() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await insforge.database
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          setFeaturedListings(data as Listing[]);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-earth-deep selection:bg-success/30 relative">
      <Navbar />

      {/* Advanced Animation Layers */}
      <Scene3D />
      <CropGrowth />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax & Overlay */}
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale-[20%] brightness-[0.4]"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2000")',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-earth-deep" />
        </motion.div>

        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <motion.div
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-[10%] w-[40rem] h-[40rem] rounded-full bg-success/20 blur-[120px]"
          />
          <motion.div
            animate={{
              y: [0, 30, 0],
              x: [0, -20, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/4 right-[10%] w-[45rem] h-[45rem] rounded-full bg-primary/15 blur-[140px]"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
          <ScrollReveal staggerChildren={0.2}>
            {/* Tag */}
            <motion.div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-success/40 bg-success/15 text-success text-sm font-semibold mb-10 backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping" />
              India&apos;s Smartest Agricultural Ecosystem
            </motion.div>

            {/* Headline */}
            <h1 className="font-heading font-black text-6xl sm:text-8xl lg:text-9xl text-white leading-[0.95] mb-8 tracking-tighter">
              The Future of <br className="hidden sm:block" />
              <span className="gradient-text">Agri-Leasing.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-muted text-xl sm:text-3xl leading-relaxed mb-12 max-w-4xl mx-auto font-light tracking-tight opacity-90">
              Empowering farmers through PIN-proximity matching,
              secure profit sharing, and digital-first contracts.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
              <SignInButton>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(82, 183, 136, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-12 py-6 rounded-[2rem] bg-gradient-green text-white font-black text-2xl transition-all shadow-glow-olive flex items-center justify-center gap-4 group"
                >
                  <span className="group-hover:rotate-12 transition-transform">🚜</span>
                  Find Land
                </motion.button>
              </SignInButton>
              <SignInButton>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-12 py-6 rounded-[2rem] border-2 border-white/20 text-white font-black text-2xl hover:border-success/50 transition-all flex items-center justify-center gap-4"
                >
                  <span>📋</span>
                  List Property
                </motion.button>
              </SignInButton>
            </div>

            {/* Real-time Data Panel */}
            <div className="max-w-4xl mx-auto mt-12 mb-10">
              <RealTimeDashboard />
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-muted/50 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-bold tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-muted/50 to-transparent" />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <ScrollReveal key={i} animation="zoom-in" delay={i * 0.1} className="text-center group">
                <div className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-500">{stat.icon}</div>
                <div className="text-success font-heading font-black text-5xl mb-2 flex justify-center items-baseline">
                  <Counter value={stat.value} />
                  <span className="text-2xl ml-1">{stat.suffix}</span>
                </div>
                <div className="text-muted/60 text-xs font-bold tracking-[0.2em] uppercase">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-48 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-20">
        <ScrollReveal className="text-center mb-24">
          <p className="text-success text-sm font-black tracking-[0.3em] uppercase mb-6">Master the Platform</p>
          <h2 className="font-heading font-black text-6xl md:text-8xl text-white tracking-tighter leading-none mb-4">
            Four Steps to <br className="hidden md:block" /> Prosperity.
          </h2>
          <div className="h-2 w-48 bg-gradient-green mx-auto rounded-full mt-10" />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {howItWorksSteps.map((step, i) => (
            <ScrollReveal
              key={i}
              animation="fade-up"
              delay={i * 0.1}
              className="relative bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 transition-all duration-700 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10">
                <span className="text-9xl font-heading font-black text-white/[0.03] group-hover:text-success/5 transition-colors leading-none select-none">
                  {step.step}
                </span>
              </div>
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                className="w-20 h-20 rounded-3xl bg-success/10 text-success flex items-center justify-center mb-10 relative z-10 shadow-2xl"
              >
                {step.icon}
              </motion.div>
              <h3 className="font-heading font-black text-white text-3xl mb-6 relative z-10 tracking-tight">{step.title}</h3>
              <p className="text-muted/70 text-lg leading-relaxed relative z-10 font-medium">{step.desc}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Featured Listings Preview - REAL DATA */}
      <section className="py-32 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <ScrollReveal animation="fade-right">
              <p className="text-success text-sm font-black tracking-[0.3em] uppercase mb-4">Premium Assets</p>
              <h2 className="font-heading font-black text-6xl text-white tracking-tighter">Featured Listings</h2>
              <div className="h-2 w-32 bg-gradient-green mt-6 rounded-full" />
            </ScrollReveal>
            <ScrollReveal animation="fade-left">
              <Link href="/listings" className="group flex items-center gap-4 text-white font-bold text-lg px-8 py-4 rounded-2xl bg-white/5 hover:bg-success transition-all">
                View Marketplace
                <span className="group-hover:translate-x-2 transition-transform font-serif">→</span>
              </Link>
            </ScrollReveal>
          </div>

          {loadingListings ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-white/5 rounded-[3rem] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {featuredListings.map((listing, i) => (
                <ScrollReveal
                  key={listing.id}
                  animation="fade-up"
                  delay={i * 0.1}
                  className="group relative bg-earth-card rounded-[3rem] overflow-hidden border border-white/5 hover:border-success/30 transition-all duration-700 shadow-2xl hover:-translate-y-4"
                >
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <motion.img
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      src={listing.image_urls?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'}
                      alt={listing.title}
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Floating Info */}
                    <div className="absolute bottom-10 left-10 right-10 z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-1.5 rounded-full bg-success text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                          {listing.state || 'verified'}
                        </span>
                        {listing.verified && (
                          <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] shadow-lg">✓</span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-3xl text-white mb-2 leading-tight tracking-tight">{listing.title}</h3>
                      <p className="text-white/60 text-sm font-medium flex items-center gap-2 mb-6">
                        📍 {listing.pin_code}, {listing.district || 'India'}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-black mb-1">Area Size</p>
                          <p className="text-white font-bold">{listing.area_size} Acres</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/40 text-[10px] uppercase font-black mb-1">Expected Price</p>
                          <p className="text-success font-black text-2xl">₹{listing.price_expected?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href={`/listings/${listing.id}`} className="absolute inset-0 z-20" />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-white/10">
              <span className="text-6xl mb-6 block opacity-20">🚜</span>
              <h3 className="text-white font-bold text-2xl mb-2">Marketplace is being updated</h3>
              <p className="text-muted/60 max-w-md mx-auto">We couldn&apos;t find any active listings at the moment. Please check back shortly for new opportunities.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid - Modern SaaS Look */}
      <section className="py-32 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <ScrollReveal>
              <p className="text-sand text-sm font-black tracking-[0.4em] uppercase mb-6">Cutting Edge Technology</p>
              <h2 className="font-heading font-black text-6xl md:text-8xl text-white tracking-tighter leading-none mb-4">
                Designed for <br className="hidden md:block" /> Results.
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <ScrollReveal
                key={i}
                animation="fade-up"
                delay={i * 0.05}
                className="group relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-12 hover:bg-white/[0.08] transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-40 transition-opacity blur-3xl`} />
                <div className="text-5xl mb-10 group-hover:scale-110 transition-transform duration-500 origin-left drop-shadow-2xl">{feat.emoji}</div>
                <h3 className="font-heading font-bold text-white text-2xl mb-6 tracking-tight">{feat.title}</h3>
                <p className="text-muted/70 leading-relaxed font-medium text-lg mb-4">{feat.desc}</p>
                <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-success group-hover:w-full transition-all duration-1000" />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Epic Design */}
      <section className="py-48 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-20">
        <ScrollReveal animation="zoom-in">
          <div className="relative overflow-hidden bg-gradient-to-br from-success/20 via-black to-earth-deep rounded-[4rem] border border-white/10 p-20 md:p-32 text-center group">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-[0.05] pointer-events-none" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-success/10 blur-[150px] -z-10"
            />

            <h2 className="font-heading font-black text-6xl md:text-8xl text-white mb-10 tracking-tighter leading-[0.9]">
              Begin Your <br />
              <span className="text-success">Legacy.</span>
            </h2>
            <p className="text-muted/60 text-xl md:text-3xl mb-16 max-w-3xl mx-auto font-light tracking-tight">
              The agricultural revolution is digital. Secure your future on India&apos;s most sophisticated leasing platform today.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <SignInButton>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-16 py-7 rounded-[2rem] bg-white text-black font-black text-2xl hover:bg-success hover:text-white transition-all shadow-2xl"
                >
                  Join as Farmer
                </motion.button>
              </SignInButton>
              <SignInButton>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-16 py-7 rounded-[2rem] border-4 border-white text-white font-black text-2xl hover:bg-white hover:text-black transition-all"
                >
                  List Property
                </motion.button>
              </SignInButton>
            </div>

            <div className="mt-20 flex flex-wrap justify-center gap-10 opacity-40">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em]">🛡️ Verified Assets</div>
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em]">⚖️ Legal Security</div>
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.3em]">🛰️ Geo-Matching</div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
