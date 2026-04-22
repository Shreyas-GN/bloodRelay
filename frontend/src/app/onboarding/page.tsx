"use client";

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DonorService } from '@/services/donor.service';
import { Droplet, MapPin, Phone, Heart, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
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
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            await DonorService.updateProfile(user.id, formData);
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Onboarding failed", err);
            setError("We couldn't save your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-crimson animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center selection:bg-crimson/30">
            <main className="max-w-2xl mx-auto w-full">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                    className="space-y-10"
                >
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center bg-rose-500/10 text-crimson rounded-2xl p-4 mb-2">
                            <Droplet className="w-8 h-8 fill-crimson stroke-crimson" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                            One last thing before you start.
                        </h1>
                        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto font-medium">
                            Your blood group and location let us notify you when someone nearby needs help. This takes 30 seconds.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                        <div className="p-8 sm:p-10">
                            {error && (
                                <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-10">
                                {/* Blood Group Selection */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-zinc-900 dark:text-white">
                                        What is your Blood Group? <span className="text-crimson">*</span>
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {bloodGroups.map((bg) => {
                                            const isSelected = formData.blood_group === bg;
                                            return (
                                                <button
                                                    key={bg}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, blood_group: bg })}
                                                    className={`py-4 rounded-xl font-bold font-mono text-lg transition-all border-2 ${isSelected
                                                            ? 'border-crimson bg-rose-500/5 text-crimson scale-[1.02] shadow-sm'
                                                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                        }`}
                                                >
                                                    {bg}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Contact & Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-zinc-900 dark:text-white">
                                            Mobile Number <span className="text-crimson">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                            <Input
                                                type="tel"
                                                required
                                                minLength={10}
                                                maxLength={10}
                                                pattern="[0-9]{10}"
                                                className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                                                placeholder="10-digit number"
                                                value={formData.phone_number}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, phone_number: val });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-zinc-900 dark:text-white">
                                            Current City <span className="text-crimson">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                            <Input
                                                type="text"
                                                required
                                                minLength={3}
                                                className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl font-medium"
                                                placeholder="e.g. Bangalore"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Donor Availability Toggle */}
                                <div
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.is_available_donor
                                            ? 'border-emerald-500/20 bg-emerald-500/5'
                                            : 'border-zinc-200 dark:border-zinc-800 bg-transparent'
                                        }`}
                                    onClick={() => setFormData({ ...formData, is_available_donor: !formData.is_available_donor })}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0 ${formData.is_available_donor ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                            }`}>
                                            <Heart className="w-6 h-6 fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold tracking-tight mb-1 ${formData.is_available_donor ? 'text-emerald-900 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>Available to help</h3>
                                            <p className="text-sm text-zinc-500 font-medium">When this is on, you'll get a notification if someone near you needs blood with your group.</p>
                                        </div>
                                        <div className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${formData.is_available_donor ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                            <span className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white transition-transform ${formData.is_available_donor ? 'translate-x-[22px]' : 'translate-x-1'}`}>
                                                {formData.is_available_donor && <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-6">
                                    <button
                                        type="submit"
                                        disabled={loading || !formData.blood_group || !formData.phone_number || !formData.city}
                                        className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <><span className="w-5 h-5 rounded-full border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black animate-spin mr-3" /> Saving Profile...</>
                                        ) : (
                                            <>
                                                Save and get started
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-500">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>Your data is secure and only shared when you accept a request.</span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}