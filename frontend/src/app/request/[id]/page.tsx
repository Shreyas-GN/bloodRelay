"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/useApiClient';
import { useUser } from '@clerk/nextjs';
import { DonorService } from '@/services/donor.service';
import { AlertCircle, Droplet, MapPin, Phone, User, Clock, CheckCircle, ArrowLeft, Heart, Edit, Trash2, Share2, Shield } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CancelRequestButton } from '@/components/CancelRequestButton';

interface BloodRequest {
    id: number;
    blood_group: string;
    units: number;
    patient_name: string;
    hospital_name: string;
    city: string;
    contact_phone: string;
    requester_relation: string;
    urgency_level: 'IMMEDIATE' | 'TODAY' | 'SCHEDULED';
    note: string;
    status: string;
    created_at: string;
    requester: {
        id: number;
        first_name: string;
        last_name: string;
        phone_number?: string;
    };
    assigned_donor?: {
        id: number;
        first_name: string;
        last_name: string;
        phone_number?: string;
    };
}

interface MatchingDonor {
    id: number;
    name: string;
    blood_group: string;
    city: string;
    phone_number: string;
    distance_km: number;
}

interface BloodBank {
    id: number;
    name: string;
    city: string;
    phone_number: string;
    address: string;
}

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

export default function RequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const api = useApiClient();
    const { user } = useUser();

    const [request, setRequest] = useState<BloodRequest | null>(null);
    const [donors, setDonors] = useState<MatchingDonor[]>([]);
    const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState<{ id: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const response = await api.get(`requests/${params.id}/`);
                setRequest(response.data);

                if (response.data.status === 'CREATED' || response.data.status === 'SEARCHING_FOR_DONORS') {
                    try {
                        let matchingDonors = [];
                        let fallbackBloodBanks = [];

                        // 1. Try fetching via PostGIS RPC first if location exists
                        const locMatch = response.data.location?.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
                        if (locMatch) {
                            const lng = parseFloat(locMatch[1]);
                            const lat = parseFloat(locMatch[2]);
                            
                            // 20km radius search
                            const nearbyDonors = await DonorService.getNearbyDonors(lat, lng, 20); 
                            
                            // Filter by exact blood group match
                            matchingDonors = nearbyDonors
                                .filter((d: any) => d.blood_group === response.data.blood_group)
                                .map((d: any) => ({
                                    id: d.id,
                                    name: d.full_name,
                                    blood_group: d.blood_group,
                                    city: 'Nearby', 
                                    phone_number: d.phone,
                                    distance_km: Math.round(d.distance_meters / 100) / 10 
                                }));
                        }

                        // Fallback to old API if RPC returned nothing (e.g. migration transition)
                        if (matchingDonors.length === 0) {
                            try {
                                const donorsResponse = await api.get(`requests/${params.id}/donors/`);
                                matchingDonors = donorsResponse.data.matching_donors || [];
                                fallbackBloodBanks = donorsResponse.data.fallback_blood_banks || [];
                            } catch (fallbackErr) {}
                        }

                        setDonors(matchingDonors);
                        setBloodBanks(fallbackBloodBanks);
                    } catch (e) {
                        console.error('Error fetching nearby donors:', e);
                    }
                }
            } catch (err: any) {
                console.error('Error fetching request:', err);
                setError(err.response?.status === 404 ? 'Request not found' : 'Failed to load request');
            } finally {
                setLoading(false);
            }
        };

        const fetchCurrentUser = async () => {
            try {
                const response = await api.get('users/profile/');
                setCurrentUserProfile(response.data);
            } catch (err) { }
        };

        if (params.id) {
            fetchRequest();
            if (user) fetchCurrentUser();
        }
    }, [params.id, api, user]);

    const handleAcceptRequest = async () => {
        setAccepting(true);
        try {
            await api.post(`requests/${params.id}/accept/`);
            // Optimistically update ui or reload
            const response = await api.get(`requests/${params.id}/`);
            setRequest(response.data);
            alert('Thank you! The requester has been notified.');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to accept request');
        } finally {
            setAccepting(false);
        }
    };

    const handleCompleteRequest = async () => {
        try {
            await api.post(`requests/${params.id}/complete/`);
            router.push('/dashboard');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to complete request');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-red"></div></div>;

    if (!request || error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <AlertCircle className="w-12 h-12 text-gray-400" />
                <h2 className="text-xl font-bold text-gray-700">{error || 'Request Not Found'}</h2>
                <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
            </div>
        );
    }

    const isRequester = currentUserProfile?.id === request?.requester?.id;

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400">Request #{request.id}</span>
                        <Badge variant={request.status === 'COMPLETED' ? 'default' : request.status === 'CANCELLED' ? 'danger' : 'info'}>
                            {request.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial="initial" animate="animate" variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Urgency Banner */}
                        {request.urgency_level === 'IMMEDIATE' && request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm animate-pulse-slow">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-red-600" />
                                    <div>
                                        <p className="font-bold text-red-900">Critical Requirement</p>
                                        <p className="text-xs text-red-700">Immediate donation required within 4 hours.</p>
                                    </div>
                                </div>
                                <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded">URGENT</span>
                            </div>
                        )}

                        {/* Primary Request Card */}
                        <Card className="border-gray-200 shadow-sm overflow-hidden">
                            <div className={`h-2 w-full ${request.urgency_level === 'IMMEDIATE' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                request.urgency_level === 'TODAY' ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-blue-500'
                                }`} />
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    {/* Blood Group Badge */}
                                    <div className={`flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg ${request.urgency_level === 'IMMEDIATE' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' :
                                        request.urgency_level === 'TODAY' ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                            'bg-white border-2 border-blue-500 text-blue-600'
                                        }`}>
                                        <div className="text-center">
                                            <span className="block text-3xl font-black">{request.blood_group}</span>
                                            <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Type</span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{request.patient_name}</h1>
                                            <p className="text-gray-500 text-lg">{request.hospital_name}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                                <MapPin className="w-4 h-4 text-gray-400" /> {request.city}
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                                <Droplet className="w-4 h-4 text-gray-400" /> {request.units} Units
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                                <Clock className="w-4 h-4 text-gray-400" /> {new Date(request.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="my-8 border-t border-gray-100"></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider">Contact Details</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">{request.contact_phone}</p>
                                                <p className="text-xs text-gray-500">Call for location details</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider">Requester</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{request.requester.first_name} {request.requester.last_name}</p>
                                                <p className="text-xs text-gray-500">Relation: {request.requester_relation}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {request.note && (
                                    <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-gray-600 italic">" {request.note} "</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isRequester ? (
                                <>
                                    {(request.status === 'CREATED' || request.status === 'SEARCHING_FOR_DONORS') && (
                                        <CancelRequestButton requestId={request.id} onCancel={() => router.push('/dashboard')} />
                                    )}
                                    {request.status === 'DONOR_ACCEPTED' && (
                                        <Button onClick={handleCompleteRequest} size="lg" className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200">
                                            <CheckCircle className="w-5 h-5 mr-2" /> Mark Completed
                                        </Button>
                                    )}
                                </>
                            ) : (
                                request.status === 'CREATED' && (
                                    <Button
                                        onClick={handleAcceptRequest}
                                        disabled={accepting}
                                        size="lg"
                                        className="w-full text-lg h-14 shadow-xl hover:shadow-2xl bg-gradient-to-r from-red-600 to-brand-red border-none"
                                    >
                                        <Heart className={`w-6 h-6 mr-2 ${accepting ? 'animate-pulse' : ''}`} /> {accepting ? 'Processing...' : 'I Can Donate'}
                                    </Button>
                                )
                            )}
                            <Button variant="outline" size="lg" className="w-full text-gray-600 border-gray-200" onClick={() => navigator.share?.({ title: 'Blood Request', url: window.location.href })}>
                                <Share2 className="w-5 h-5 mr-2" /> Share Request
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {request.assigned_donor ? (
                            <Card className="border-green-200 bg-green-50">
                                <CardContent className="p-6 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-green-900">Donor Assigned</h3>
                                    <p className="text-green-700 mb-4">{request.assigned_donor.first_name} is on their way!</p>

                                    {isRequester ? (
                                        request.assigned_donor.phone_number ? (
                                            <a href={`tel:${request.assigned_donor.phone_number}`} className="w-full">
                                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md">
                                                    <Phone className="w-4 h-4 mr-2" /> Call {request.assigned_donor.first_name}
                                                </Button>
                                            </a>
                                        ) : (
                                            <Button disabled variant="outline" className="w-full bg-white border-green-200 text-green-700">Contact Donor</Button>
                                        )
                                    ) : (
                                        currentUserProfile?.id === request.assigned_donor.id && (
                                            <div className="space-y-4">
                                                <div className="bg-white/50 p-3 rounded-lg border border-green-100">
                                                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Requester Contact</p>
                                                    <p className="font-bold text-gray-900">{request.contact_phone}</p>
                                                </div>
                                                <a href={`tel:${request.contact_phone}`} className="w-full block">
                                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md">
                                                        <Phone className="w-4 h-4 mr-2" /> Call Requester
                                                    </Button>
                                                </a>
                                            </div>
                                        )
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            isRequester && (
                                <Card className="border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-brand-red" /> Nearby Match
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {donors.length > 0 ? (
                                            <div className="divide-y divide-gray-100">
                                                {donors.map(donor => (
                                                    <div key={donor.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="font-bold text-gray-900">{donor.name}</p>
                                                            <Badge variant="outline" className="text-[10px]">{donor.blood_group}</Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2">{donor.distance_km} km away • {donor.city}</p>
                                                        <Button size="sm" variant="ghost" className="w-full h-8 text-xs text-gray-600 bg-gray-100 border-none">View Profile</Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">
                                                <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-brand-red rounded-full mx-auto mb-2"></div>
                                                <p className="text-xs">Searching for donors...</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        )}

                        {/* Blood Bank Fallback */}
                        {isRequester && bloodBanks.length > 0 && donors.length === 0 && (
                            <Card className="border-orange-200 bg-orange-50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2 text-orange-900">
                                        <AlertCircle className="w-5 h-5" /> Blood Bank Contacts
                                    </CardTitle>
                                    <CardDescription className="text-orange-700">
                                        No individual donors found. Contact these blood banks immediately.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-orange-100">
                                        {bloodBanks.map(bank => (
                                            <div key={bank.id} className="p-4 hover:bg-orange-100/50 transition-colors">
                                                <p className="font-bold text-gray-900 mb-1">{bank.name}</p>
                                                <p className="text-xs text-gray-600 mb-2">{bank.address}</p>
                                                <a
                                                    href={`tel:${bank.phone_number}`}
                                                    className="flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-900"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                    {bank.phone_number}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                            <h4 className="font-bold flex items-center gap-2 mb-2"><Shield className="w-4 h-4" /> Safety Tip</h4>
                            <p className="opacity-90 text-xs leading-relaxed">
                                Always verify the donor's identity and medical history before proceeding with donation at the hospital.
                            </p>
                        </div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
}
