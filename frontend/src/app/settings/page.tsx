"use client";

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useApiClient } from '@/lib/useApiClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Shield, Power, MapPin,
    ArrowLeft, AlertTriangle, ChevronRight, User, Droplet, Calendar, CheckCircle, Edit2
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { Input } from '@/components/ui/Input';

// --- Types ---
interface UserSettings {
    auto_disable_on_accept: boolean;
    auto_disable_after_donation: boolean;
    notification_distance_km: number;
    emergency_types: 'IMMEDIATE' | 'ALL';
    push_notifications: boolean;
    status_updates: boolean;
    show_phone_number: boolean;
    share_location: boolean;
    language: string;
    text_size: 'NORMAL' | 'LARGE';
    is_paused: boolean;
}

interface UserProfile {
    id: number;
    first_name: string;
    last_name: string;
    blood_group: string;
    city: string;
    phone_number: string;
    is_available_donor: boolean;
    date_joined: string;
    last_donation_date: string | null;
}

type SettingsView = 'MENU' | 'PROFILE' | 'AVAILABILITY' | 'NOTIFICATIONS' | 'PRIVACY' | 'ACCOUNT';

// --- Animations ---
const slideIn = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 }
};

// --- Components ---
const MenuItem = ({
    icon,
    title,
    subtitle,
    onClick,
    bgClass,
    textClass
}: {
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onClick: () => void,
    bgClass: string,
    textClass: string
}) => (
    <div onClick={onClick} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgClass} ${textClass}`}>
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
            </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
);

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const api = useApiClient();
    const router = useRouter();

    // State
    const [view, setView] = useState<SettingsView>('MENU');
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({ city: '', blood_group: '' });

    // --- Effects ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user) return;
                const { DonorService } = await import('@/services/donor.service');
                const profileData = await DonorService.getProfile(user.id).catch(() => null);
                
                setSettings({
                    auto_disable_on_accept: true,
                    auto_disable_after_donation: false,
                    notification_distance_km: 10,
                    emergency_types: 'ALL',
                    push_notifications: true,
                    status_updates: true,
                    show_phone_number: true,
                    share_location: false,
                    language: 'en',
                    text_size: 'NORMAL',
                    is_paused: false
                });
                
                if (profileData) {
                    setProfile({
                        id: 1,
                        first_name: profileData.full_name?.split(' ')[0] || user.firstName || '',
                        last_name: profileData.full_name?.split(' ').slice(1).join(' ') || user.lastName || '',
                        blood_group: profileData.blood_group,
                        city: profileData.location || '',
                        phone_number: profileData.phone || '',
                        is_available_donor: profileData.is_available_donor,
                        date_joined: profileData.created_at,
                        last_donation_date: null
                    });
                    setProfileFormData({
                        city: profileData.location || '',
                        blood_group: profileData.blood_group || ''
                    });
                }
            } catch (error) {
                console.error('Failed to load data', error);
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded) {
            if (user) {
                fetchData();
            } else {
                router.push('/');
            }
        }
    }, [isLoaded, user, router]);

    // --- Handlers ---
    const updateSetting = async (key: keyof UserSettings, value: any) => {
        if (!settings) return;
        const prevSettings = { ...settings };
        setSettings({ ...settings, [key]: value });
        try {
            await api.patch('users/settings/', { [key]: value });
        } catch (error) {
            setSettings(prevSettings);
        }
    };

    const toggleAvailability = async (checked: boolean) => {
        if (!profile || !user) return;
        const prev = profile.is_available_donor;
        setProfile({ ...profile, is_available_donor: checked });
        try {
            const { DonorService } = await import('@/services/donor.service');
            await DonorService.updateProfile(user.id, { is_available_donor: checked });
        } catch (error) {
            setProfile({ ...profile, is_available_donor: prev });
        }
    };

    const saveProfile = async () => {
        if (!profile || !user) return;
        try {
            const { DonorService } = await import('@/services/donor.service');
            await DonorService.updateProfile(user.id, { 
                location: profileFormData.city,
                blood_group: profileFormData.blood_group
            });
            setProfile({
                ...profile,
                city: profileFormData.city,
                blood_group: profileFormData.blood_group
            });
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Failed to update profile', error);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red"></div></div>;
    if (!settings) return null;

    // --- Sub-Views ---

    const ProfileView = () => (
        <div className="space-y-6">
            <Card variant="default">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-600" />
                                Personal Identity
                            </CardTitle>
                            <CardDescription>Manage your personal details</CardDescription>
                        </div>
                        {isEditingProfile ? (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                                <Button size="sm" onClick={saveProfile}>Save</Button>
                            </div>
                        ) : (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                            <img src={user?.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{profile?.first_name} {profile?.last_name}</h2>
                            <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                            <Badge variant="success" className="text-xs mt-1">Verified</Badge>
                        </div>
                    </div>
                    {/* ... Same as before ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                            <p className="font-medium text-gray-900">{profile?.phone_number}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Member Since</label>
                            <p className="font-medium text-gray-900">{profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Droplet className="w-5 h-5 text-brand-red" /> Blood Information</CardTitle>
                    <CardDescription>Your donor status and blood group</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                        <div>
                            <p className="text-sm text-red-800 font-medium">Blood Group</p>
                            {isEditingProfile ? (
                                <select
                                    value={profileFormData.blood_group}
                                    onChange={(e) => setProfileFormData({ ...profileFormData, blood_group: e.target.value })}
                                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm"
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            ) : (
                                <p className="text-2xl font-bold text-red-900">{profile?.blood_group || 'Not Set'}</p>
                            )}
                        </div>
                        <Droplet className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-900">Donor Status</p>
                            <p className="text-sm text-gray-500">{profile?.is_available_donor ? "✅ Available Donor" : "⛔ Not Available"}</p>
                        </div>
                        <Switch checked={profile?.is_available_donor || false} onCheckedChange={toggleAvailability} />
                    </div>
                </CardContent>
            </Card>

            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-500" /> Location</CardTitle>
                    <CardDescription>Your operating city</CardDescription>
                </CardHeader>
                <CardContent>
                    <label className="text-sm font-medium text-gray-700">Current City</label>
                    {isEditingProfile ? (
                        <Input value={profileFormData.city} onChange={(e) => setProfileFormData({ ...profileFormData, city: e.target.value })} className="mt-1" placeholder="City" />
                    ) : (
                        <p className="text-lg font-medium text-gray-900">{profile?.city || 'Not Set'}</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card variant="elevated">
                    <CardContent className="p-4 text-center">
                        <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Last Donation</p>
                        <p className="font-bold text-gray-900">{profile?.last_donation_date || 'Never'}</p>
                    </CardContent>
                </Card>
                <Card variant="elevated">
                    <CardContent className="p-4 text-center">
                        <CheckCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Lives Impacted</p>
                        <p className="font-bold text-gray-900">0</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const AvailabilityView = () => (
        <Card variant="default">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Availability & Safe Guards
                </CardTitle>
                <CardDescription>Control when you receive emergency requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-gray-700">Notification Distance</label>
                        <span className="text-sm font-bold text-brand-blue">{settings.notification_distance_km} km</span>
                    </div>
                    <Slider
                        value={[settings.notification_distance_km]}
                        min={1} max={50} step={1}
                        onValueChange={(val: number[]) => updateSetting('notification_distance_km', val[0])}
                    />
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900">Auto-disable on Accept</label>
                        </div>
                        <Switch
                            checked={settings.auto_disable_on_accept}
                            onCheckedChange={(checked: boolean) => updateSetting('auto_disable_on_accept', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-900">Emergency Type</label>
                        <select
                            className="text-sm border-gray-300 rounded-md"
                            value={settings.emergency_types}
                            onChange={(e) => updateSetting('emergency_types', e.target.value)}
                        >
                            <option value="ALL">All Urgent</option>
                            <option value="IMMEDIATE">Immediate Only</option>
                        </select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const NotificationView = () => (
        <Card variant="default">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-blue-500" /> Notifications</CardTitle>
                <CardDescription>Manage your alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                    <Switch checked={settings.push_notifications} onCheckedChange={(c: boolean) => updateSetting('push_notifications', c)} />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900">Status Updates</label>
                    <Switch checked={settings.status_updates} onCheckedChange={(c: boolean) => updateSetting('status_updates', c)} />
                </div>
            </CardContent>
        </Card>
    );

    const PrivacyView = () => (
        <Card variant="default">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-green-500" /> Privacy & Safety</CardTitle>
                <CardDescription>Control your data visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-900">Show Phone Number</label>
                        <p className="text-xs text-gray-500">Only after accepting request</p>
                    </div>
                    <Switch checked={settings.show_phone_number} onCheckedChange={(c: boolean) => updateSetting('show_phone_number', c)} />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-900">Share Exact Location</label>
                        <p className="text-xs text-gray-500">Only after accepting request</p>
                    </div>
                    <Switch checked={settings.share_location} onCheckedChange={(c: boolean) => updateSetting('share_location', c)} />
                </div>
            </CardContent>
        </Card>
    );

    const AccountView = () => (
        <Card variant="default" className="border-red-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700"><Power className="w-5 h-5" /> Account Actions</CardTitle>
                <CardDescription>Manage login and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" onClick={() => signOut(() => router.push('/'))}>Log Out</Button>
                <Button variant="ghost" className="w-full text-red-600" onClick={() => alert('Deactivate?')}>Deactivate Account</Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <nav className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {view !== 'MENU' ? (
                            <button onClick={() => setView('MENU')} className="p-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                        ) : (
                            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium text-sm">Dashboard</span>
                            </Link>
                        )}
                    </div>
                    <h1 className="text-lg font-bold text-gray-900">
                        {view === 'MENU' ? 'Settings' :
                            view === 'PROFILE' ? 'My Profile' :
                                view === 'AVAILABILITY' ? 'Availability' :
                                    view === 'NOTIFICATIONS' ? 'Notifications' :
                                        view === 'PRIVACY' ? 'Privacy' : 'Account'}
                    </h1>
                    <div className="w-8"></div>
                </nav>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {view === 'MENU' ? (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* Profile Card Refactored to match others manually for image specific */}
                            <MenuItem
                                icon={
                                    <div className="w-full h-full relative">
                                        <img
                                            src={user?.imageUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                }
                                title={
                                    (profile?.first_name && profile?.last_name)
                                        ? `${profile.first_name} ${profile.last_name}`
                                        : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'My Profile')
                                }
                                subtitle="View & Edit Profile"
                                onClick={() => setView('PROFILE')}
                                bgClass="bg-gray-200 overflow-hidden border border-gray-100 p-0"
                                textClass=""
                            />

                            <MenuItem
                                icon={<AlertTriangle className="w-5 h-5" />}
                                title="Availability & Safety"
                                subtitle="Distance, Emergency filter"
                                onClick={() => setView('AVAILABILITY')}
                                bgClass="bg-orange-100"
                                textClass="text-orange-600"
                            />

                            <MenuItem
                                icon={<Bell className="w-5 h-5" />}
                                title="Notifications"
                                subtitle="Push, Status updates"
                                onClick={() => setView('NOTIFICATIONS')}
                                bgClass="bg-blue-100"
                                textClass="text-blue-600"
                            />

                            <MenuItem
                                icon={<Shield className="w-5 h-5" />}
                                title="Privacy & Safety"
                                subtitle="Visibility controls"
                                onClick={() => setView('PRIVACY')}
                                bgClass="bg-green-100"
                                textClass="text-green-600"
                            />

                            <MenuItem
                                icon={<Power className="w-5 h-5" />}
                                title="Account"
                                subtitle="Logout, Deactivate"
                                onClick={() => setView('ACCOUNT')}
                                bgClass="bg-gray-100"
                                textClass="text-gray-600"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            variants={slideIn}
                            initial="initial" animate="animate" exit="exit"
                        >
                            {view === 'PROFILE' && <ProfileView />}
                            {view === 'AVAILABILITY' && <AvailabilityView />}
                            {view === 'NOTIFICATIONS' && <NotificationView />}
                            {view === 'PRIVACY' && <PrivacyView />}
                            {view === 'ACCOUNT' && <AccountView />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
