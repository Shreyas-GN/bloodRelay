"use client";

import Link from "next/link";
import { Droplet, ArrowRight, Github, MapPin, Bell, Phone, Heart, Shield, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" } as const,
  }),
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans selection:bg-crimson/20">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-200/60">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 outline-none">
            <Droplet className="w-4 h-4 fill-crimson stroke-crimson" />
            <span className="text-sm font-bold tracking-tight">PulseAid</span>
          </Link>

          <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
            <SignedIn>
              <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">
                Dashboard
              </Link>
              <Link
                href="/request/wizard"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-crimson text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Emergency
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{ elements: { userButtonAvatarBox: "w-7 h-7 rounded-lg" } }}
              />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="hover:text-zinc-900 transition-colors">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors"
              >
                Sign up
              </Link>
            </SignedOut>
          </div>
        </nav>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-20">
          <motion.div variants={fade} initial="hidden" animate="show" custom={0} className="space-y-6 max-w-3xl">

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              <span className="text-xs font-bold text-rose-700 tracking-wide uppercase">Emergency blood coordination</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tighter leading-[1.0] text-zinc-900">
              Find blood donors<br />
              <span className="text-crimson">near you. Fast.</span>
            </h1>

            <p className="text-lg text-zinc-500 leading-relaxed max-w-xl font-medium">
              Post a request. Compatible donors within 20 km get notified. They respond. You coordinate directly by phone. No middlemen, no delays.
            </p>

            {/* CTAs */}
            <motion.div variants={fade} initial="hidden" animate="show" custom={2} className="flex flex-col sm:flex-row gap-3 pt-2">
              <SignedOut>
                <Link
                  href="/request/wizard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-crimson text-white font-bold rounded-xl shadow-[0_4px_24px_rgba(192,57,43,0.3)] hover:bg-red-700 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  I need blood now
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors text-sm"
                >
                  Register as a donor
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/request/wizard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-crimson text-white font-bold rounded-xl shadow-[0_4px_24px_rgba(192,57,43,0.3)] hover:bg-red-700 transition-all hover:scale-[1.01] text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  Request blood now
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-4 border border-zinc-200 text-zinc-900 font-bold rounded-xl hover:bg-zinc-100 transition-colors text-sm"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </motion.div>
          </motion.div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="border-t border-zinc-200/60 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <motion.p
              variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
              className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-12"
            >
              How it works
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  n: "01",
                  title: "Post your need",
                  detail: "Blood group, hospital name, units needed, your phone. Takes 60 seconds.",
                  icon: Zap,
                  color: "text-rose-600",
                  bg: "bg-rose-500/10",
                },
                {
                  n: "02",
                  title: "Donors get pinged",
                  detail: "Only matching donors within 20 km who've opted in receive an alert. No spam.",
                  icon: Bell,
                  color: "text-amber-600",
                  bg: "bg-amber-500/10",
                },
                {
                  n: "03",
                  title: "You connect directly",
                  detail: "An accepting donor's name and phone appear. You call them. Done.",
                  icon: Phone,
                  color: "text-emerald-600",
                  bg: "bg-emerald-500/10",
                },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.n}
                    variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i + 1}
                    className="space-y-4"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.bg}`}>
                      <Icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-widest">{step.n}</span>
                      <h3 className="font-extrabold text-zinc-900 tracking-tight mt-1 mb-2">{step.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed font-medium">{step.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Feature Split ─────────────────────────────────── */}
        <section className="border-t border-zinc-200/60 bg-zinc-50">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <motion.p
              variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-12"
            >
              What you get
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requesters */}
              <motion.div
                variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
                className="bg-white border border-zinc-200/60 rounded-2xl p-8 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-extrabold text-zinc-900 tracking-tight">For people who need blood</p>
                    <p className="text-xs font-medium text-zinc-500">Requesters</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "GPS-tagged requests so donors know exactly where to go",
                    "Real-time responses — see who accepted and when",
                    "Direct phone contact, no platform messaging",
                    "Map + one-tap directions to the hospital",
                    "Edit or cancel your request anytime",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <SignedOut>
                  <Link
                    href="/request/wizard"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-crimson text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Post a request
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </SignedOut>
              </motion.div>

              {/* Donors */}
              <motion.div
                variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}
                className="bg-white border border-zinc-200/60 rounded-2xl p-8 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-extrabold text-zinc-900 tracking-tight">For people who want to donate</p>
                    <p className="text-xs font-medium text-zinc-500">Donors</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "Only alerted for your blood group — no irrelevant pings",
                    "Requests within 20 km of your location only",
                    "One tap to accept. Then call directly.",
                    "Toggle availability on/off whenever you need to",
                    "Automatic cooldown after you've donated",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <SignedOut>
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Register as donor
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </SignedOut>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200/60 bg-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 fill-crimson stroke-crimson" />
              <span className="text-sm font-bold tracking-tight">PulseAid</span>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm font-semibold text-zinc-500">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Bangalore-based
              </span>
              <a href="https://github.com/Shreyas-GN/Pulse-Aid" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-zinc-900 transition-colors">
                <Github className="w-4 h-4" />
                Open source
              </a>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Free forever · No ads
              </span>
            </div>
          </div>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            <span>© 2026 PulseAid</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-zinc-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-zinc-600 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Floating Emergency Button (signed-out only) ─────── */}
      <SignedOut>
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            href="/request/wizard"
            className="flex items-center gap-2 px-5 py-3 bg-crimson text-white font-bold rounded-full shadow-[0_8px_30px_rgba(192,57,43,0.4)] hover:bg-red-700 transition-all hover:scale-105 active:scale-95 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            Emergency Request
          </Link>
        </div>
      </SignedOut>

    </div>
  );
}
