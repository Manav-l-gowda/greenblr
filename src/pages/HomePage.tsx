import React from 'react';
import { Link } from 'react-router-dom';
import { calculatePrice } from '@/types';
import AnimatedCounter from '@/components/AnimatedCounter';
import ScrollReveal from '@/components/ScrollReveal';
import { CalendarDays, MapPin, TreePine, PersonStanding, Handshake, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="bg-green-950 text-white relative overflow-hidden min-h-screen flex flex-col justify-center">

        {/* Vidhana Soudha — prominently visible at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
          <img
            src="/vidhana-soudha.png"
            alt=""
            className="w-full opacity-90 brightness-110 contrast-110"
          />
        </div>

        {/* Subtle gradient: dark at top for text legibility, fades out before building */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/95 via-green-950/80 to-green-950/50 pointer-events-none" />

        {/* Radial glow behind logo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center flex flex-col items-center">

          {/* Logo — floating animation */}
          <div className="animate-scaleIn mb-6">
            <div className="animate-float inline-block">
              <img
                src="/Green logo.png"
                alt="Green BLR 2.0 Logo"
                width={160}
                height={160}
                className="mix-blend-multiply drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Badge */}
          <div className="animate-fadeInUp delay-100 inline-flex items-center gap-2 bg-green-800/60 backdrop-blur-sm border border-green-600/40 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Bengaluru&apos;s Largest Green Movement
          </div>

          {/* Main title */}
          <h1 className="animate-fadeInUp delay-200 font-display text-8xl sm:text-[10rem] leading-none text-white mb-2 drop-shadow-lg">
            GREEN BLR 2.0
          </h1>

          {/* Tagline */}
          <p className="animate-fadeInUp delay-300 font-heading font-bold text-xl sm:text-3xl text-white drop-shadow-lg tracking-wide mb-3 uppercase">
            One Registration · One Root
          </p>

          {/* Date & location chip */}
          <div className="animate-fadeInUp delay-400 flex flex-wrap justify-center gap-3 mb-10">
            {([
              { icon: <CalendarDays className="w-4 h-4" />, label: 'August 16, 2026' },
              { icon: <MapPin className="w-4 h-4" />, label: 'Bengaluru' },
              { icon: null, label: '3K · 5K · 10K' },
            ] as { icon: React.ReactNode; label: string }[]).map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 bg-green-950/70 backdrop-blur-md border border-white/30 text-white text-sm px-4 py-1.5 rounded-full shadow-lg"
              >
                {item.icon}
                {item.label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="animate-fadeInUp delay-500">
            <Link
              to="/register"
              className="btn-shimmer animate-pulse-ring inline-block text-green-900 font-heading font-extrabold text-lg px-12 py-4 rounded-full shadow-2xl transition-transform hover:scale-105"
            >
              Register Now →
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="animate-bounce-slow mt-14 text-green-500/60 text-xs flex flex-col items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
            Scroll to explore
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-green-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Target Runners', target: 5000 },
            { label: 'Trees Planted', target: 5000 },
            { label: 'Categories', value: '3' },
          ].map((s) => (
            <div key={s.label} className="group">
              <div className="font-display text-5xl sm:text-6xl text-white group-hover:text-green-300 transition-colors">
                {s.target ? <AnimatedCounter target={s.target} suffix="+" /> : s.value}
              </div>
              <div className="font-heading text-green-400 text-sm mt-2 tracking-widest uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className="bg-white py-10 border-y border-gray-100 overflow-hidden">
        <p className="text-center text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Our Partners</p>
        <div className="flex w-max animate-marquee gap-20 items-center px-10">
          {[
            { src: '/thrive Logo.png', alt: 'Thrive Security' },
            { src: "/Jeff's Logo.png", alt: "Jeff's Corporation" },
            { src: '/thrive Logo.png', alt: 'Thrive Security' },
            { src: "/Jeff's Logo.png", alt: "Jeff's Corporation" },
            { src: '/thrive Logo.png', alt: 'Thrive Security' },
            { src: "/Jeff's Logo.png", alt: "Jeff's Corporation" },
            { src: '/thrive Logo.png', alt: 'Thrive Security' },
            { src: "/Jeff's Logo.png", alt: "Jeff's Corporation" },
          ].map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className="h-16 object-contain"
            />
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-20 px-4">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-green-700 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-8 h-px bg-green-400" />
              About The Event
              <span className="w-8 h-px bg-green-400" />
            </div>
            <h2 className="font-display text-5xl sm:text-6xl text-gray-900 mb-6">
              Run for the city you love
            </h2>
            <p className="font-heading text-gray-600 text-lg leading-relaxed">
              Green BLR 2.0 is more than a run — it&apos;s a movement. Every registered runner plants a
              tree in Bengaluru, creating a greener future for the city. 5,000 runners.
              5,000 trees. One powerful statement.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature tiles */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <TreePine className="w-8 h-8 text-green-600" />, title: 'Plant a Tree', desc: 'Every runner plants a real tree in Bengaluru on race day.' },
            { icon: <PersonStanding className="w-8 h-8 text-green-600" />, title: 'Run Your Distance', desc: 'Choose from 3K, 5K or 10K — a category for every runner.' },
            { icon: <Handshake className="w-8 h-8 text-green-600" />, title: 'Join the Movement', desc: "Be part of Bangalore's largest green community event." },
          ].map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 150}>
              <div className="card-lift bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                <div className="flex justify-center mb-3">{f.icon}</div>
                <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-gray-100 py-20 px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-green-700 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-8 h-px bg-green-400" />
              Early Bird Pricing
              <span className="w-8 h-px bg-green-400" />
            </div>
            <h2 className="font-display text-5xl sm:text-6xl text-gray-900">Choose Your Race</h2>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {(['3K', '5K', '10K'] as const).map((cat, i) => {
            const { base } = calculatePrice(cat);
            const isPopular = i === 2;
            return (
              <ScrollReveal key={cat} delay={i * 120}>
                <div
                  className={`card-lift rounded-2xl p-8 text-center relative overflow-hidden ${
                    isPopular
                      ? 'bg-green-900 text-white shadow-2xl border-2 border-green-500'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-md'
                  }`}
                >
                  {isPopular && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-300 to-green-400" />
                      <div className="inline-flex items-center gap-1.5 text-green-300 text-xs font-bold uppercase tracking-widest mb-3">
                        <Star className="w-3.5 h-3.5 fill-green-300" /> Most Popular
                      </div>
                    </>
                  )}
                  <div className={`font-display text-7xl mb-1 ${isPopular ? 'text-white' : 'text-green-800'}`}>
                    {cat}
                  </div>
                  <div className={`font-display text-5xl mb-2 ${isPopular ? 'text-green-300' : 'text-green-700'}`}>
                    ₹{base}
                  </div>
                  <div className={`font-heading text-xs mb-8 ${isPopular ? 'text-green-500' : 'text-gray-400'}`}>
                    + 18% GST at checkout
                  </div>
                  <Link
                    to="/register"
                    className={`block w-full py-3.5 rounded-xl font-heading font-bold text-sm tracking-wide transition-all hover:scale-105 ${
                      isPopular
                        ? 'bg-white text-green-900 hover:bg-green-50 shadow-lg'
                        : 'bg-green-700 text-white hover:bg-green-800'
                    }`}
                  >
                    Register for {cat}
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-green-950 text-white py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.1)_0%,_transparent_70%)] pointer-events-none" />
        <ScrollReveal>
          <div className="relative z-10 max-w-2xl mx-auto">
            <img
              src="/Green logo.png"
              alt="Green BLR 2.0"
              width={100}
              height={100}
              className="mx-auto mb-6 mix-blend-multiply opacity-90"
            />
            <h2 className="font-display text-5xl sm:text-7xl text-white mb-4">
              Make Your Mark
            </h2>
            <p className="font-heading text-green-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Register now and be part of Bengaluru&apos;s largest green movement.
              Register multiple runners in a single checkout.
            </p>
            <Link
              to="/register"
              className="btn-shimmer inline-block text-green-900 font-heading font-extrabold text-lg px-12 py-4 rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              Register Now →
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-gray-600 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <img src="/Green logo.png" alt="Green BLR" width={36} height={36} className="mix-blend-multiply opacity-70" />
            <span className="font-heading font-bold text-gray-400">GREEN BLR 2.0</span>
          </div>
          <p>August 16, 2026 · Bengaluru</p>
          <a href="mailto:Green@bengaluruletsrun.com" className="text-green-500 hover:text-green-400 transition-colors">
            Green@bengaluruletsrun.com
          </a>
        </div>
      </footer>

    </main>
  );
}
