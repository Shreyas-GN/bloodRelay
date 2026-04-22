"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { RequestService } from '@/services/request.service';
import { ArrowLeft, ArrowRight, User, Users, HeartPulse, AlertCircle, ShieldAlert, Clock, Droplet, MapPin, Phone, Send } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabaseClient as supabase } from '@/lib/supabase/client';
import { DonorService } from '@/services/donor.service';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export default function RequestWizardPage() {
    const router = useRouter();
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState('');
    const [isMockMode, setIsMockMode] = useState(false);
    const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn("Geolocation denied or unavailable:", err),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    }, []);

    const [formData, setFormData] = useState({
        requester_relation: '',
        urgency_level: '',
        blood_group: '',
        units: 1,
        patient_name: '',
        hospital_name: '',
        city: '',
        contact_phone: '',
        note: '',
    });

    const handleNext = () => {
        setError(null);
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setError(null);
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSendOtp = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                phone: formData.contact_phone,
            });
            if (otpError) {
                console.warn('Supabase OTP failed, falling back to mock mode.', otpError);
                setIsMockMode(true);
            }
            setCurrentStep(6);
        } catch (err) {
            setIsMockMode(true);
            setCurrentStep(6);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndSubmit = async () => {
        setLoading(true);
        setError(null);
        let finalUserId = user?.id;

        try {
            if (!user) {
                if (isMockMode) {
                    const { data, error: anonError } = await supabase.auth.signInAnonymously();
                    if (anonError) throw anonError;
                    finalUserId = data.user?.id;
                } else {
                    const { data, error: verifyError } = await supabase.auth.verifyOtp({
                        phone: formData.contact_phone,
                        token: otpCode,
                        type: 'sms',
                    });
                    if (verifyError) throw verifyError;
                    finalUserId = data.user?.id;
                }

                if (finalUserId) {
                    await DonorService.updateProfile(finalUserId, {
                        full_name: formData.patient_name + ' (Requester)',
                        phone: formData.contact_phone,
                        location: formData.city,
                        blood_group: formData.blood_group,
                        is_donor: false,
                    });
                }
            }

            if (!finalUserId) throw new Error("Authentication failed.");

            await RequestService.createRequest({
                requester_id: finalUserId,
                patient_name: formData.patient_name,
                hospital_name: formData.hospital_name,
                city: formData.city,
                contact_phone: formData.contact_phone,
                blood_group: formData.blood_group,
                units: formData.units,
                urgency_level: formData.urgency_level,
                location: gpsLocation ? `POINT(${gpsLocation.lng} ${gpsLocation.lat})` : 'POINT(0 0)', 
            });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || "We couldn't submit your request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitClick = () => {
        if (!user) {
            handleSendOtp();
        } else {
            handleVerifyAndSubmit();
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.98
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.98
        })
    };

    return (
        <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-crimson/30">
            <div className="w-full max-w-2xl">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2 tracking-tight">Request Help</h1>
                    <p className="text-sm font-medium text-zinc-500">Step {currentStep} of {user ? 5 : 6}</p>

                    {/* Progress Bar */}
                    <div className="mt-6 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden max-w-xs mx-auto">
                        <motion.div
                            className="h-full bg-crimson"
                            initial={{ width: '20%' }}
                            animate={{ width: `${(currentStep / (user ? 5 : 6)) * 100}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-sm font-medium flex items-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </motion.div>
                )}

                {/* Step Content Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="p-6 md:p-10 relative min-h-[400px] flex flex-col justify-center">
                        <AnimatePresence mode="wait" custom={currentStep}>
                            
                            {/* Step 1: Who is it for? */}
                            {currentStep === 1 && (
                                <motion.div key="step1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Who needs blood?</h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">Who are you requesting for?</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { value: 'MYSELF', label: 'Myself', icon: User },
                                            { value: 'FAMILY', label: 'Family', icon: Users },
                                            { value: 'FRIEND', label: 'Friend', icon: HeartPulse },
                                            { value: 'OTHER', label: 'Other', icon: AlertCircle },
                                        ].map((option) => {
                                            const Icon = option.icon;
                                            const isSelected = formData.requester_relation === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setFormData({ ...formData, requester_relation: option.value });
                                                        setTimeout(handleNext, 250);
                                                    }}
                                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                                                        isSelected
                                                        ? 'border-crimson bg-rose-500/5 shadow-[0_4px_14px_rgba(192,57,43,0.1)] scale-[1.02]'
                                                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-transparent'
                                                    }`}
                                                >
                                                    <Icon className={`w-8 h-8 ${isSelected ? 'text-crimson' : 'text-zinc-400 dark:text-zinc-600'}`} />
                                                    <p className={`font-bold ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>{option.label}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Urgency */}
                            {currentStep === 2 && (
                                <motion.div key="step2" custom={2} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">How fast do you need it?</h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">This helps us notify people appropriately.</p>

                                    <div className="space-y-4">
                                        {[
                                            { value: 'IMMEDIATE', label: 'Immediate', desc: 'Needed in the next few hours', color: 'rose', icon: ShieldAlert },
                                            { value: 'TODAY', label: 'Today', desc: 'Needed within 24 hours', color: 'amber', icon: Clock },
                                        ].map((option) => {
                                            const Icon = option.icon;
                                            const isSelected = formData.urgency_level === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setFormData({ ...formData, urgency_level: option.value });
                                                        setTimeout(handleNext, 250);
                                                    }}
                                                    className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center text-left ${
                                                        isSelected
                                                        ? `border-${option.color}-500 bg-${option.color}-500/5 shadow-[0_4px_14px_rgba(0,0,0,0.05)] scale-[1.01]`
                                                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-transparent'
                                                    }`}
                                                >
                                                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-5 ${isSelected ? `bg-${option.color}-500/10` : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                                        <Icon className={`w-6 h-6 ${isSelected ? `text-${option.color}-500` : 'text-zinc-400 dark:text-zinc-500'}`} />
                                                    </div>
                                                    <div>
                                                        <p className={`font-extrabold text-lg tracking-tight mb-1 ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>{option.label}</p>
                                                        <p className="text-sm font-medium text-zinc-500">{option.desc}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-8 flex justify-start">
                                        <button onClick={handleBack} className="flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Go Back
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Blood Group & Units */}
                            {currentStep === 3 && (
                                <motion.div key="step3" custom={3} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="h-full flex flex-col">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Blood Requirement</h2>
                                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">Select the specific details.</p>

                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-4">Blood Group</label>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {bloodGroups.map((group) => {
                                                        const isSelected = formData.blood_group === group;
                                                        return (
                                                        <button
                                                            key={group}
                                                            onClick={() => setFormData({ ...formData, blood_group: group })}
                                                            className={`p-4 rounded-xl border-2 font-bold font-mono text-lg transition-all ${
                                                                isSelected
                                                                ? 'border-crimson bg-rose-500/5 text-crimson scale-[1.05] shadow-sm'
                                                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                            }`}
                                                        >
                                                            {group}
                                                        </button>
                                                    )})}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-4">Units Required</label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="20"
                                                    value={formData.units}
                                                    onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
                                                    className="text-lg font-bold h-14 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl px-4"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-zinc-200 dark:border-white/10">
                                        <button onClick={handleBack} className="flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!formData.blood_group}
                                            className="px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Next Step
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Patient details */}
                            {currentStep === 4 && (
                                <motion.div key="step4" custom={4} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="h-full flex flex-col">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Location & Contact</h2>
                                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">Where should donors go?</p>

                                        <div className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Patient's Full Name</label>
                                                    <Input
                                                        type="text"
                                                        placeholder="Sarah Jenkins"
                                                        value={formData.patient_name}
                                                        onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                                                        className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Your Phone Number</label>
                                                    <Input
                                                        type="tel"
                                                        placeholder="10-digit number"
                                                        value={formData.contact_phone}
                                                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                                        className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Hospital Name</label>
                                                <Input
                                                    type="text"
                                                    placeholder="City Hospital, Emergency Ward"
                                                    value={formData.hospital_name}
                                                    onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                                                    className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">City</label>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g. Bangalore"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-zinc-200 dark:border-white/10">
                                        <button onClick={handleBack} className="flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!formData.patient_name || !formData.hospital_name || !formData.city || !formData.contact_phone}
                                            className="px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Review Details
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5: Review & Submit */}
                            {currentStep === 5 && (
                                <motion.div key="step5" custom={5} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="h-full flex flex-col">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Before we send this out</h2>
                                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">Please verify the details below are correct.</p>

                                        <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/30 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                                                <span className="text-zinc-500 font-medium text-sm">Requirement</span>
                                                <span className="font-extrabold text-crimson font-mono text-lg">{formData.blood_group} • {formData.units} Unit(s)</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 px-2">
                                                <div className="space-y-1">
                                                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Urgency</span>
                                                    <span className="font-bold text-zinc-900 dark:text-white">{formData.urgency_level === 'IMMEDIATE' ? 'Next few hours' : 'Within 24 hours'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Patient</span>
                                                    <span className="font-bold text-zinc-900 dark:text-white">{formData.patient_name}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Hospital</span>
                                                    <span className="font-bold text-zinc-900 dark:text-white">{formData.hospital_name}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Contact</span>
                                                    <span className="font-bold text-zinc-900 dark:text-white">{formData.contact_phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-zinc-200 dark:border-white/10">
                                        <button onClick={handleBack} className="flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSubmitClick}
                                            disabled={loading}
                                            className="px-8 py-3.5 bg-crimson text-white font-bold rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(192,57,43,0.3)] disabled:opacity-50 transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" /> Sending...</>
                                            ) : (
                                                <>
                                                    {user ? "Find a donor now" : "Continue to Verify"}
                                                    <Send className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 6: OTP Verification (Guests Only) */}
                            {currentStep === 6 && !user && (
                                <motion.div key="step6" custom={6} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="h-full flex flex-col items-center text-center">
                                    <div className="flex-1 w-full max-w-sm flex flex-col justify-center items-center">
                                        <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white rounded-2xl flex items-center justify-center mb-6">
                                            <Phone className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Verify Your Phone</h2>
                                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium">
                                            We sent a code to <b className="text-zinc-900 dark:text-white">{formData.contact_phone}</b>
                                            {isMockMode && <span className="block mt-2 text-amber-600 dark:text-amber-400 text-xs bg-amber-500/10 p-2 rounded-lg">SMS is not configured. Enter any 6 digits to bypass in development.</span>}
                                        </p>

                                        <div className="w-full">
                                            <Input
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="text-center text-3xl font-mono tracking-[0.5em] h-16 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-zinc-200 dark:border-white/10 w-full">
                                        <button onClick={handleBack} className="flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </button>
                                        <button
                                            onClick={handleVerifyAndSubmit}
                                            disabled={loading || otpCode.length < 6}
                                            className="px-8 py-3.5 bg-crimson text-white font-bold rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(192,57,43,0.3)] disabled:opacity-50 transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" /> Verifying...</>
                                            ) : (
                                                <>Verify & Find Donors <ArrowRight className="w-4 h-4 ml-2" /></>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
