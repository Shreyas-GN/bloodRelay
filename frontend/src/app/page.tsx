"use client";

import Link from "next/link";
import { Droplet, ArrowRight, Github, MapPin, Bell, Phone, Heart, Shield, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-base-50)] text-[var(--color-base-900)] font-sans">
      <div className="fixed inset-0 pointer-events-none z-[-1]" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(192,57,43,0.04) 0%, transparent 60%)' }} />
      {/* Global Noise is applied via globals.css body::before */}

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] border-b border-[var(--color-base-200)] h-[56px] w-full flex justify-center">
        <nav className="w-full max-w-[1280px] px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 outline-none">
            <Droplet className="w-5 h-5 fill-[var(--color-blood)] stroke-[var(--color-blood)]" />
            <span className="text-[1.125rem] font-bold tracking-[-0.05em] font-display text-[var(--color-base-900)]">PulseAid</span>
          </Link>

          <div className="flex items-center gap-4 text-sm font-medium">
            <SignedIn>
              <Link href="/dashboard" className="text-[var(--color-base-700)] hover:text-[var(--color-base-900)] transition-colors hover:underline">
                Dashboard
              </Link>
              <Link
                href="/emergency"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-blood)] text-white rounded-[var(--radius-pill)] text-sm font-bold shadow-[var(--shadow-clay-hard)] hover:-translate-y-px transition-transform animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" />
                NEED BLOOD NOW
              </Link>
              <div className="relative group">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full border-2 border-[var(--color-blood)]" } }}
                />
              </div>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="text-[var(--color-base-700)] hover:text-[var(--color-base-900)] transition-colors hover:underline">
                Sign in
              </Link>
              <Link
                href="/emergency"
                className="px-4 py-1.5 bg-[var(--color-blood)] text-white rounded-[var(--radius-pill)] text-sm font-bold shadow-[var(--shadow-clay-hard)] hover:-translate-y-px transition-transform animate-pulse"
              >
                NEED BLOOD NOW
              </Link>
            </SignedOut>
          </div>
        </nav>
      </header>

      <main className="flex-1 relative z-10 w-full flex flex-col items-center">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="w-full max-w-[1280px] px-6 pt-[80px] pb-[120px] w-full">
          <motion.div variants={fade} initial="hidden" animate="show" custom={0} className="space-y-6 max-w-[720px] mx-auto text-center flex flex-col items-center">

            {/* Urgency tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-blood-light)] rounded-[var(--radius-pill)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-blood)] animate-pulse" />
              <span className="text-[0.625rem] font-bold text-[var(--color-blood)] tracking-widest uppercase font-mono">EMERGENCY BLOOD COORDINATION</span>
            </div>

            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] tracking-[-0.05em] leading-[1.05] text-[var(--color-base-900)] font-bold">
              Find blood donors<br />
              <span className="text-[var(--color-blood)]">near you.</span> <span className="font-bold text-[var(--color-base-900)]">Fast.</span>
            </h1>

            <p className="text-[1.0625rem] text-[var(--color-base-500)] max-w-[520px] font-sans">
              Post a request. Compatible donors within 20 km get notified. They respond. You coordinate directly by phone. No middlemen, no delays.
            </p>

            {/* CTAs */}
            <motion.div variants={fade} initial="hidden" animate="show" custom={2} className="flex flex-col sm:flex-row gap-3 pt-[40px] w-full sm:w-auto items-center">
              <div className="flex flex-col items-center gap-4 w-full">
                <Link
                  href="/emergency"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-[32px] py-[16px] bg-[var(--color-blood)] text-white font-display font-bold rounded-[var(--radius-pill)] shadow-[0_20px_50px_rgba(192,57,43,0.3)] hover:-translate-y-1 active:translate-y-px transition-all text-[1.125rem] border-2 border-white/20"
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  NEED BLOOD NOW (Emergency)
                </Link>
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="text-[var(--color-base-700)] hover:text-[var(--color-blood)] hover:underline transition-colors text-[1rem] font-medium"
                  >
                    View active requests
                  </Link>
                  <span className="text-zinc-300">|</span>
                  <Link
                    href="/sign-up"
                    className="text-[var(--color-base-700)] hover:text-[var(--color-blood)] hover:underline transition-colors text-[1rem] font-medium"
                  >
                    Register as a donor
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="bg-[var(--color-base-50)] rounded-t-[var(--radius-section)] w-full py-[80px]">
          <div className="max-w-[1280px] mx-auto px-6 w-full">
            <motion.p
              variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
              className="text-[0.75rem] font-bold font-mono uppercase tracking-[0.1em] text-[var(--color-base-500)] mb-[48px] text-center"
            >
              HOW IT WORKS
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-[56px] left-[16%] right-[16%] border-t-[1.5px] border-dashed border-[var(--color-base-200)] z-0" />

              {[
                {
                  n: "01",
                  title: "Post your need",
                  detail: "Blood group, hospital name, units needed, your phone. Takes 60 seconds.",
                  icon: Zap,
                  bg: "bg-[var(--color-blood-light)]",
                  stroke: "stroke-[var(--color-blood)]"
                },
                {
                  n: "02",
                  title: "Donors get pinged",
                  detail: "Only matching donors within 20 km who've opted in receive an alert. No spam.",
                  icon: Bell,
                  bg: "bg-[var(--color-warn-light)]",
                  stroke: "stroke-[var(--color-warn)]"
                },
                {
                  n: "03",
                  title: "You connect directly",
                  detail: "An accepting donor's name and phone appear. You call them. Done.",
                  icon: Phone,
                  bg: "bg-[var(--color-safe-light)]",
                  stroke: "stroke-[var(--color-safe)]"
                },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.n}
                    variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i + 1}
                    className="relative z-10 bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-card)] p-[32px] shadow-[var(--shadow-clay)] flex flex-col items-center text-center group hover:border-[var(--color-blood)] transition-colors"
                  >
                    <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center ${step.bg}`}>
                      <Icon className={`w-6 h-6 ${step.stroke} fill-none`} />
                    </div>
                    <span className="font-mono text-[0.75rem] text-[var(--color-base-500)] block mt-[20px]">{step.n}</span>
                    <h3 className="font-display font-bold text-[1.125rem] text-[var(--color-base-900)] mt-[8px]">{step.title}</h3>
                    <p className="font-sans text-[0.9375rem] text-[var(--color-base-500)] mt-2">{step.detail}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Feature Split ─────────────────────────────────── */}
        <section className="bg-white w-full">
          <div className="max-w-[1280px] mx-auto px-6 py-20">
            <motion.p
              variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-[0.75rem] font-bold font-mono uppercase tracking-[0.1em] text-[var(--color-base-500)] mb-[48px] text-center"
            >
              WHAT YOU GET
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Requesters */}
              <motion.div
                variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} custom={0}
                className="bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-card)] shadow-[var(--shadow-clay)] p-[32px] flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-[48px] h-[48px] rounded-full bg-[var(--color-blood-light)] flex items-center justify-center">
                    <Droplet className="w-5 h-5 fill-none stroke-[var(--color-blood)]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[1.125rem] text-[var(--color-base-900)]">For people who need blood</h3>
                    <p className="font-mono text-[0.75rem] text-[var(--color-base-500)] mt-1 uppercase tracking-widest">Requesters</p>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    "GPS-tagged requests so donors know exactly where to go",
                    "Real-time responses — see who accepted and when",
                    "Direct phone contact, no platform messaging",
                    "Map + one-tap directions to the hospital",
                    "Edit or cancel your request anytime",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 font-sans text-[0.9375rem] text-[var(--color-base-700)]">
                      <div className="mt-0.5 bg-[var(--color-safe-light)] rounded-full p-[2px] shrink-0">
                        <Droplet className="w-[12px] h-[12px] fill-[var(--color-safe)] stroke-none" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Donors */}
              <motion.div
                variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}
                className="bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-card)] shadow-[var(--shadow-clay)] p-[32px] flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-[48px] h-[48px] rounded-full bg-[var(--color-safe-light)] flex items-center justify-center">
                    <Heart className="w-5 h-5 fill-none stroke-[var(--color-safe)]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[1.125rem] text-[var(--color-base-900)]">For people who want to donate</h3>
                    <p className="font-mono text-[0.75rem] text-[var(--color-base-500)] mt-1 uppercase tracking-widest">Donors</p>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    "Only alerted for your blood group — no irrelevant pings",
                    "Requests within 20 km of your location only",
                    "One tap to accept. Then call directly.",
                    "Toggle availability on/off whenever you need to",
                    "Automatic cooldown after you've donated",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 font-sans text-[0.9375rem] text-[var(--color-base-700)]">
                      <div className="mt-0.5 bg-[var(--color-safe-light)] rounded-full p-[2px] shrink-0">
                        <Droplet className="w-[12px] h-[12px] fill-[var(--color-safe)] stroke-none" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-[var(--color-base-900)] text-white py-12">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 fill-[var(--color-blood)] stroke-[var(--color-blood)]" />
              <span className="text-[1.125rem] font-bold tracking-[-0.05em] font-display">PulseAid</span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-3">
              <span className="flex items-center gap-2 px-4 py-1.5 border border-[rgba(255,255,255,0.15)] rounded-[var(--radius-pill)] text-[0.75rem] font-mono text-white/80">
                <MapPin className="w-3.5 h-3.5" />
                Bangalore-based
                <span className="w-1 h-1 bg-[var(--color-blood)] rounded-full ml-1" />
              </span>
              <a href="https://github.com/Shreyas-GN/Pulse-Aid" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-1.5 border border-[rgba(255,255,255,0.15)] rounded-[var(--radius-pill)] text-[0.75rem] font-mono text-white/80 hover:bg-white/5 transition-colors">
                <Github className="w-3.5 h-3.5" />
                Open source
                <span className="w-1 h-1 bg-[var(--color-blood)] rounded-full ml-1" />
              </a>
              <span className="flex items-center gap-2 px-4 py-1.5 border border-[rgba(255,255,255,0.15)] rounded-[var(--radius-pill)] text-[0.75rem] font-mono text-white/80">
                <Shield className="w-3.5 h-3.5" />
                Free forever · No ads
              </span>
            </div>
          </div>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] font-bold font-mono text-[var(--color-base-500)] tracking-[0.1em] uppercase">
            <span>© 2026 PulseAid</span>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
