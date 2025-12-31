"use client"

import { motion } from "framer-motion";
import {
  Star,
  ArrowRight,
  Zap,
  Target,
  ShieldCheck,
  TrendingUp,
  Clock,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { ShowUpLogo } from "@/components/brand";

const features = [
  {
    icon: Target,
    title: "Specific Goals",
    description: "Break down vague resolutions into concrete, measurable objectives using our STAR framework.",
    color: "text-[#00D261]",
    bg: "bg-[#00D26110]"
  },
  {
    icon: Zap,
    title: "Micro-Actions",
    description: "Focus on tiny, repeatable daily habits that lead to massive long-term transformations.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: TrendingUp,
    title: "Insightful Tracking",
    description: "Visualize your streaks, progress, and consistency with beautiful desktop-first analytics.",
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    icon: ShieldCheck,
    title: "Open Access",
    description: "Built for the community. Access all features focused on behavioral science for free.",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00D261]/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-24 bg-[#0A0A0A]/80 backdrop-blur-2xl z-[100] border-b border-white/5 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <ShowUpLogo className="h-12 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
            <Link href="#features" className="hover:text-white transition-colors">The Method</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Open Dashboard</Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-black text-xs font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
            >
              Get Started Free
            </Link>
            <div className="flex items-center">
              <span className="text-[10px] font-black text-[#00D261] uppercase tracking-widest bg-[#00D26110] px-3 py-1 rounded-full">100% Free</span>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-64 pb-32 px-6 lg:px-12 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-[#00D26110] rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
          </div>

          <div className="max-w-6xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-[#00D261]"
            >
              <div className="w-2 h-2 rounded-full bg-[#00D261] animate-ping" />
              New Method for 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-6xl lg:text-[120px] font-display font-black tracking-tighter leading-[0.85]"
            >
              Turn Wishes into <br />
              <span className="text-[#00D261] text-glow">Wins this Year.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-lg lg:text-2xl max-w-3xl mx-auto font-medium leading-relaxed"
            >
              Master your resolutions using the science-backed STAR method.
              Built for high-achievers who refuse to settle for vague dreams.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
            >
              <Link
                href="/login"
                className="w-full sm:w-auto px-12 py-6 bg-[#00D261] text-white text-lg font-black rounded-3xl shadow-2xl shadow-green-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                Start Tracking Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 text-white text-lg font-black rounded-3xl hover:bg-white/10 transition-all text-center backdrop-blur-lg"
              >
                How it Works
              </Link>
            </motion.div>
          </div>

          {/* Dashboard Visual (Mockup) */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-32 max-w-5xl mx-auto relative px-4"
          >
            <div className="absolute inset-x-0 -bottom-20 h-64 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-20" />
            <div className="glass-card rounded-[3rem] p-4 relative z-10 overflow-hidden ring-1 ring-white/10 group">
              <div className="absolute inset-0 bg-[#00D261]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="bg-[#0C0C0C] aspect-[16/9] rounded-[2.5rem] border border-white/5 overflow-hidden flex shadow-2xl">
                {/* Sidebar UI */}
                <div className="w-[20%] border-r border-white/5 p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 bg-[#00D261] rounded-xl" />
                    <div className="w-20 h-3 bg-white/10 rounded-full" />
                  </div>
                  {[1, 1, 1, 1, 1].map((_, i) => (
                    <div key={i} className={`flex items-center gap-3 ${i === 0 ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-5 h-5 rounded-md ${i === 0 ? 'bg-[#00D261]' : 'bg-white/10'}`} />
                      <div className={`h-2 bg-white/10 rounded-full ${i === 0 ? 'w-24' : 'w-16'}`} />
                    </div>
                  ))}
                </div>
                {/* Main Dashboard UI Content */}
                <div className="flex-1 p-10 space-y-10">
                  <header className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="w-48 h-6 bg-white/10 rounded-full" />
                      <div className="w-32 h-3 bg-white/5 rounded-full" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                  </header>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="grid-cols-1 col-span-2 aspect-[16/7] bg-[#00D261]/5 border border-[#00D261]/20 rounded-[2.5rem] p-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8">
                        <div className="px-4 py-2 bg-[#00D261]/20 rounded-full border border-[#00D261]/30">
                          <div className="w-12 h-2 bg-[#00D261]/60 rounded-full" />
                        </div>
                      </div>
                      <div className="mt-8 space-y-4">
                        <div className="w-20 h-2 bg-[#00D261]/40 rounded-full" />
                        <div className="w-64 h-10 bg-[#00D261]/20 rounded-2xl" />
                      </div>
                    </div>
                    <div className="aspect-square bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-4 border-[#00D261] border-t-transparent flex items-center justify-center">
                        <span className="text-2xl font-black">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-40 px-6 bg-[#080808]">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-4">
              <h2 className="text-[10px] font-black text-[#00D261] uppercase tracking-[0.5em]">The Architecture</h2>
              <h3 className="text-5xl lg:text-7xl font-display font-black tracking-tighter">Engineered for Success.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0A0A0A] p-12 rounded-[3.5rem] border border-white/5 hover:border-[#00D26150] transition-all group relative overflow-hidden"
                >
                  <div className={`w-16 h-16 ${f.bg} rounded-[2rem] flex items-center justify-center mb-8 group-hover:-rotate-12 transition-transform duration-500`}>
                    <f.icon className={`w-8 h-8 ${f.color}`} />
                  </div>
                  <h4 className="text-2xl font-black mb-4">{f.title}</h4>
                  <p className="text-neutral-500 font-medium leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-60 px-6 lg:px-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00D26105] rounded-full blur-[200px] -z-10" />
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <h2 className="text-5xl lg:text-8xl font-display font-black tracking-tighter leading-none">
              Enough dreaming. <br />
              <span className="text-neutral-700">Let's ShowUp.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Link
                href="/login"
                className="w-full sm:w-auto px-16 py-8 bg-[#00D261] text-white text-xl font-black rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,210,97,0.5)] hover:scale-105 active:scale-95 transition-all text-glow"
              >
                Join ShowUp Today
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 pt-10">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest text-glow">The journey of a thousand miles begins with a single step.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-24 px-6 lg:px-12 border-t border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <Star className="text-white w-5 h-5 fill-white/10" />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter opacity-40">ShowUp.</span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">
            <Link href="#" className="hover:text-[#00D261] transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-[#00D261] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#00D261] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#00D261] transition-colors">Methodology</Link>
          </div>

          <p className="text-[10px] font-black text-neutral-700 uppercase tracking-widest">© 2026 ShowUp Systems Inc.</p>
        </div>
      </footer>
    </div >
  );
}
