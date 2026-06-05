import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import { Users, TreePine, Trophy, Heart, ChevronRight } from 'lucide-react';

const programs = [
  {
    name: '5K Starter Program',
    tag: 'Beginners & first-time runners',
    duration: '8 Weeks',
    price: '₹2,999',
    includes: ['Weekly training plan', 'Group runs', 'Nutrition guidance', 'Form coaching'],
  },
  {
    name: '10K Progression Program',
    tag: 'Experienced runners building endurance',
    duration: '12 Weeks',
    price: '₹4,999',
    includes: ['Structured training plan', 'Speed work sessions', 'Long run coaching', 'Injury prevention'],
    popular: true,
  },
  {
    name: 'Half Marathon Mastery',
    tag: 'Serious runners training for 21K',
    duration: '16 Weeks',
    price: '₹7,999',
    includes: ['Personalized training plan', 'Race-day strategy', 'Peak performance coaching', 'Recovery planning'],
  },
];

const membershipPerks = [
  'Weekly community group runs (Tuesday & Saturday)',
  'All training programs (5K, 10K, 21K)',
  'Monthly nutrition workshops',
  'Access to our running community WhatsApp / Discord',
  '15% discount on all events',
  'Member-exclusive merchandise',
  'Run tracking and progress analytics',
  'Injury prevention coaching sessions',
];

const whatWeDo = [
  { icon: <Users className="w-5 h-5" />, text: 'Monthly community group runs across Bengaluru' },
  { icon: <Trophy className="w-5 h-5" />, text: 'Structured training programs for all levels' },
  { icon: <Heart className="w-5 h-5" />, text: 'Fitness events and marathons with purpose' },
  { icon: <TreePine className="w-5 h-5" />, text: 'Environmental initiatives linked to running' },
  { icon: <Users className="w-5 h-5" />, text: 'Community building through shared passion for fitness' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* ── HEADER ── */}
      <section className="bg-green-950 text-white relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/95 via-green-950/80 to-green-950/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.1)_0%,_transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center text-green-400 text-sm hover:text-green-300 mb-8 transition-colors">
            ← Back to home
          </Link>
          <div className="inline-flex items-center gap-2 bg-green-800/60 backdrop-blur-sm border border-green-600/40 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            About Us
          </div>
          <h1 className="font-display text-6xl sm:text-8xl text-white mb-6 drop-shadow-lg">
            BENGALURU<br />LET'S RUN
          </h1>
          <p className="font-heading text-green-300 text-xl sm:text-2xl tracking-wide max-w-2xl mx-auto">
            Building a Fitter, Greener City
          </p>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="py-20 px-4">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-green-700 text-xs font-bold tracking-widest uppercase mb-6">
              <span className="w-8 h-px bg-green-400" />
              Who We Are
              <span className="w-8 h-px bg-green-400" />
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Bengaluru Let's Run is a running community dedicated to transforming our city through movement, fitness, and environmental action. We believe that running is more than personal achievement — it's a catalyst for community building and urban change.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-10">
              Since 2024, we've brought thousands of runners together through training programs, community runs, and fitness events. But we're not just about running faster or longer. We're about running <em className="text-green-700 font-semibold not-italic">for something</em>.
            </p>

            {/* Mission */}
            <div className="bg-green-900 text-white rounded-2xl p-8 mb-10">
              <h2 className="font-heading font-bold text-xs tracking-widest uppercase text-green-400 mb-3">Our Mission</h2>
              <p className="text-lg leading-relaxed text-green-100">
                Build a healthier, more connected Bengaluru where runners become agents of change — for their fitness, their community, and their city.
              </p>
            </div>

            {/* What We Do */}
            <h2 className="font-heading font-bold text-xs tracking-widest uppercase text-green-700 mb-5">What We Do</h2>
            <div className="space-y-3">
              {whatWeDo.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-0.5 text-green-600 shrink-0">{item.icon}</span>
                  <span className="text-base">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gray-100 rounded-2xl p-8 border border-gray-200">
              <p className="text-gray-700 text-base leading-relaxed">
                <strong className="text-green-800">Green BLR 2.0</strong> represents the evolution of our movement — where running meets environmental restoration. Every runner is not just improving their fitness, but actively planting the future of Bengaluru.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 mt-6 bg-green-800 text-white font-heading font-bold px-6 py-3 rounded-full text-sm hover:bg-green-700 transition-colors"
              >
                Register for Green BLR 2.0 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── TRAIN WITH US ── */}
      <section className="bg-gray-100 py-20 px-4">
        <ScrollReveal>
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-green-700 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-8 h-px bg-green-400" />
              Train With Us
              <span className="w-8 h-px bg-green-400" />
            </div>
            <h2 className="font-display text-5xl sm:text-6xl text-gray-900 mb-4">Join Our Running Community</h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Whether you're taking your first steps or training for your next marathon, Bengaluru Let's Run has a program for you.
            </p>
          </div>
        </ScrollReveal>

        {/* Program Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {programs.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 120}>
              <div className={`relative rounded-2xl p-7 h-full flex flex-col ${p.popular ? 'bg-green-900 text-white shadow-2xl border-2 border-green-500' : 'bg-white text-gray-800 border border-gray-200 shadow-md'}`}>
                {p.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 rounded-t-2xl" />
                    <div className="inline-flex items-center gap-1.5 text-green-300 text-xs font-bold uppercase tracking-widest mb-3">
                      <Trophy className="w-3.5 h-3.5" /> Most Popular
                    </div>
                  </>
                )}
                <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${p.popular ? 'text-green-400' : 'text-green-600'}`}>
                  {p.duration}
                </div>
                <h3 className={`font-heading font-extrabold text-xl mb-1 ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                <p className={`text-sm mb-5 ${p.popular ? 'text-green-300' : 'text-gray-500'}`}>Perfect for: {p.tag}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.includes.map((item) => (
                    <li key={item} className={`flex items-center gap-2 text-sm ${p.popular ? 'text-green-100' : 'text-gray-600'}`}>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${p.popular ? 'text-green-400' : 'text-green-500'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className={`font-display text-4xl mt-auto ${p.popular ? 'text-green-300' : 'text-green-700'}`}>{p.price}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Membership Card */}
        <ScrollReveal>
          <div className="max-w-3xl mx-auto bg-green-950 text-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-8 py-6">
              <p className="text-green-200 text-xs font-bold uppercase tracking-widest mb-1">Best Value</p>
              <h3 className="font-display text-4xl text-white">Community Membership</h3>
              <p className="text-green-200 mt-1 text-sm">Unlimited access to all programs + exclusive benefits</p>
            </div>
            <div className="p-8">
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {membershipPerks.map((perk) => (
                  <div key={perk} className="flex items-start gap-2 text-sm text-green-100">
                    <span className="text-green-400 font-bold mt-0.5 shrink-0">✓</span>
                    {perk}
                  </div>
                ))}
              </div>
              <div className="border-t border-green-800 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-display text-4xl text-white">₹999</span>
                  <span className="text-green-400 text-sm ml-1">/month</span>
                  <span className="text-green-600 text-sm ml-3">or ₹9,999/year</span>
                </div>
                <a
                  href="mailto:Green@bengaluruletsrun.com?subject=Community Membership Enquiry"
                  className="inline-block bg-white text-green-900 font-heading font-extrabold px-8 py-3 rounded-full text-sm hover:bg-green-50 transition-colors shadow-lg"
                >
                  Join the Community →
                </a>
              </div>
            </div>
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
