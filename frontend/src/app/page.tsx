"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Droplet, MapPin, ArrowRight, Shield, CheckCircle2,
  Heart, Zap, FileText, Users,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  motion, useInView, useMotionValue, useSpring, AnimatePresence,
} from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActivityFeedPreview } from "@/components/landing/ActivityFeedPreview";
import { CommandPalette, useCommandPalette } from "@/components/ui/CommandPalette";

/* ── Motion primitives ──────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const;

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease } },
};

const slideUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/* ── NumberTicker ───────────────────────────────────────────── */
function NumberTicker({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 50, stiffness: 80 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) mv.set(target);
  }, [inView, target, mv]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── RequestPreviewCard ─────────────────────────────────────── */
function RequestPreviewCard() {
  return (
    <div
      className="bg-white rounded-[var(--radius-card)] border border-[var(--color-border)] w-full max-w-[360px]"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-70" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]" />
          </span>
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Live</span>
        </div>
        <StatusBadge status="searching" size="sm" />
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold text-[#D63A3A] text-lg font-[var(--font-mono)]"
            style={{ background: "rgba(214,58,58,0.08)" }}
          >
            O+
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                O+ blood needed
              </span>
              <StatusBadge urgency="IMMEDIATE" size="sm" />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">Manipal Hospital, Bangalore</span>
            </div>
          </div>
        </div>

        {/* Distance + time */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex-1 rounded-2xl px-4 py-2.5"
            style={{ background: "rgba(214,58,58,0.05)", border: "1px solid rgba(214,58,58,0.1)" }}
          >
            <div className="text-[11px] text-[var(--color-text-muted)] mb-0.5">Distance</div>
            <div className="text-[15px] font-bold text-[var(--color-text-primary)] font-[var(--font-mono)]">
              3.2 km
            </div>
          </div>
          <div
            className="flex-1 rounded-2xl px-4 py-2.5"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}
          >
            <div className="text-[11px] text-[var(--color-text-muted)] mb-0.5">Posted</div>
            <div className="text-[15px] font-bold text-[var(--color-text-primary)] font-[var(--font-mono)]">
              4m ago
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          disabled
          className="w-full h-11 rounded-[var(--radius-button)] bg-[var(--color-cta)] text-white text-[14px] font-semibold flex items-center justify-center gap-2 opacity-90 cursor-default"
          aria-label="Preview — sign in to respond"
        >
          <Heart className="w-4 h-4 fill-white stroke-white" />
          I can Help
        </button>
        <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-2.5">
          Sign in to respond to real requests
        </p>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function Home() {
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)]">

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />

      {/* ── Nav ───────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 h-16 flex justify-center border-b border-[var(--color-border-subtle)]"
        style={{ background: "rgba(252,252,251,0.92)", backdropFilter: "blur(16px)" }}
      >
        <nav className="w-full max-w-[1280px] px-6 md:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 outline-none rounded-md focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
            <Droplet className="w-4 h-4 fill-[var(--color-cta)] stroke-[var(--color-cta)]" />
            <span className="text-[15px] font-semibold tracking-tight">BloodRelay</span>
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <SignedIn>
              {/* Command palette trigger */}
              <button
                onClick={() => setCmdOpen(true)}
                className="hidden md:flex items-center gap-2 h-8 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] text-[12px] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)] transition-colors"
                aria-label="Open command palette (Ctrl+K)"
              >
                <span>Search…</span>
                <kbd className="text-[10px] font-mono opacity-60">⌘K</kbd>
              </button>
              <Link href="/dashboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors font-medium">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full" } }} />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors font-medium hidden sm:block">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="h-9 px-5 bg-[var(--color-text-primary)] text-white text-[13px] font-semibold rounded-[var(--radius-button)] flex items-center hover:opacity-90 transition-opacity"
              >
                Register
              </Link>
            </SignedOut>
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">

        {/* ══ 1. HERO ══════════════════════════════════════════ */}
        <section
          className="w-full max-w-[1280px] px-6 md:px-8 flex flex-col items-center text-center pt-24 pb-20 md:pt-32 md:pb-28"
          aria-labelledby="hero-headline"
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease }}
            className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full border border-[var(--color-border)] bg-white"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]" />
            </span>
            <span className="text-[12px] font-medium text-[var(--color-text-muted)]">
              Donor network active across India
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            id="hero-headline"
            variants={stagger}
            initial="hidden"
            animate="show"
            className="font-[var(--font-display)] font-bold text-[var(--color-text-primary)] mb-8 max-w-[720px]"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              wordSpacing: "0.15em",
            }}
          >
            <motion.span variants={fadeIn} className="block">
              Every second
            </motion.span>
            <motion.span variants={fadeIn} className="block text-[var(--color-cta)]">
              someone needs blood.
            </motion.span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18, ease }}
            className="text-[17px] md:text-[19px] text-[var(--color-text-muted)] leading-8 mb-12 max-w-[560px]"
            style={{ wordSpacing: "0.15em" }}
          >
            BloodRelay connects families in crisis with verified nearby donors
            in real time. No middlemen. No delays.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.26, ease }}
            className="flex flex-col sm:flex-row gap-3 mb-7"
          >
            <Link href="/emergency">
              <Button variant="primary" size="lg" className="gap-2 w-full sm:w-auto min-w-[180px]">
                Request Blood
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[180px]">
                Become a Donor
              </Button>
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.36, ease }}
            className="flex flex-col sm:flex-row gap-4 text-[12px] text-[var(--color-text-muted)]"
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Shield className="w-3.5 h-3.5 shrink-0 text-[var(--color-success)]" />
              Contact shared only after acceptance
            </span>
            <span className="hidden sm:block text-[var(--color-border)]">·</span>
            <span className="flex items-center gap-1.5 justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[var(--color-success)]" />
              Free for everyone, always
            </span>
          </motion.div>
        </section>

        {/* ══ 2. TRUST STATS ═══════════════════════════════════ */}
        <section
          className="w-full border-y border-[var(--color-border-subtle)] bg-white"
          aria-label="Platform statistics"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="w-full max-w-[1280px] mx-auto px-6 md:px-8 py-14 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border-subtle)]"
          >
            {[
              { label: "Lives Supported", target: 4200, suffix: "+", sublabel: "and growing every day" },
              { label: "Active Donors", target: 18700, suffix: "+", sublabel: "verified across India" },
              { label: "Avg. Response Time", target: 8, suffix: " min", sublabel: "from post to acceptance" },
            ].map(({ label, target, suffix, sublabel }) => (
              <motion.div
                key={label}
                variants={slideUp}
                className="flex flex-col items-center text-center px-8 py-8 sm:py-0"
              >
                <div
                  className="font-[var(--font-mono)] font-bold text-[var(--color-text-primary)] mb-1.5 tabular-nums"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1 }}
                >
                  <NumberTicker target={target} suffix={suffix} />
                </div>
                <div className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-1">{label}</div>
                <div className="text-[12px] text-[var(--color-text-muted)]">{sublabel}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ══ 3. LIVE ACTIVITY FEED ════════════════════════════ */}
        <section className="w-full max-w-[1280px] mx-auto px-6 md:px-8 py-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            <motion.div variants={slideUp}>
              <span className="text-[11px] font-bold text-[var(--color-cta)] uppercase tracking-[0.12em] mb-4 block">
                Right now
              </span>
              <h2
                className="font-[var(--font-display)] font-bold text-[var(--color-text-primary)] tracking-tight mb-6"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", lineHeight: 1.15, wordSpacing: "0.15em" }}
              >
                BloodRelay is active.<br />People are helping.
              </h2>
              <p className="text-[15px] text-[var(--color-text-muted)] leading-relaxed max-w-[420px] mb-8" style={{ wordSpacing: "0.15em" }}>
                Donors are accepting requests across India right now.
                This is a live window into what coordination looks like
                when it works.
              </p>
            </motion.div>

            <motion.div variants={slideUp}>
              <ActivityFeedPreview />
            </motion.div>
          </motion.div>
        </section>

        {/* ══ 4. HOW IT WORKS ══════════════════════════════════ */}
        <section className="w-full bg-white border-y border-[var(--color-border-subtle)] py-24">
          <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.div variants={fadeIn} className="mb-14 max-w-[480px]">
                <span className="text-[11px] font-bold text-[var(--color-cta)] uppercase tracking-[0.12em] mb-4 block">
                  How it works
                </span>
                <h2
                  className="font-[var(--font-display)] font-bold text-[var(--color-text-primary)] tracking-tight"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", lineHeight: 1.15, wordSpacing: "0.15em" }}
                >
                  Three steps. One life saved.
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-border-subtle)] rounded-[var(--radius-card)] overflow-hidden">
                {[
                  {
                    icon: FileText,
                    step: "01",
                    title: "Describe Emergency",
                    desc: "Blood type, hospital, urgency level. Under 60 seconds. We stripped every non-essential field.",
                  },
                  {
                    icon: MapPin,
                    step: "02",
                    title: "Find Nearby Donors",
                    desc: "Compatible, verified donors within 20 km are notified instantly. The matching engine never sleeps.",
                  },
                  {
                    icon: Heart,
                    step: "03",
                    title: "Receive Help",
                    desc: "A donor accepts. Contact details are exchanged privately. That's the only moment data moves.",
                  },
                ].map(({ icon: Icon, step, title, desc }) => (
                  <motion.div
                    key={step}
                    variants={slideUp}
                    className="bg-white flex flex-col px-8 py-12"
                  >
                    <div className="flex items-start justify-between mb-7">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(214,58,58,0.07)" }}
                      >
                        <Icon className="w-[18px] h-[18px] text-[var(--color-cta)]" aria-hidden="true" />
                      </div>
                      <span
                        className="font-bold text-[var(--color-border)] select-none font-[var(--font-mono)]"
                        style={{ fontSize: "2.5rem", lineHeight: 1, letterSpacing: "-0.04em" }}
                      >
                        {step}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-2.5" style={{ wordSpacing: "0.15em" }}>{title}</h3>
                    <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed" style={{ wordSpacing: "0.15em" }}>{desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ 5. REQUEST PREVIEW CARD ══════════════════════════ */}
        <section className="w-full max-w-[1280px] mx-auto px-6 md:px-8 py-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            <motion.div variants={slideUp} className="lg:order-2">
              <span className="text-[11px] font-bold text-[var(--color-cta)] uppercase tracking-[0.12em] mb-4 block">
                For donors
              </span>
              <h2
                className="font-[var(--font-display)] font-bold text-[var(--color-text-primary)] tracking-tight mb-6"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", lineHeight: 1.15, wordSpacing: "0.15em" }}
              >
                You see what matters.<br />Nothing else.
              </h2>
              <p className="text-[15px] text-[var(--color-text-muted)] leading-7 mb-8 max-w-[420px]" style={{ wordSpacing: "0.15em" }}>
                When a request comes in nearby, you see the blood type, hospital,
                distance, and urgency. One tap to accept. Your contact stays
                private until you do.
              </p>
              <div className="space-y-3.5">
                {[
                  "No commitment until you choose to accept",
                  "Your number is never shown publicly",
                  "Toggle availability off in one tap",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "rgba(16,185,129,0.12)" }}
                    >
                      <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                    </div>
                    <span className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={slideUp} className="flex justify-center lg:order-1">
              <RequestPreviewCard />
            </motion.div>
          </motion.div>
        </section>

        {/* ══ 6. COMMUNITY CTA ════════════════════════════════ */}
        <section className="w-full bg-[var(--color-text-primary)] py-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="w-full max-w-[600px] mx-auto px-6 md:px-8 text-center"
          >
            <motion.div
              variants={fadeIn}
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-7"
              style={{ background: "rgba(214,58,58,0.18)" }}
            >
              <Heart className="w-6 h-6 fill-[var(--color-cta)] stroke-[var(--color-cta)]" aria-hidden="true" />
            </motion.div>

            <motion.h2
              variants={slideUp}
              className="font-[var(--font-display)] font-bold text-white tracking-tight mb-6"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", lineHeight: 1.15, wordSpacing: "0.15em" }}
            >
              Be the reason someone makes it home.
            </motion.h2>

            <motion.p variants={slideUp} className="text-[16px] leading-7 mb-12" style={{ color: "#9CA3AF", wordSpacing: "0.15em" }}>
              Register as a donor in two minutes, or post a request during an
              emergency. Either way, you&apos;re not alone.
            </motion.p>

            <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/emergency">
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                  Need Blood
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="clay" size="lg" className="w-full sm:w-auto">
                  Become a Donor
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* ══ 7. FOOTER ════════════════════════════════════════ */}
        <footer className="w-full border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] py-10">
          <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-7">
              {/* Brand */}
              <Link href="/" className="flex items-center gap-2 outline-none">
                <Droplet className="w-4 h-4 fill-[var(--color-cta)] stroke-[var(--color-cta)]" />
                <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">BloodRelay</span>
              </Link>

              {/* Nav */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[var(--color-text-muted)]">
                <Link href="/sign-up" className="hover:text-[var(--color-text-primary)] transition-colors">
                  Register
                </Link>
                <Link href="/emergency" className="hover:text-[var(--color-text-primary)] transition-colors">
                  Request Blood
                </Link>
                <Link href="/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-[var(--color-text-primary)] transition-colors">
                  Terms
                </Link>
                <a href="mailto:contact@bloodrelay.org" className="hover:text-[var(--color-text-primary)] transition-colors">
                  Contact
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[var(--color-border-subtle)]">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]" />
                </span>
                <span className="text-[12px] text-[var(--color-text-muted)]">
                  BloodRelay is operational
                </span>
              </div>

              <p className="text-[12px] text-[var(--color-text-muted)]">
                © {new Date().getFullYear()} BloodRelay. All rights reserved.
              </p>
            </div>

            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mt-4 max-w-[560px]">
              BloodRelay is a coordination platform. It does not provide medical
              services, professional advice, diagnosis, or treatment.
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}
