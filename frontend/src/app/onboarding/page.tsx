"use client";

import { useUser, useSession } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getProfileAction } from '@/app/actions/donor.actions';
import { useProfile } from '@/context/AuthContext';
import { ActivityService } from '@/services/activity.service';
import { Droplet, MapPin, Phone, Heart, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import { getCurrentPosition } from '@/lib/geolocation';
import { createClerkSupabaseClient, supabaseClient } from '@/lib/supabase/client';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
};

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const { session } = useSession();
    const { refetch } = useProfile();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !user) return;
        getProfileAction()
            .then((p: any) => { if (p?.profile_completed) router.replace("/dashboard"); })
            .catch(() => {});
    }, [isLoaded, user, router]);

    const [formData, setFormData] = useState({
        blood_group: '',
        phone: '',
        location: '',
        latitude: null as number | null,
        longitude: null as number | null,
        is_available_donor: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[onboarding:page] ▶ handleSubmit fired', { userId: user?.id, formData });

        if (!user?.id) {
            console.warn('[onboarding:page] No user id — aborting');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            let lat = formData.latitude;
            let lng = formData.longitude;
            let locationPoint = null;

            if (!lat || !lng) {
                console.log('[onboarding:page] No coords in form — attempting GPS');
                try {
                    const pos = await getCurrentPosition();
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                    console.log('[onboarding:page] GPS resolved:', { lat, lng });
                } catch (gpsErr) {
                    console.warn('[onboarding:page] GPS failed (non-fatal):', gpsErr);
                }
            }
            if (lat && lng) locationPoint = `POINT(${lng} ${lat})`;
            console.log('[onboarding:page] locationPoint:', locationPoint);

            console.log('[onboarding:page] Calling saveOnboardingProfile...');
            const { saveOnboardingProfile } = await import('./actions');
            await saveOnboardingProfile({
                full_name: user.fullName || 'Anonymous User',
                blood_group: formData.blood_group,
                phone: formData.phone,
                city: formData.location,
                is_available_donor: formData.is_available_donor,
                latitude: lat ?? null,
                longitude: lng ?? null,
                location: locationPoint ?? null,
            });
            console.log('[onboarding:page] ✔ saveOnboardingProfile resolved');

            // Reload the Clerk user object so publicMetadata is fresh in the browser.
            console.log('[onboarding:page] Calling user.reload()...');
            await user.reload();
            console.log('[onboarding:page] ✔ user.reload() done. publicMetadata:', user.publicMetadata);

            // Refresh the profile context.
            console.log('[onboarding:page] Calling refetch()...');
            await refetch();
            console.log('[onboarding:page] ✔ refetch() done');

            // Use a full-page navigation instead of router.push.
            // router.push is a client-side transition that reuses the existing browser
            // JWT cookie; that cookie has stale claims (~60 s lag after updateUserMetadata).
            // The server action already set an `onboarding_complete` bridge cookie so
            // the middleware will pass this request through immediately.
            console.log('[onboarding:page] Navigating to /dashboard via window.location...');
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('[onboarding:page] ✖ Error in handleSubmit:', err);
            setError("We couldn't save your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--color-base-50)]">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--color-base-200)] border-t-[var(--color-blood)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[var(--color-base-50)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <main className="max-w-xl mx-auto w-full">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center bg-[var(--color-blood-light)] rounded-2xl p-4 mb-1">
                            <Droplet className="w-7 h-7 fill-[var(--color-blood)] stroke-[var(--color-blood)]" />
                        </div>
                        <h1 className="text-[1.75rem] font-extrabold text-[var(--color-base-900)] tracking-tight">
                            Complete your donor profile.
                        </h1>
                        <p className="text-[0.9375rem] text-[var(--color-base-500)] max-w-md mx-auto">
                            Your blood group and city let us notify you only when someone nearby needs help. Takes 30 seconds.
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="bg-white rounded-[var(--radius-card)] border border-[var(--color-base-200)] shadow-[var(--shadow-clay)] overflow-hidden">
                        <div className="p-6 sm:p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-[var(--color-blood-light)] border border-rose-200 rounded-[var(--radius-input)] text-[var(--color-blood)] text-sm font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-blood)] shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Blood Group */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-[var(--color-base-900)]">
                                        Blood group <span className="text-[var(--color-blood)]">*</span>
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {bloodGroups.map((bg) => {
                                            const isSelected = formData.blood_group === bg;
                                            return (
                                                <button
                                                    key={bg}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, blood_group: bg })}
                                                    className={`py-3 rounded-[var(--radius-input)] font-bold font-mono text-base transition-all border-2 ${
                                                        isSelected
                                                            ? 'border-[var(--color-blood)] bg-[var(--color-blood-light)] text-[var(--color-blood)]'
                                                            : 'border-[var(--color-base-200)] text-[var(--color-base-700)] hover:border-[var(--color-base-400)]'
                                                    }`}
                                                >
                                                    {bg}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Contact & Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-[var(--color-base-900)]">
                                            Mobile number <span className="text-[var(--color-blood)]">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-400)]" />
                                            <Input
                                                type="tel"
                                                required
                                                minLength={10}
                                                maxLength={10}
                                                pattern="[0-9]{10}"
                                                className="pl-10 h-12 bg-[var(--color-base-50)] border-[var(--color-base-200)] rounded-[var(--radius-input)] font-medium"
                                                placeholder="10-digit number"
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, phone: val });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-[var(--color-base-900)]">
                                            Current city <span className="text-[var(--color-blood)]">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-400)] z-10" />
                                            <LocationAutocomplete
                                                placeholder="e.g. Bangalore"
                                                value={formData.location}
                                                onChange={(val) => setFormData({ ...formData, location: val })}
                                                className="pl-10 h-12 bg-[var(--color-base-50)] border-[var(--color-base-200)] rounded-[var(--radius-input)] font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Availability toggle */}
                                <div
                                    className={`p-5 rounded-[var(--radius-card)] border-2 cursor-pointer transition-all ${
                                        formData.is_available_donor
                                            ? 'border-[var(--color-safe)] bg-[var(--color-safe-light)]'
                                            : 'border-[var(--color-base-200)] bg-transparent'
                                    }`}
                                    onClick={() => setFormData({ ...formData, is_available_donor: !formData.is_available_donor })}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                                            formData.is_available_donor
                                                ? 'bg-[var(--color-safe)] text-white'
                                                : 'bg-[var(--color-base-100)] text-[var(--color-base-400)]'
                                        }`}>
                                            <Heart className="w-5 h-5 fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold text-sm mb-0.5 ${
                                                formData.is_available_donor ? 'text-[var(--color-safe)]' : 'text-[var(--color-base-900)]'
                                            }`}>
                                                Available to help
                                            </h3>
                                            <p className="text-xs text-[var(--color-base-500)]">
                                                When this is on, you'll get a notification if someone near you needs blood.
                                            </p>
                                        </div>
                                        <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                            formData.is_available_donor ? 'bg-[var(--color-safe)]' : 'bg-[var(--color-base-200)]'
                                        }`}>
                                            <span className={`inline-flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                formData.is_available_donor ? 'translate-x-[22px]' : 'translate-x-1'
                                            }`}>
                                                {formData.is_available_donor && (
                                                    <Check className="w-2.5 h-2.5 text-[var(--color-safe)]" strokeWidth={3} />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="pt-2 space-y-4">
                                    <button
                                        type="submit"
                                        disabled={loading || !formData.blood_group || !formData.phone || !formData.location}
                                        className="w-full h-12 bg-[var(--color-base-900)] text-white font-bold rounded-[var(--radius-button)] flex items-center justify-center shadow-[var(--shadow-clay)] clay-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2.5" />
                                                Saving…
                                            </>
                                        ) : (
                                            <>
                                                Save and get started
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-base-500)]">
                                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-safe)]" />
                                        Your data is only shared when you accept a request.
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
