"use client";

import Link from "next/link";
import { Droplet, Shield, Clock, MapPin, Phone, Activity } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-base-50)] text-[var(--color-base-900)] font-sans">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[rgba(250,250,250,0.85)] backdrop-blur-md border-b border-[var(--color-base-200)] h-16 w-full flex justify-center">
        <nav className="w-full max-w-[1200px] px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 outline-none">
            <Droplet className="w-5 h-5 fill-[var(--color-blood)] stroke-[var(--color-blood)]" />
            <span className="text-lg font-semibold tracking-tight text-[var(--color-base-900)]">BloodReach</span>
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium">
            <SignedIn>
              <Link href="/dashboard" className="text-[var(--color-base-700)] hover:text-[var(--color-base-900)] transition-colors">
                Dashboard
              </Link>
              <div className="relative group">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full border border-[var(--color-base-200)]" } }}
                />
              </div>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="text-[var(--color-base-700)] hover:text-[var(--color-base-900)] transition-colors">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="btn-secondary py-2"
              >
                Register
              </Link>
            </SignedOut>
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">

        {/* ── SECTION 1: HERO ─────────────────────────────────────────── */}
        <section className="w-full max-w-[1200px] px-6 py-24 md:py-32 flex flex-col items-center text-center">
          <h1 className="max-w-[800px] mb-6">
            Real-time blood coordination <br className="hidden md:block"/>
            for <span className="text-[var(--color-blood)]">critical emergencies.</span>
          </h1>
          
          <p className="max-w-[640px] text-lg md:text-xl text-[var(--color-base-500)] mb-10">
            A direct, zero-delay platform connecting people in urgent need with matching blood donors nearby. No middlemen, just immediate connection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/emergency"
              className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Request Blood
            </Link>
            <Link
              href="/sign-up"
              className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Become a Donor
            </Link>
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-sm text-[var(--color-base-500)]">
            <Shield className="w-4 h-4" />
            <span>Secure, verified, and strictly for medical emergencies.</span>
          </div>
        </section>

        {/* ── SECTION 2: CONTEXT (PROBLEM) ─────────────────────────────────── */}
        <section className="w-full bg-[var(--color-white)] border-y border-[var(--color-base-200)] py-20 md:py-28 flex justify-center">
          <div className="w-full max-w-[720px] px-6 flex flex-col">
            <h2 className="mb-6">When seconds matter, social media isn't enough.</h2>
            <p className="text-lg text-[var(--color-base-700)] mb-6">
              During a medical emergency, families often resort to broadcasting desperate appeals across social networks. This approach is chaotic, slow, and overwhelming for people already under extreme stress.
            </p>
            <p className="text-lg text-[var(--color-base-700)]">
              BloodReach replaces panic with a precise coordination system. We instantly notify only compatible, nearby donors who have actively opted in to help—turning a frantic broadcast into a targeted, actionable request.
            </p>
          </div>
        </section>

        {/* ── SECTION 3: HOW IT WORKS ─────────────────────────────────── */}
        <section className="w-full max-w-[1200px] px-6 py-24 md:py-32">
          <div className="text-center mb-16">
            <h2 className="mb-4">How it works</h2>
            <p className="max-w-[600px] mx-auto text-[var(--color-base-500)]">A streamlined process designed for speed and clarity during critical moments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-minimal flex flex-col items-start">
              <div className="w-12 h-12 rounded-full border border-[var(--color-base-200)] flex items-center justify-center mb-6">
                <Activity className="w-5 h-5 text-[var(--color-base-700)]" />
              </div>
              <h3 className="mb-3 text-xl">1. Post a request</h3>
              <p className="text-[var(--color-base-500)]">
                Provide the blood group, location, and urgency. Takes less than a minute.
              </p>
            </div>

            <div className="card-minimal flex flex-col items-start">
              <div className="w-12 h-12 rounded-full border border-[var(--color-base-200)] flex items-center justify-center mb-6">
                <MapPin className="w-5 h-5 text-[var(--color-base-700)]" />
              </div>
              <h3 className="mb-3 text-xl">2. Local donors alerted</h3>
              <p className="text-[var(--color-base-500)]">
                Our system instantly pings only matching, available donors within a 20km radius.
              </p>
            </div>

            <div className="card-minimal flex flex-col items-start">
              <div className="w-12 h-12 rounded-full border border-[var(--color-base-200)] flex items-center justify-center mb-6">
                <Phone className="w-5 h-5 text-[var(--color-base-700)]" />
              </div>
              <h3 className="mb-3 text-xl">3. Connect directly</h3>
              <p className="text-[var(--color-base-500)]">
                When a donor accepts, you receive their contact details to coordinate arrival.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: DIFFERENTIATION ─────────────────────────────────── */}
        <section className="w-full bg-[var(--color-white)] border-y border-[var(--color-base-200)] py-24 md:py-32">
          <div className="w-full max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="flex flex-col">
              <h2 className="mb-6">Built for precision,<br />not engagement.</h2>
              <p className="text-lg text-[var(--color-base-700)]">
                BloodReach is engineered strictly for utility. There are no feeds, no likes, and no unnecessary notifications. Just a reliable protocol to bridge the gap between supply and urgent demand.
              </p>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="flex gap-4">
                <Clock className="w-6 h-6 text-[var(--color-blood)] shrink-0" />
                <div>
                  <h3 className="text-lg mb-2">Zero-delay routing</h3>
                  <p className="text-[var(--color-base-500)]">No administrative bottlenecks. Requests are routed directly to eligible individuals immediately.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-[var(--color-blood)] shrink-0" />
                <div>
                  <h3 className="text-lg mb-2">Privacy focused</h3>
                  <p className="text-[var(--color-base-500)]">Contact information is only shared when a specific emergency request is actively accepted.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-[var(--color-blood)] shrink-0" />
                <div>
                  <h3 className="text-lg mb-2">Hyper-local matching</h3>
                  <p className="text-[var(--color-base-500)]">We filter by geographic proximity to ensure donors can actually reach the hospital in time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: HUMAN / TRUST LAYER ─────────────────────────────────── */}
        <section className="w-full max-w-[800px] mx-auto px-6 py-32 text-center">
          <h2 className="mb-6 text-2xl md:text-3xl font-medium">Technology in service of life.</h2>
          <p className="text-xl text-[var(--color-base-700)] leading-relaxed">
            We believe that finding blood in an emergency shouldn't rely on luck or the size of your social network. It is a logistical problem that can be solved with the right coordination infrastructure. BloodReach exists to provide that infrastructure.
          </p>
        </section>

        {/* ── SECTION 6: DONOR CTA BLOCK ─────────────────────────────────── */}
        <section className="w-full bg-[var(--color-base-100)] py-24 md:py-32">
          <div className="w-full max-w-[800px] mx-auto px-6 text-center">
            <h2 className="mb-4">Your presence matters.</h2>
            <p className="text-lg text-[var(--color-base-600)] mb-10 max-w-[600px] mx-auto">
              By registering as a donor, you provide a silent safety net for your city. You will only be contacted when someone near you is in genuine need.
            </p>
            <Link href="/sign-up" className="btn-secondary px-8 py-3 text-lg">
              Register as a Donor
            </Link>
          </div>
        </section>

        {/* ── SECTION 7: FINAL CTA ─────────────────────────────────── */}
        <section className="w-full bg-[var(--color-white)] py-24 md:py-32 border-t border-[var(--color-base-200)]">
          <div className="w-full max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
            <h2 className="mb-8">Access the coordination platform.</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/emergency" className="btn-primary px-8 py-4 text-lg">
                Request Blood
              </Link>
              <Link href="/sign-up" className="btn-secondary px-8 py-4 text-lg">
                Become a Donor
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── SECTION 8: FOOTER ─────────────────────────────────────────── */}
      <footer className="w-full bg-[var(--color-base-900)] text-[var(--color-base-500)] py-16">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 fill-[var(--color-blood)] stroke-[var(--color-blood)]" />
              <span className="text-lg font-semibold tracking-tight text-white">BloodReach</span>
            </div>
            
            <div className="flex gap-8 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="mailto:contact@bloodreach.org" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="text-center md:text-left text-sm border-t border-[rgba(255,255,255,0.1)] pt-8">
            <p className="mb-4">Disclaimer: BloodReach is a coordination platform and does not provide medical services, professional medical advice, diagnosis, or treatment.</p>
            <p>&copy; {new Date().getFullYear()} BloodReach. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
