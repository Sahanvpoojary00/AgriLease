'use client';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { SignInButton } from '@insforge/nextjs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

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
  { value: '3–5%', label: 'Platform Commission', icon: '💰' },
  { value: 'PIN-based', label: 'Proximity Matching', icon: '📍' },
  { value: 'Digital', label: 'Smart Contracts', icon: '📄' },
  { value: 'AI-Powered', label: 'Crop Doctor', icon: '🌾' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-earth-deep">
      <Navbar />

      {/* Hero Section */}
      <section className="relative hero-bg overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-soil/8 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-success/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            {/* Tag */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-success/30 bg-success/10 text-success text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              India's First Smart Agricultural Leasing Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6"
            >
              Land the Right{' '}
              <span className="gradient-text">Lease.</span>
              <br />
              Grow Together.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-muted text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              AgriLease connects landless farmers with idle land through PIN-based matching,
              transparent profit sharing, and legally secure smart contracts.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <SignInButton>
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-green text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-glow-olive hover:shadow-glow-green flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Land to Lease
                </button>
              </SignInButton>
              <SignInButton>
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-earth-border text-white font-semibold text-lg hover:border-primary-light hover:bg-earth-card transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  List Your Property
                </button>
              </SignInButton>
            </motion.div>

            {/* Real-time Insights Strip */}
            <motion.div variants={fadeUp}>
              <div className="bg-earth-card/60 backdrop-blur-sm border border-earth-border rounded-2xl px-6 py-4 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <span className="text-lg">🌤️</span>
                  <span><span className="text-white font-medium">28°C</span> • Clear skies – Good sowing conditions</span>
                </div>
                <div className="w-px h-5 bg-earth-border hidden md:block" />
                <div className="flex items-center gap-2 text-muted">
                  <span className="text-lg">📈</span>
                  <span>Wheat: <span className="text-success font-medium">₹2,125/qtl</span> • MSP ↑ 3.2%</span>
                </div>
                <div className="w-px h-5 bg-earth-border hidden md:block" />
                <div className="flex items-center gap-2 text-muted">
                  <span className="text-lg">🏪</span>
                  <span>Nearest Mandi: <span className="text-sand font-medium">Azadpur</span> • 12km</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-earth-border bg-earth-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-success font-heading font-bold text-xl">{stat.value}</div>
                <div className="text-muted text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-success text-sm font-semibold tracking-widest uppercase mb-3">Simple Process</p>
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
            How AgriLease Works
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            From registration to a signed contract in four transparent steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorksSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-earth-card border border-earth-border rounded-2xl p-6 hover:border-primary-light transition-colors group"
            >
              {/* Step number */}
              <span className="text-6xl font-heading font-black text-earth-surface group-hover:text-primary/30 transition-colors absolute top-4 right-5 leading-none select-none">
                {step.step}
              </span>
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-success flex items-center justify-center mb-4 relative z-10">
                {step.icon}
              </div>
              <h3 className="font-heading font-semibold text-white text-lg mb-2 relative z-10">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed relative z-10">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-earth-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sand text-sm font-semibold tracking-widest uppercase mb-3">Platform Features</p>
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
              Built for Modern Agriculture
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
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
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-gradient-to-br ${feat.color} bg-earth-card border border-earth-border rounded-2xl p-6 hover:border-primary-light transition-colors`}
              >
                <div className="text-4xl mb-4">{feat.emoji}</div>
                <h3 className="font-heading font-semibold text-white text-xl mb-2">{feat.title}</h3>
                <p className="text-muted leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-br from-primary/20 to-earth-card border border-primary/40 rounded-3xl p-12">
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
              Ready to cultivate your future?
            </h2>
            <p className="text-muted text-lg mb-8">
              Join thousands of farmers and landowners building agricultural prosperity together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignInButton>
                <button className="px-8 py-4 rounded-xl bg-gradient-green text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-glow-olive">
                  Start as a Farmer
                </button>
              </SignInButton>
              <SignInButton>
                <button className="px-8 py-4 rounded-xl border border-earth-border text-white font-semibold text-lg hover:border-primary-light hover:bg-earth-card/50 transition-all">
                  List Your Land
                </button>
              </SignInButton>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
