"use client";

import { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DonorService } from '@/services/donor.service';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    User, Droplet, MapPin, Shield, Calendar, Edit2,
    CheckCircle, AlertTriangle, ArrowLeft, Settings
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    blood_group: string;
    city: string;
    is_available_donor: boolean;
    date_joined: string;
    last_donation_date: string | null;
}

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit States
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        blood_group: '',
        city: '',
        is_available_donor: false,
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const profileData = await DonorService.getProfile(user.id);
                setProfile(profileData as UserProfile);
                setFormData(profileData as any);
            } catch (err: any) {
                if (!err.message?.includes('No rows found')) {
                    setError('Failed to load profile data');
                }
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded) {
            if (user) {
                fetchProfile();
            } else {
                router.push('/');
            }
        }
    }, [isLoaded, user?.id, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const updated = await DonorService.updateProfile(user.id, formData);
            setProfile(updated as UserProfile);
            setSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const toggleDonorStatus = async () => {
        if (!user?.id) return;
        try {
            const newState = !formData.is_available_donor;
            await DonorService.updateProfile(user.id, { is_available_donor: newState });
            setFormData(prev => ({ ...prev, is_available_donor: newState }));
            setProfile(prev => prev ? ({ ...prev, is_available_donor: newState }) : null);
        } catch (err) {
            alert('Failed to update availability');
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <nav className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
                    <div className="w-8"></div> {/* Spacer for center alignment */}
                </nav>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* 1. Basic Identity */}
                <motion.div variants={fadeInUp} initial="initial" animate="animate">
                    <Card variant="elevated">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-gray-500" />
                                    Identity
                                </CardTitle>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button size="sm" onClick={handleSave} disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500 overflow-hidden">
                                    <img src={user?.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{profile.first_name} {profile.last_name}</h2>
                                    <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="success" className="text-xs px-1.5 py-0">Verified</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                                        {profile.phone_number}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Member Since</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                                        {new Date(profile.date_joined).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 2. Blood Information */}
                <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
                    <Card variant="default">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Droplet className="w-5 h-5 text-brand-red" />
                                Blood Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                                <div>
                                    <p className="text-sm text-red-800 font-medium">Blood Group</p>
                                    {isEditing ? (
                                        <select
                                            value={formData.blood_group}
                                            onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-red focus:ring focus:ring-brand-red focus:ring-opacity-50"
                                        >
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-2xl font-bold text-red-900">{profile.blood_group || 'Not Set'}</p>
                                    )}
                                </div>
                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm">
                                    <Droplet className="w-5 h-5 fill-current" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div>
                                    <p className="font-semibold text-gray-900">Donor Status</p>
                                    <p className="text-sm text-gray-500">
                                        {profile.is_available_donor
                                            ? "✅ You are listed as an available donor"
                                            : "⛔ You are NOT receiving emergency alerts"}
                                    </p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                    <button
                                        onClick={toggleDonorStatus}
                                        className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${profile.is_available_donor ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ${profile.is_available_donor ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 3. Location */}
                <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
                    <Card variant="default">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700">Current City</label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="mt-1"
                                            placeholder="Enter your city"
                                        />
                                    ) : (
                                        <p className="mt-1 text-lg font-medium text-gray-900">{profile.city || 'Location not set'}</p>
                                    )}
                                </div>
                                {/* In a real app, we'd have a 'Use GPS' button here filling the lat/long */}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                <Shield className="w-3 h-3 inline mr-1" />
                                Your exact location is only shared when you accept an emergency request.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 4. Trust Stats */}
                <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
                    <div className="grid grid-cols-2 gap-4">
                        <Card variant="elevated">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <p className="text-sm text-gray-500">Last Donation</p>
                                <p className="font-bold text-gray-900">{profile.last_donation_date || 'Never'}</p>
                            </CardContent>
                        </Card>
                        <Card variant="elevated">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <p className="text-sm text-gray-500">Lives Impacted</p>
                                <p className="font-bold text-gray-900">0</p>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* 5. Settings Shortcut */}
                <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.4 }}>
                    <Link href="/settings">
                        <div className="bg-white border hover:bg-gray-50 border-gray-200 p-4 rounded-xl flex items-center justify-between transition-colors cursor-pointer group shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <Settings className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">App Settings</h3>
                                    <p className="text-sm text-gray-500">Notifications, Privacy, and Emergency Preferences</p>
                                </div>
                            </div>
                            <div className="text-gray-400">→</div>
                        </div>
                    </Link>
                </motion.div>

            </main>
        </div>
    );
}
