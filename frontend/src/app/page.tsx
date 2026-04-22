"use client";

import Link from "next/link";
import { Droplet, ArrowRight, Github } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" } as const,
  }),
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans selection:bg-crimson/20">

      {/* ── Nav ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-200/60">
        <nav className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 outline-none">
            <Droplet className="w-4 h-4 fill-crimson stroke-crimson" />
            <span className="text-sm font-bold tracking-tight">PulseAid</span>
          </Link>

          <div className="flex items-center gap-5 text-sm font-medium text-zinc-500">
            <SignedIn>
              <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">
                Dashboard
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

        {/* ── Section 1: Hero ───────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-6 pt-28 pb-24">
          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            custom={0}
            className="space-y-8"
          >
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-[1.08] text-zinc-900 max-w-[640px]">
              I built this because I watched my family spend 4 hours making phone calls when my uncle needed blood.
            </h1>

            {/* Subtext */}
            <p className="text-lg text-zinc-500 leading-relaxed max-w-[520px]">
              PulseAid connects people who need blood with nearby donors who've already said they're willing. No hospital integrations, no AI matching algorithm. Just humans helping humans, faster.
            </p>

            {/* CTAs */}
            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              custom={1}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <SignedOut>
                <Link
                  href="/request/wizard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-crimson text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(192,57,43,0.25)] hover:bg-red-700 transition-colors text-sm"
                >
                  I need blood for someone
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors text-sm"
                >
                  I want to be a donor
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/request/wizard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-crimson text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(192,57,43,0.25)] hover:bg-red-700 transition-colors text-sm"
                >
                  Request blood for someone
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-zinc-200 text-zinc-900 font-bold rounded-xl hover:bg-zinc-100 transition-colors text-sm"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Section 2: How it works ───────────────────────────── */}
        <section className="border-t border-zinc-200/60 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-20">
            <motion.div
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={0}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-10">
                How it works
              </p>
            </motion.div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-3 bottom-3 w-px bg-zinc-200" aria-hidden />

              <ol className="space-y-10">
                {[
                  {
                    n: "1",
                    title: "You tell us what's needed.",
                    detail: "Blood group, hospital name, your phone number. Takes about 60 seconds.",
                  },
                  {
                    n: "2",
                    title: "We notify donors who can actually help.",
                    detail: "Only people with the matching blood group, within 20 km, who've opted in to receive requests. No spam, no mass broadcasts.",
                  },
                  {
                    n: "3",
                    title: "Someone says 'I can help'.",
                    detail: "You get their name and contact. They get your hospital location. You coordinate directly. We step back.",
                  },
                ].map((step, i) => (
                  <motion.li
                    key={step.n}
                    variants={fade}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    custom={i + 1}
                    className="flex gap-6"
                  >
                    <div className="relative shrink-0 w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center z-10">
                      <span className="font-mono font-bold text-sm text-zinc-900">{step.n}</span>
                    </div>
                    <div className="pt-1.5 pb-2">
                      <p className="font-bold text-zinc-900 mb-1">{step.title}</p>
                      <p className="text-sm text-zinc-500 leading-relaxed max-w-[420px]">{step.detail}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Section 3: Honest proof strip ─────────────────────── */}
        <section className="border-t border-zinc-200/60 bg-zinc-100/60">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-0 sm:divide-x divide-zinc-200">
              {[
                {
                  stat: "Bangalore",
                  label: "Where it started. Expanding as people need it.",
                },
                {
                  stat: "Open source",
                  label: "Every line of code is public on GitHub.",
                  link: "https://github.com/Shreyas-GN/Pulse-Aid",
                  linkLabel: "View →",
                },
                {
                  stat: "Free forever",
                  label: "No ads. No premium tier. No upsell. This isn't a business.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.stat}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i}
                  className="sm:px-10 first:pl-0 last:pr-0 flex-1"
                >
                  <p className="font-extrabold text-zinc-900 tracking-tight text-lg mb-1">{item.stat}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {item.label}{" "}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-900 font-semibold underline underline-offset-2 hover:text-crimson transition-colors"
                      >
                        {item.linkLabel}
                      </a>
                    )}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 4: Founder's note ─────────────────────────── */}
        <section className="border-t border-zinc-200/60 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-20">
            <motion.div
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={0}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-10">
                Why this exists
              </p>
            </motion.div>

            <motion.blockquote
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={1}
              className="border-l-2 border-zinc-300 pl-6 max-w-[520px] space-y-5"
            >
              <p className="text-zinc-700 leading-[1.8] text-base">
                In India, someone needs blood every 2 seconds. When my uncle was in the hospital, we called 40 people. Most said they'd donated recently or weren't the right type. The ones who could help didn't even know we needed them.
              </p>
              <p className="text-zinc-700 leading-[1.8] text-base">
                I built PulseAid so the next family doesn't have to make those 40 calls. If you're a willing donor, sign up. When someone near you needs your blood type, we'll reach out once.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold">
                  SG
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Shreyas G N</p>
                  <p className="text-xs text-zinc-400">Founder, PulseAid</p>
                </div>
              </div>
            </motion.blockquote>
          </div>
        </section>

        {/* ── Section 5: Final CTA ──────────────────────────────── */}
        <section className="border-t border-zinc-200/60 bg-zinc-50">
          <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <motion.div
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={0}
              className="space-y-6"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-zinc-900">
                Ready?
              </h2>
              <p className="text-base text-zinc-500 max-w-sm mx-auto leading-relaxed">
                If you're willing to donate, we'll only contact you when someone near you genuinely needs help. That's the whole promise.
              </p>

              <SignedOut>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors mt-2"
                >
                  Sign up as a donor
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors mt-2"
                >
                  Go to your dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedIn>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200/60 py-6">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 font-medium">
          <span>PulseAid · 2026 · Built in Bangalore</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Shreyas-GN/Pulse-Aid"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-zinc-700 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              Open source
            </a>
            <span>·</span>
            <span>Free forever</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
