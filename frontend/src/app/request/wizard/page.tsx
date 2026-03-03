"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/useApiClient';
import { ArrowLeft, ArrowRight, User, Users, HeartPulse, AlertCircle, ShieldAlert, Clock, Droplet, MapPin, Phone, Send } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export default function RequestWizardPage() {
    const router = useRouter();
    const api = useApiClient();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        requester_relation: '',
        urgency_level: '',
        blood_group: '',
        units: 1,
        patient_name: '',
        hospital_name: '',
        city: '',
        contact_phone: '',
        hospital_latitude: 0,
        hospital_longitude: 0,
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

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            await api.post('requests/', formData);
            router.push('/dashboard');
        } catch (err: any) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                // Show first field-level validation error if present
                const firstError = Object.entries(data)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
                    .join(' | ');
                setError(firstError || 'Failed to create request. Please try again.');
            } else {
                setError('Failed to create request. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Blood</h1>
                    <p className="text-gray-600">Step {currentStep} of 5</p>

                    {/* Progress Bar */}
                    <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-brand-red"
                            initial={{ width: '20%' }}
                            animate={{ width: `${(currentStep / 5) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Step Content */}
                <Card className="border-none shadow-2xl">
                    <CardContent className="p-8">
                        <AnimatePresence mode="wait" custom={currentStep}>
                            {/* Step 1: Who is it for? */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    custom={1}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Who needs blood?</h2>
                                    <p className="text-gray-600 mb-8">Select the relationship to the patient</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { value: 'MYSELF', label: 'Myself', icon: User },
                                            { value: 'FAMILY', label: 'Family', icon: Users },
                                            { value: 'FRIEND', label: 'Friend', icon: HeartPulse },
                                            { value: 'OTHER', label: 'Other', icon: AlertCircle },
                                        ].map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setFormData({ ...formData, requester_relation: option.value });
                                                        setTimeout(handleNext, 200);
                                                    }}
                                                    className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${formData.requester_relation === option.value
                                                        ? 'border-brand-red bg-red-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <Icon className={`w-8 h-8 mx-auto mb-3 ${formData.requester_relation === option.value ? 'text-brand-red' : 'text-gray-400'
                                                        }`} />
                                                    <p className="font-semibold text-gray-900">{option.label}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Urgency */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    custom={2}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">How urgent is it?</h2>
                                    <p className="text-gray-600 mb-8">Select the urgency level</p>

                                    <div className="space-y-4">
                                        {[
                                            { value: 'IMMEDIATE', label: 'Immediate', desc: 'Within 4 hours', color: 'red', icon: ShieldAlert },
                                            { value: 'TODAY', label: 'Today', desc: 'Within 24 hours', color: 'orange', icon: Clock },
                                        ].map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setFormData({ ...formData, urgency_level: option.value });
                                                        setTimeout(handleNext, 200);
                                                    }}
                                                    className={`w-full p-6 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center ${formData.urgency_level === option.value
                                                        ? `border-${option.color}-500 bg-${option.color}-50`
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <Icon className={`w-10 h-10 mr-4 ${formData.urgency_level === option.value ? `text-${option.color}-600` : 'text-gray-400'
                                                        }`} />
                                                    <div className="text-left">
                                                        <p className="font-bold text-lg text-gray-900">{option.label}</p>
                                                        <p className="text-sm text-gray-600">{option.desc}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <Button onClick={handleBack} variant="ghost" className="mt-6 w-full">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                </motion.div>
                            )}

                            {/* Step 3: Blood Group & Units */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    custom={3}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Blood Details</h2>
                                    <p className="text-gray-600 mb-8">Select blood group and units needed</p>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Blood Group</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {bloodGroups.map((group) => (
                                                    <button
                                                        key={group}
                                                        onClick={() => setFormData({ ...formData, blood_group: group })}
                                                        className={`p-4 rounded-lg border-2 font-bold transition-all hover:scale-105 ${formData.blood_group === group
                                                            ? 'border-brand-red bg-red-50 text-brand-red'
                                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {group}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Units Required</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={formData.units}
                                                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
                                                className="text-lg font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <Button onClick={handleBack} variant="outline" className="flex-1">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleNext}
                                            disabled={!formData.blood_group}
                                            className="flex-1"
                                        >
                                            Next
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Patient & Hospital Details */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    custom={4}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Details</h2>
                                    <p className="text-gray-600 mb-8">Enter patient and hospital information</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                                            <Input
                                                type="text"
                                                placeholder="Full name"
                                                value={formData.patient_name}
                                                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                                            <Input
                                                type="text"
                                                placeholder="Hospital name"
                                                value={formData.hospital_name}
                                                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <Input
                                                type="text"
                                                placeholder="City"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                                            <Input
                                                type="tel"
                                                placeholder="10-digit phone number"
                                                value={formData.contact_phone}
                                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <Button onClick={handleBack} variant="outline" className="flex-1">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleNext}
                                            disabled={!formData.patient_name || !formData.hospital_name || !formData.city || !formData.contact_phone}
                                            className="flex-1"
                                        >
                                            Next
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5: Review & Submit */}
                            {currentStep === 5 && (
                                <motion.div
                                    key="step5"
                                    custom={5}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Request</h2>
                                    <p className="text-gray-600 mb-8">Confirm your blood request details</p>

                                    <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Blood Group:</span>
                                            <span className="font-bold text-brand-red text-lg">{formData.blood_group}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Units:</span>
                                            <span className="font-semibold">{formData.units}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Urgency:</span>
                                            <span className={`font-semibold ${formData.urgency_level === 'IMMEDIATE' ? 'text-red-600' : 'text-orange-600'}`}>
                                                {formData.urgency_level}
                                            </span>
                                        </div>
                                        <hr className="border-gray-200" />
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Patient:</span>
                                            <span className="font-semibold">{formData.patient_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Hospital:</span>
                                            <span className="font-semibold">{formData.hospital_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">City:</span>
                                            <span className="font-semibold">{formData.city}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Contact:</span>
                                            <span className="font-semibold">{formData.contact_phone}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <Button onClick={handleBack} variant="outline" className="flex-1">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-1 bg-brand-red hover:bg-red-700"
                                        >
                                            {loading ? 'Submitting...' : 'Submit Request'}
                                            <Send className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
