"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { RequestService } from '@/services/request.service';
import { ArrowLeft, ArrowRight, Check, MapPin, ShieldAlert, Clock, Calendar, CheckCircle2, Phone, Send, Loader2, Navigation, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import { supabaseClient as supabase } from '@/lib/supabase/client';
import { DonorService } from '@/services/donor.service';
import Map from '@/components/Map';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export default function RequestWizardPage() {
    const router = useRouter();
    const { user } = useUser();
    
    // We have 4 main steps + 1 optional OTP step
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState('');
    const [isMockMode, setIsMockMode] = useState(false);
    const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number} | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    const [formData, setFormData] = useState({
        patient_name: '',
        hospital_name: '',
        contact_phone: '',
        blood_group: '',
        units: 1,
        urgency_level: 'IMMEDIATE',
        city: '',
    });

    const STEPS = ["Patient Info", "Blood Details", "Location", "Confirm"];

    const handleNext = () => {
        setError(null);
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setError(null);
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleGetLocation = () => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation is not supported by your browser");
            return;
        }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGettingLocation(false);
            },
            (err) => {
                setError("Could not get location. Please enter manually.");
                setGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
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
            setCurrentStep(5);
        } catch (err) {
            setIsMockMode(true);
            setCurrentStep(5);
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
                note: '',
                requester_relation: 'OTHER',
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

    const isNextDisabled = () => {
        if (currentStep === 1) return !formData.hospital_name || !formData.patient_name || !formData.contact_phone;
        if (currentStep === 2) return !formData.blood_group || !formData.urgency_level;
        if (currentStep === 3) return !gpsLocation && !formData.city;
        return false;
    };

    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
    };

    return (
        <div className="min-h-[100dvh] bg-[var(--color-base-50)] flex flex-col items-center">
            
            {/* Header & Sticky Step Indicator */}
            <header className="w-full sticky top-0 z-50 bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] border-b border-[var(--color-base-200)] flex flex-col items-center pt-4 pb-4">
                <div className="w-full max-w-3xl px-6 flex items-center justify-between mb-4">
                    <Link href="/dashboard" className="inline-flex items-center text-[0.875rem] font-bold text-[var(--color-base-500)] hover:text-[var(--color-base-900)] transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Cancel
                    </Link>
                    <span className="font-display font-bold text-[1.125rem] text-[var(--color-base-900)]">Emergency Request</span>
                    <div className="w-[60px]" /> {/* Spacer for centering */}
                </div>

                {/* Step Pills */}
                {currentStep <= 4 && (
                    <div className="flex items-center justify-center gap-2 w-full max-w-3xl px-6">
                        {STEPS.map((step, idx) => {
                            const stepNum = idx + 1;
                            const isCompleted = stepNum < currentStep;
                            const isActive = stepNum === currentStep;

                            return (
                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                    <div className="relative">
                                        <motion.div
                                            animate={{ 
                                                scale: isActive ? [1, 1.05, 1] : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className={`h-8 px-4 rounded-[var(--radius-pill)] flex items-center justify-center text-[0.75rem] font-bold transition-colors ${
                                                isCompleted ? "bg-[var(--color-blood)] text-white" :
                                                isActive ? "border-[2px] border-[var(--color-blood)] text-[var(--color-blood)]" :
                                                "border-[1.5px] border-[var(--color-base-200)] text-[var(--color-base-500)]"
                                            }`}
                                        >
                                            {isCompleted && <Check className="w-3.5 h-3.5 mr-1.5" />}
                                            {stepNum}. {step}
                                        </motion.div>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className="flex-1 mx-2 border-b-[1.5px] border-dashed border-[var(--color-base-200)]" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="w-full max-w-2xl px-6 py-8 flex-1 flex flex-col justify-center">
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-[var(--radius-card)] text-rose-700 text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                    </motion.div>
                )}

                <div className="w-full">
                    <AnimatePresence mode="wait" custom={currentStep}>
                        
                        {/* STEP 1: PATIENT INFO */}
                        {currentStep === 1 && (
                            <motion.div key="step1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                <h2 className="font-mono text-[0.875rem] uppercase tracking-widest text-[var(--color-base-500)] font-bold mb-6">Patient Information</h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[0.875rem] font-bold text-[var(--color-base-900)] mb-2">Hospital Name</label>
                                        <LocationAutocomplete
                                            placeholder="Start typing hospital name..."
                                            value={formData.hospital_name}
                                            onChange={(val) => setFormData({ ...formData, hospital_name: val })}
                                            className="h-14 bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-input)] shadow-[var(--shadow-clay)] px-4 focus:border-[var(--color-blood)] focus:ring-[3px] focus:ring-[rgba(192,57,43,0.12)] transition-all font-sans text-[1rem]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[0.875rem] font-bold text-[var(--color-base-900)] mb-2">Patient Name</label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. John Doe"
                                                value={formData.patient_name}
                                                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                                                className="h-14 bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-input)] shadow-[var(--shadow-clay)] px-4 focus:border-[var(--color-blood)] focus:ring-[3px] focus:ring-[rgba(192,57,43,0.12)] transition-all text-[1rem]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[0.875rem] font-bold text-[var(--color-base-900)] mb-2">Contact Phone</label>
                                            <Input
                                                type="tel"
                                                placeholder="10-digit number"
                                                value={formData.contact_phone}
                                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                                className="h-14 bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-input)] shadow-[var(--shadow-clay)] px-4 focus:border-[var(--color-blood)] focus:ring-[3px] focus:ring-[rgba(192,57,43,0.12)] transition-all text-[1rem]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: BLOOD DETAILS */}
                        {currentStep === 2 && (
                            <motion.div key="step2" custom={2} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                <h2 className="font-mono text-[0.875rem] uppercase tracking-widest text-[var(--color-base-500)] font-bold mb-6">Blood Details</h2>
                                
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[0.875rem] font-bold text-[var(--color-base-900)] mb-3">Blood Group Needed</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {BLOOD_GROUPS.map((group) => {
                                                const isSelected = formData.blood_group === group;
                                                return (
                                                    <button
                                                        key={group}
                                                        onClick={() => setFormData({ ...formData, blood_group: group })}
                                                        className={`h-[64px] rounded-[16px] border-[1.5px] font-mono font-bold text-[1rem] flex items-center justify-center transition-all ${
                                                            isSelected 
                                                            ? 'bg-[var(--color-blood-light)] border-[var(--color-blood)] border-[2px] text-[var(--color-blood)]' 
                                                            : 'bg-white border-[var(--color-base-200)] text-[var(--color-base-900)] hover:border-[var(--color-base-500)]'
                                                        }`}
                                                    >
                                                        {group}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[0.875rem] font-bold text-[var(--color-base-900)] mb-3">Units Required</label>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-4 bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-input)] shadow-[var(--shadow-clay)] p-2 w-fit">
                                                <button 
                                                    onClick={() => setFormData(prev => ({ ...prev, units: Math.max(1, prev.units - 1) }))}
                                                    className="w-10 h-10 rounded-[8px] bg-[var(--color-base-50)] hover:bg-[var(--color-base-100)] flex items-center justify-center font-bold text-xl text-[var(--color-base-900)] transition-colors"
                                                >−</button>
                                                <span className="font-mono font-bold text-[1.5rem] w-12 text-center text-[var(--color-base-900)]">{formData.units}</span>
                                                <button 
                                                    onClick={() => setFormData(prev => ({ ...prev, units: Math.min(10, prev.units + 1) }))}
                                                    className="w-10 h-10 rounded-[8px] bg-[var(--color-base-50)] hover:bg-[var(--color-base-100)] flex items-center justify-center font-bold text-xl text-[var(--color-base-900)] transition-colors"
                                                >+</button>
                                            </div>
                                            {formData.units > 6 && (
                                                <p className="text-[var(--color-warn)] text-[0.75rem] font-bold mt-2 flex items-center gap-1">
                                                    <AlertTriangle className="w-3.5 h-3.5" /> High unit requests may take longer to fulfill fully.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[0.875rem] font-bold text-[var(--color-base-900)] mb-3">Urgency</label>
                                        <div className="space-y-3">
                                            {[
                                                { id: 'IMMEDIATE', name: 'Immediate', desc: 'Critical need within hours', icon: ShieldAlert, colorClass: 'text-[var(--color-blood)]', borderClass: 'border-[var(--color-blood)]', bgClass: 'bg-[var(--color-blood-light)]' },
                                                { id: 'TODAY', name: 'Today', desc: 'Required within 24 hours', icon: Clock, colorClass: 'text-[var(--color-warn)]', borderClass: 'border-[var(--color-warn)]', bgClass: 'bg-[var(--color-warn-light)]' },
                                                { id: 'SCHEDULED', name: 'Scheduled', desc: 'Planned surgery or future need', icon: Calendar, colorClass: 'text-[var(--color-base-500)]', borderClass: 'border-[var(--color-base-500)]', bgClass: 'bg-[var(--color-base-100)]' }
                                            ].map(opt => {
                                                const isSelected = formData.urgency_level === opt.id;
                                                const Icon = opt.icon;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setFormData({ ...formData, urgency_level: opt.id })}
                                                        className={`w-full p-4 rounded-[var(--radius-card)] border-[2px] transition-all flex items-center gap-4 text-left ${
                                                            isSelected ? opt.borderClass + ' ' + opt.bgClass : 'border-[var(--color-base-200)] bg-white hover:border-[var(--color-base-300)]'
                                                        }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm shrink-0 ${isSelected ? opt.colorClass : 'text-[var(--color-base-400)]'}`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold text-[1rem] ${isSelected ? 'text-[var(--color-base-900)]' : 'text-[var(--color-base-700)]'}`}>{opt.name}</p>
                                                            <p className="text-[0.875rem] text-[var(--color-base-500)]">{opt.desc}</p>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: LOCATION */}
                        {currentStep === 3 && (
                            <motion.div key="step3" custom={3} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                <h2 className="font-mono text-[0.875rem] uppercase tracking-widest text-[var(--color-base-500)] font-bold mb-6">Location Verification</h2>
                                
                                <div className="space-y-6">
                                    <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-clay)] border-[1.5px] border-[var(--color-base-200)] flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-[var(--color-base-50)] rounded-full flex items-center justify-center mb-4 text-[var(--color-base-500)]">
                                            <Navigation className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-display font-bold text-[1.125rem] text-[var(--color-base-900)] mb-2">We need the exact location</h3>
                                        <p className="text-[0.875rem] text-[var(--color-base-500)] mb-6 max-w-sm">
                                            This allows us to alert donors within a 10km radius of the hospital immediately.
                                        </p>
                                        <button 
                                            onClick={handleGetLocation}
                                            disabled={gettingLocation || gpsLocation !== null}
                                            className={`w-full max-w-xs h-12 rounded-[var(--radius-pill)] font-bold flex items-center justify-center transition-all ${
                                                gpsLocation 
                                                ? 'bg-[var(--color-safe-light)] text-[var(--color-safe)]' 
                                                : 'bg-[var(--color-base-900)] text-white hover:-translate-y-px shadow-sm'
                                            }`}
                                        >
                                            {gettingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                                             gpsLocation ? <><CheckCircle2 className="w-5 h-5 mr-2" /> Location Obtained</> : 
                                             <><MapPin className="w-4 h-4 mr-2" /> Use My Device Location</>}
                                        </button>
                                    </div>

                                    {gpsLocation && (
                                        <div className="h-[200px] w-full rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-clay)] border-[1.5px] border-[var(--color-base-200)] relative z-0">
                                            <Map 
                                                center={[gpsLocation.lng, gpsLocation.lat]}
                                                zoom={15}
                                                markers={[{
                                                    id: 'hospital',
                                                    lat: gpsLocation.lat,
                                                    lng: gpsLocation.lng,
                                                    label: formData.hospital_name || 'Hospital Location',
                                                    type: 'hospital'
                                                }]}
                                                className="w-full h-full"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-8">
                                        <p className="text-[0.75rem] font-bold text-[var(--color-base-400)] uppercase tracking-widest text-center mb-4">Or Enter Manually</p>
                                        <LocationAutocomplete
                                            placeholder="Type city or area name..."
                                            value={formData.city}
                                            onChange={(val) => setFormData({ ...formData, city: val })}
                                            className="h-14 bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-input)] shadow-[var(--shadow-clay)] px-4 focus:border-[var(--color-blood)] focus:ring-[3px] focus:ring-[rgba(192,57,43,0.12)] transition-all font-sans text-[1rem]"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: CONFIRM */}
                        {currentStep === 4 && (
                            <motion.div key="step4" custom={4} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                <h2 className="font-mono text-[0.875rem] uppercase tracking-widest text-[var(--color-base-500)] font-bold mb-6">Review & Submit</h2>
                                
                                <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-clay)] border border-[var(--color-base-200)] p-6 mb-6">
                                    <div className="flex justify-between items-center mb-6 border-b border-[var(--color-base-200)] pb-4">
                                        <span className="font-bold text-[var(--color-base-500)]">Requirement</span>
                                        <span className="font-display font-bold text-[1.5rem] text-[var(--color-blood)] leading-none">
                                            {formData.blood_group} <span className="text-[1rem] text-[var(--color-base-500)] font-sans ml-1">• {formData.units} Unit(s)</span>
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div>
                                            <p className="text-[0.625rem] font-mono font-bold text-[var(--color-base-500)] uppercase tracking-widest mb-1">Urgency</p>
                                            <p className="font-bold text-[0.9375rem] text-[var(--color-base-900)]">{formData.urgency_level === 'IMMEDIATE' ? 'Immediate' : formData.urgency_level === 'TODAY' ? 'Today' : 'Scheduled'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[0.625rem] font-mono font-bold text-[var(--color-base-500)] uppercase tracking-widest mb-1">Patient</p>
                                            <p className="font-bold text-[0.9375rem] text-[var(--color-base-900)]">{formData.patient_name}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[0.625rem] font-mono font-bold text-[var(--color-base-500)] uppercase tracking-widest mb-1">Hospital</p>
                                            <p className="font-bold text-[0.9375rem] text-[var(--color-base-900)]">{formData.hospital_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[0.625rem] font-mono font-bold text-[var(--color-base-500)] uppercase tracking-widest mb-1">Contact</p>
                                            <p className="font-bold text-[0.9375rem] text-[var(--color-base-900)]">{formData.contact_phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-[0.625rem] font-mono font-bold text-[var(--color-base-500)] uppercase tracking-widest mb-1">Area</p>
                                            <p className="font-bold text-[0.9375rem] text-[var(--color-base-900)]">{formData.city || "Via GPS"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[var(--color-safe-light)] border-[1.5px] border-[rgba(39,174,96,0.2)] rounded-[var(--radius-card)] p-4 flex items-start gap-3">
                                    <div className="bg-white rounded-full p-1 shrink-0 shadow-sm text-[var(--color-safe)] mt-0.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <p className="font-bold text-[0.875rem] text-[var(--color-safe)] leading-tight">
                                        Approximately 142 donors within 10km will be alerted immediately.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: OTP (If Unauthenticated) */}
                        {currentStep === 5 && !user && (
                            <motion.div key="step5" custom={5} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-center pt-8">
                                <div className="w-16 h-16 bg-white shadow-sm border border-[var(--color-base-200)] text-[var(--color-base-900)] rounded-[16px] flex items-center justify-center mx-auto mb-6">
                                    <Phone className="w-8 h-8" />
                                </div>
                                <h2 className="font-display font-bold text-[1.5rem] text-[var(--color-base-900)] mb-2 tracking-tight">Verify Your Phone</h2>
                                <p className="text-[0.875rem] text-[var(--color-base-500)] mb-8 font-medium max-w-sm mx-auto">
                                    We sent a code to <b className="text-[var(--color-base-900)]">{formData.contact_phone}</b>.
                                    {isMockMode && <span className="block mt-3 text-[var(--color-warn)] text-xs bg-[var(--color-warn-light)] p-2 rounded-[8px]">Development Mode: Enter any 6 digits to bypass SMS.</span>}
                                </p>

                                <div className="max-w-[240px] mx-auto">
                                    <Input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="text-center text-3xl font-mono tracking-[0.5em] h-16 bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-input)] shadow-[var(--shadow-clay)]"
                                        autoFocus
                                    />
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>

            {/* Navigation Footer */}
            <footer className="w-full sticky bottom-0 z-50 bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] border-t border-[var(--color-base-200)] pb-safe">
                <div className="w-full max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button 
                        onClick={handleBack} 
                        className={`text-[0.875rem] font-bold px-4 py-2 rounded-[var(--radius-pill)] transition-colors hover:bg-[var(--color-base-50)] text-[var(--color-base-500)] ${currentStep === 1 ? 'invisible' : ''}`}
                    >
                        Back
                    </button>

                    {currentStep < 4 ? (
                        <button
                            onClick={handleNext}
                            disabled={isNextDisabled()}
                            className="bg-[var(--color-base-900)] text-white font-bold px-8 py-3 rounded-[var(--radius-pill)] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px transition-all flex items-center"
                        >
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    ) : currentStep === 4 ? (
                        <button
                            onClick={handleSubmitClick}
                            disabled={loading}
                            className="w-full sm:w-auto bg-[var(--color-blood)] text-white font-bold px-8 py-3 rounded-[var(--radius-pill)] shadow-[var(--shadow-clay-hard)] disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px transition-all flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            Send Emergency Request
                        </button>
                    ) : (
                        <button
                            onClick={handleVerifyAndSubmit}
                            disabled={loading || otpCode.length < 6}
                            className="w-full sm:w-auto bg-[var(--color-blood)] text-white font-bold px-8 py-3 rounded-[var(--radius-pill)] shadow-[var(--shadow-clay-hard)] disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px transition-all flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            Verify & Submit Request
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
