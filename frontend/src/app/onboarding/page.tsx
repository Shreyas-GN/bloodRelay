"use client";

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApiClient } from '@/lib/useApiClient';
import { Droplet, MapPin, Phone, User, Heart, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const api = useApiClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        blood_group: '',
        phone_number: '',
        city: '',
        is_available_donor: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('users/profile/', formData);
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Onboarding failed", err);
            setError('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream to-white">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-red mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
            <main className="max-w-4xl mx-auto">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                    className="space-y-8"
                >
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl mb-4">
                            <span className="text-3xl font-bold">
                                <span className="text-brand-red">Pulse</span>
                                <span className="text-brand-blue">Aid</span>
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                            Welcome to the Community
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Complete your profile to start saving lives. Your details help us connect you with people in need instantly.
                        </p>
                    </div>

                    <Card variant="elevated" padding="lg" className="border-t-4 border-t-brand-red max-w-2xl mx-auto">
                        <CardHeader className="text-center pb-8 border-b border-gray-100">
                            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                            <CardDescription>Tell us a bit about yourself</CardDescription>
                        </CardHeader>

                        <CardContent className="pt-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Blood Group Selection */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        What is your Blood Group? <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {bloodGroups.map((bg) => (
                                            <button
                                                key={bg}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, blood_group: bg })}
                                                className={`py-3 rounded-lg text-sm font-bold border-2 transition-all ${formData.blood_group === bg
                                                    ? 'border-brand-red bg-brand-red text-white shadow-lg scale-105'
                                                    : 'border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red'
                                                    }`}
                                            >
                                                {bg}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact & Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Mobile Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                type="tel"
                                                required
                                                minLength={10}
                                                maxLength={10}
                                                pattern="[0-9]{10}"
                                                className="pl-10"
                                                placeholder="9876543210"
                                                value={formData.phone_number}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, phone_number: val });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Current City <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                type="text"
                                                required
                                                minLength={3}
                                                className="pl-10"
                                                placeholder="e.g. Bangalore"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Donor Availability Toggle */}
                                <div className="p-4 bg-green-50 rounded-xl border border-green-200 cursor-pointer transition-colors hover:bg-green-100" onClick={() => setFormData({ ...formData, is_available_donor: !formData.is_available_donor })}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.is_available_donor ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                                            <Heart className="w-6 h-6 fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">Available to Donate</h3>
                                            <p className="text-sm text-gray-600">Turn this on to receive alerts for nearby blood requests.</p>
                                        </div>
                                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_available_donor ? 'bg-green-500' : 'bg-gray-300'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_available_donor ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading || !formData.blood_group}
                                        size="xl"
                                        className="w-full shadow-xl"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                                Saving Profile...
                                            </>
                                        ) : (
                                            <>
                                                Complete Registration
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    <span>Your data is secure and only shared when you accept a request.</span>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
