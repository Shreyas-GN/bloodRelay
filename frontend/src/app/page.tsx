"use client";

import Link from "next/link";
import { AlertCircle, Heart, Droplet, MapPin, Clock, ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-cream via-white to-red-50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Droplet className="w-8 h-8 text-brand-red group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-brand-red">Pulse</span>
              <span className="text-brand-blue">Aid</span>
            </span>
          </Link>

          <SignedIn>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          </SignedOut>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-balance">
                Save Lives with
                <span className="block mt-2 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  Emergency Blood Coordination
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto text-balance">
                Connect donors with those in need. Fast, trusted, and life-saving.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="xl" className="group">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/request">
                  <Button variant="outline" size="xl">
                    <AlertCircle className="w-5 h-5" />
                    Request Blood
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <Link href="/sign-up">
                  <Button size="xl" className="group">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" size="xl">
                    Sign In
                  </Button>
                </Link>
              </SignedOut>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-red">24/7</div>
                <div className="text-sm text-gray-600 mt-1">Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-red">Instant</div>
                <div className="text-sm text-gray-600 mt-1">Matching</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-red">Verified</div>
                <div className="text-sm text-gray-600 mt-1">Donors</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How Pulse Aid Works</h2>
            <p className="text-xl text-gray-600">Emergency blood, handled calmly.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Register as Donor",
                description: "Sign up and add your blood group, location, and availability.",
                color: "text-red-500"
              },
              {
                icon: AlertCircle,
                title: "Request Blood",
                description: "Create an emergency request with patient and hospital details.",
                color: "text-blue-500"
              },
              {
                icon: MapPin,
                title: "Get Matched",
                description: "Our system finds nearby donors and connects you instantly.",
                color: "text-green-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="elevated" className="h-full hover:scale-105 transition-transform border-t-brand-red">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4 ${feature.color}`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-brand-red to-red-700 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <h2 className="text-4xl sm:text-5xl font-bold">Ready to Make a Difference?</h2>
          <p className="text-xl opacity-90">
            Join our community of life-savers today. Every donation counts.
          </p>
          <SignedOut>
            <Link href="/sign-up">
              <Button size="xl" variant="secondary" className="bg-white text-brand-red hover:bg-gray-100">
                Sign Up Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="xl" variant="secondary" className="bg-white text-brand-red hover:bg-gray-100">
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </SignedIn>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-brand-blue text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm opacity-75">© 2026 Pulse Aid. Emergency blood, handled calmly.</p>
        </div>
      </footer>
    </div>
  );
}
