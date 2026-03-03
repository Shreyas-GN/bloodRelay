"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/useApiClient';
import { AlertCircle, MapPin, Phone, User, Droplet, ArrowLeft, Save, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

const requesterRelations = [
    { value: 'MYSELF', label: 'Myself' },
    { value: 'FAMILY', label: 'Family Member' },
    { value: 'FRIEND', label: 'Friend' },
    { value: 'OTHER', label: 'Other' },
] as const;

const urgencyLevels = [
    { value: 'IMMEDIATE', label: 'Immediate (next few hours)', color: 'red' },
    { value: 'TODAY', label: 'Today', color: 'orange' },
    { value: 'SCHEDULED', label: 'Scheduled', color: 'blue' },
] as const;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

export default function EditRequestPage() {
    const params = useParams();
    const router = useRouter();
    const api = useApiClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        blood_group: '',
        units: 1,
        patient_name: '',
        hospital_name: '',
        city: '',
        contact_phone: '',
        requester_relation: 'MYSELF',
        urgency_level: 'IMMEDIATE',
        note: '',
    });

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await api.get(`requests/${params.id}/`);
                const request = response.data;

                // Populate form with existing data
                setFormData({
                    blood_group: request.blood_group || '',
                    units: request.units || 1,
                    patient_name: request.patient_name || '',
                    hospital_name: request.hospital_name || '',
                    city: request.city || '',
                    contact_phone: request.contact_phone || '',
                    requester_relation: request.requester_relation || 'MYSELF',
                    urgency_level: request.urgency_level || 'IMMEDIATE',
                    note: request.note || '',
                });
            } catch (err: any) {
                console.error('Failed to fetch request:', err);
                setError('Failed to load request details');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchRequest();
        }
    }, [params.id, api]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await api.patch(`requests/${params.id}/`, formData);
            router.push(`/request/${params.id}`);
        } catch (err: any) {
            console.error('Update error:', err);

            if (err.response?.data) {
                const data = err.response.data;
                if (data.message) {
                    setError(data.message);
                } else {
                    const errorMessages = Object.entries(data)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join(' | ');
                    setError(errorMessages);
                }
            } else {
                setError('Failed to update request. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream to-white">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-red mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading request...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-red-50">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href={`/request/${params.id}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Request</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Droplet className="w-8 h-8 text-brand-red" />
                        <span className="text-2xl font-bold">
                            <span className="text-brand-red">Pulse</span>
                            <span className="text-brand-blue">Aid</span>
                        </span>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                    className="space-y-8"
                >
                    {/* Page Header */}
                    <div className="text-center space-y-3">
                        <h1 className="text-4xl font-bold text-gray-900">Edit Blood Request</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Update the details of your blood request below.
                        </p>
                    </div>

                    {/* Form Card */}
                    <Card variant="elevated" padding="lg" className="border-t-4 border-t-brand-blue">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-red-800">Error Updating Request</h3>
                                        <p className="text-sm text-red-600 mt-1">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Blood Requirements Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Droplet className="w-5 h-5 text-brand-red" />
                                    <h2 className="text-xl font-bold text-gray-900">Blood Requirements</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Blood Group <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={formData.blood_group}
                                            onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                            className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm transition-smooth focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                                        >
                                            <option value="">Select Blood Group</option>
                                            {bloodGroups.map((bg) => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Units Needed <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            required
                                            min="1"
                                            max="20"
                                            value={formData.units || ''}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setFormData({ ...formData, units: isNaN(val) ? 0 : val });
                                            }}
                                            placeholder="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Urgency Level */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Urgency Level</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {urgencyLevels.map((level) => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, urgency_level: level.value })}
                                            className={`p-4 rounded-lg border-2 transition-all text-left ${formData.urgency_level === level.value
                                                ? level.color === 'red'
                                                    ? 'border-red-500 bg-red-50'
                                                    : level.color === 'orange'
                                                        ? 'border-orange-500 bg-orange-50'
                                                        : 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <p className="font-semibold text-gray-900">{level.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Patient & Hospital Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Patient & Hospital Details</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Patient Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            required
                                            minLength={3}
                                            placeholder="John Doe"
                                            value={formData.patient_name}
                                            onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Hospital Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            required
                                            minLength={3}
                                            placeholder="City Hospital"
                                            value={formData.hospital_name}
                                            onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            City <span className="text-red-500">*</span>
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

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Contact Number <span className="text-red-500">*</span>
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
                                                value={formData.contact_phone}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, contact_phone: val });
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Exactly 10 digits</p>
                                    </div>
                                </div>
                            </div>

                            {/* Requester Relation */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-purple-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Your Relation to Patient</h2>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {requesterRelations.map((relation) => (
                                        <button
                                            key={relation.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, requester_relation: relation.value })}
                                            className={`p-4 rounded-lg border-2 transition-all ${formData.requester_relation === relation.value
                                                ? 'border-purple-500 bg-purple-50 text-purple-900'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <p className="font-semibold text-center">{relation.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={150}
                                    placeholder="Any additional information for donors (max 150 characters)..."
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm transition-smooth placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none"
                                />
                                <p className="text-xs text-gray-500">{formData.note.length}/150 characters</p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="pt-6 border-t border-gray-200 flex gap-4">
                                <Link href={`/request/${params.id}`} className="flex-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    size="lg"
                                    className="flex-1 shadow-xl hover:shadow-2xl"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
