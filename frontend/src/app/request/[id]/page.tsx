"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { DonorService } from '@/services/donor.service';
import { RequestService } from '@/services/request.service';
import { AlertCircle, Droplet, MapPin, Phone, User, Clock, CheckCircle, ArrowLeft, Heart, Share2, Shield, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { AlertService } from '@/services/alert.service';
import Map from '@/components/Map';

const parseLocation = (locStr: string | null) => {
    if (!locStr) return null;
    const match = locStr.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
        return {
            lng: parseFloat(match[1]),
            lat: parseFloat(match[2])
        };
    }
    return null;
};

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
    requester_name?: string;
    metadata?: {
        relation?: string;
        is_anonymous?: boolean;
    };
    requester: {
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

const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

const URGENCY_COLOR: Record<string, string> = {
    IMMEDIATE: "bg-rose-500 text-white border-rose-500",
    TODAY: "bg-amber-500 text-zinc-900 border-amber-500",
    SCHEDULED: "bg-blue-500 text-white border-blue-500",
};

export default function RequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const [request, setRequest] = useState<BloodRequest | null>(null);
    const [donors, setDonors] = useState<MatchingDonor[]>([]);
    const [acceptedDonors, setAcceptedDonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                // We use RequestService now instead of old API client
                const requestData = await RequestService.getRequestById(params.id as string);
                setRequest(requestData as any);

                if (requestData.status === 'CREATED' || requestData.status === 'SEARCHING_FOR_DONORS' || requestData.status === 'open') {
                    try {
                        let matchingDonors = [];

                        const locMatch = requestData.location?.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
                        if (locMatch) {
                            const lng = parseFloat(locMatch[1]);
                            const lat = parseFloat(locMatch[2]);
                            
                            const nearbyDonors = await DonorService.getNearbyDonors(lat, lng, 20, requestData.blood_group); 
                            
                            matchingDonors = nearbyDonors
                                .map((d: any) => ({
                                    id: d.id,
                                    name: d.full_name,
                                    blood_group: d.blood_group,
                                    city: 'Nearby', 
                                    phone_number: d.phone,
                                    distance_km: Math.round(d.distance_meters / 100) / 10 
                                }));
                        }
                        setDonors(matchingDonors);
                    } catch (e) {
                        console.error('Error fetching nearby donors:', e);
                    }
                }
                
                try {
                    const responses = await DonorService.getResponsesForRequest(params.id as string);
                    setAcceptedDonors(responses);
                } catch (e) {
                    console.error('Error fetching donor responses:', e);
                }
            } catch (err: any) {
                console.error('Error fetching request:', err);
                setError('Request not found or no longer available.');
            } finally {
                setLoading(false);
            }
        };

        const fetchCurrentUser = async () => {
            if (!user?.id) return;
            try {
                const profileData = await DonorService.getProfile(user.id);
                setCurrentUserProfile(profileData);
            } catch (err) { }
        };

        if (params.id) {
            fetchRequest();
        }
        if (isLoaded && user) {
            fetchCurrentUser();
        }
        
        let channel: any;
        const setupRealtime = async () => {
            const { supabaseClient } = await import('@/lib/supabase/client');
            channel = supabaseClient
                .channel(`request_${params.id}_responses`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'donor_responses',
                        filter: `request_id=eq.${params.id}`
                    },
                    async (payload) => {
                        try {
                            const responses = await DonorService.getResponsesForRequest(params.id as string);
                            setAcceptedDonors(responses);
                        } catch (e) {}
                    }
                )
                .subscribe();
        };
        
        if (params.id) {
            setupRealtime();
        }

        return () => {
            if (channel) channel.unsubscribe();
        };
    }, [params.id, user, isLoaded]);

    const handleAcceptRequest = async () => {
        if (!currentUserProfile?.id) {
            alert('Please complete your profile to donate.');
            router.push('/onboarding');
            return;
        }
        
        setAccepting(true);
        try {
            await DonorService.submitDonorResponse(params.id as string, currentUserProfile.id.toString());
            
            if (request?.contact_phone) {
                await AlertService.sendSMS(
                    request.contact_phone, 
                    `PULSE-AID ALERT: Good news! ${currentUserProfile.full_name || 'A donor'} has offered to donate blood for ${request.patient_name}. They may contact you shortly.`
                );
            }
            
            const responses = await DonorService.getResponsesForRequest(params.id as string);
            setAcceptedDonors(responses);
            
        } catch (error: any) {
            alert(error.message || 'We could not process this right now. Please try again.');
        } finally {
            setAccepting(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!confirm("Are you sure you want to cancel this request? This cannot be undone.")) return;
        try {
            await RequestService.updateRequest(params.id as string, { status: 'cancelled' });
            router.push('/dashboard');
        } catch (error: any) {
            alert('Could not cancel request. Please try again.');
        }
    };

    const handleCompleteRequest = async () => {
        try {
            await RequestService.updateRequest(params.id as string, { status: 'fulfilled' });
            router.push('/dashboard');
        } catch (error: any) {
            alert('Could not mark as completed. Please try again.');
        }
    };

    if (loading || !isLoaded) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="w-12 h-12 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
                    <div className="absolute inset-0 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    if (!request || error) {
        return (
            <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{error || 'Case Closed or Unavailable'}</h2>
                <p className="text-zinc-500 mb-8 max-w-sm">This request may have been completed, cancelled, or the link is incorrect.</p>
                <Link href="/dashboard">
                    <button className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95">
                        Return to Dashboard
                    </button>
                </Link>
            </div>
        );
    }

    const isRequester = currentUserProfile?.id === request?.requester?.id;
    const isResponding = acceptedDonors.some(d => d.donor_id === currentUserProfile?.id);
    const isClosed = request.status === 'COMPLETED' || request.status === 'CANCELLED' || request.status === 'cancelled' || request.status === 'fulfilled';

    return (
        <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 selection:bg-crimson/30 pb-safe">
            
            {/* Nav Header */}
            <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-white/10">
                <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Case {request.id.toString().padStart(4, '0')}</span>
                    </div>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <motion.div initial="initial" animate="animate" variants={fadeInUp} className="space-y-8">
                    
                    {/* Urgency Banner - V2 Minimalist Style */}
                    {request.urgency_level === 'IMMEDIATE' && !isClosed && (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                                <div>
                                    <p className="font-bold text-rose-800 dark:text-rose-400 text-sm">Critical Case</p>
                                    <p className="text-xs font-medium text-rose-700/70 dark:text-rose-500/70">Blood needed in the next few hours.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Case File */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                        {isClosed && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                                    {request.status.toLowerCase() === 'cancelled' ? (
                                        <><AlertCircle className="w-5 h-5 text-zinc-400" /><span className="font-bold text-zinc-900 dark:text-white">This request was cancelled.</span></>
                                    ) : (
                                        <><CheckCircle className="w-5 h-5 text-emerald-500" /><span className="font-bold text-zinc-900 dark:text-white">This request has been fulfilled.</span></>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="p-6 sm:p-10">
                            <div className="flex flex-col sm:flex-row gap-8 sm:items-start">
                                
                                {/* Blood Group Marker */}
                                <div className={`shrink-0 w-28 h-28 rounded-[1.5rem] flex flex-col items-center justify-center border-2 ${URGENCY_COLOR[request.urgency_level ?? ""] ?? "bg-zinc-100 text-zinc-900 border-zinc-200"}`}>
                                    <span className="text-4xl font-black tracking-tighter mb-1">{request.blood_group}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Needed</span>
                                </div>

                                {/* Patient Details */}
                                <div className="flex-1 space-y-5">
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-1">{request.patient_name}</h1>
                                        <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">{request.hospital_name}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                            <MapPin className="w-3.5 h-3.5" /> {request.city}
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                            <Droplet className="w-3.5 h-3.5" /> {request.units} Unit{request.units > 1 ? 's' : ''}
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                            <Clock className="w-3.5 h-3.5" /> Posted {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {(request as any).location && (request as any).location !== 'POINT(0 0)' && (
                                            <a 
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${parseLocation((request as any).location)!.lat},${parseLocation((request as any).location)!.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 bg-zinc-900 dark:bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-white dark:text-zinc-900 hover:scale-105 transition-transform shadow-sm"
                                            >
                                                <Share2 className="w-3.5 h-3.5 rotate-90" /> Get Directions
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="my-8 border-t border-zinc-200/50 dark:border-white/10" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Point of Contact</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-900 dark:text-white">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-zinc-900 dark:text-white text-lg font-mono tracking-tight">{request.contact_phone}</p>
                                            <p className="text-xs font-medium text-zinc-500">Call to coordinate location</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Requester</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-900 dark:text-white">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900 dark:text-white">
                                                {request.requester_name || request.requester?.first_name || 'Anonymous'}
                                            </p>
                                            <p className="text-xs font-medium text-zinc-500">
                                                Relation: {request.metadata?.relation || 'Unspecified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Preview */}
                    {(request as any).location && (request as any).location !== 'POINT(0 0)' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-2">Hospital Location</h3>
                            <div className="h-64 sm:h-80 w-full rounded-[2rem] overflow-hidden border border-zinc-200/50 dark:border-white/10 shadow-sm">
                            <Map 
                                center={[parseLocation((request as any).location)!.lng, parseLocation((request as any).location)!.lat]}
                                zoom={14}
                                markers={[{
                                    id: 'hospital',
                                    lat: parseLocation((request as any).location)!.lat,
                                    lng: parseLocation((request as any).location)!.lng,
                                    label: request.hospital_name,
                                    type: 'hospital'
                                }]}
                                className="h-full w-full"
                            />
                        </div>
                    </div>
                    )}

                    {/* Real-time Responses Block */}
                    {acceptedDonors.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-400 tracking-tight">Help is on the way</h2>
                                    <p className="text-sm font-medium text-emerald-700/70 dark:text-emerald-500/70">{acceptedDonors.length} donor{acceptedDonors.length > 1 ? 's are' : ' is'} responding.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {acceptedDonors.map((resp) => (
                                    <div key={resp.id} className="bg-white dark:bg-zinc-900 border border-emerald-500/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                                        <div>
                                            <p className="font-bold text-zinc-900 dark:text-white">{resp.profiles?.full_name || 'A Donor'}</p>
                                            <p className="text-xs font-medium text-zinc-500">Offered to help</p>
                                        </div>
                                        
                                        {isRequester ? (
                                            <a href={`tel:${resp.profiles?.phone}`} className="flex-shrink-0">
                                                <button className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl text-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Call Donor
                                                </button>
                                            </a>
                                        ) : currentUserProfile?.id === resp.donor_id ? (
                                            <div className="flex-shrink-0 text-right">
                                                <span className="inline-flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg mb-2">
                                                    This is you
                                                </span>
                                                <a href={`tel:${request.contact_phone}`} className="block">
                                                    <button className="w-full sm:w-auto px-4 py-2 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white font-bold rounded-xl text-sm flex items-center justify-center transition-colors hover:bg-zinc-200 dark:hover:bg-white/10">
                                                        <Phone className="w-4 h-4 mr-2" />
                                                        Call Requester
                                                    </button>
                                                </a>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Action Engine */}
                    {!isClosed && (
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            {!isRequester ? (
                                !isResponding ? (
                                    <button
                                        onClick={handleAcceptRequest}
                                        disabled={accepting}
                                        className="flex-1 py-4 bg-crimson text-white text-lg font-bold rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(192,57,43,0.3)] transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                                    >
                                        {accepting ? (
                                            <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin mr-3" /> Processing...</>
                                        ) : (
                                            <><Heart className="w-5 h-5 mr-2" /> I can help them</>
                                        )}
                                    </button>
                                ) : (
                                    <button disabled className="flex-1 py-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-lg font-bold rounded-2xl flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 mr-2" /> You are responding
                                    </button>
                                )
                            ) : (
                                <>
                                    <button
                                        onClick={handleCompleteRequest}
                                        className="flex-1 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-base font-bold rounded-2xl flex items-center justify-center shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" /> Mark as Fulfilled
                                    </button>
                                    <button
                                        onClick={handleCancelRequest}
                                        className="flex-1 py-4 bg-transparent border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-base font-bold rounded-2xl flex items-center justify-center transition-all hover:bg-zinc-100 dark:hover:bg-white/5 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    >
                                        Cancel Request
                                    </button>
                                </>
                            )}
                            
                            <button 
                                onClick={() => navigator.share?.({ title: 'Blood Request', url: window.location.href })}
                                className="px-6 py-4 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white font-bold rounded-2xl flex items-center justify-center transition-colors hover:bg-zinc-200 dark:hover:bg-white/10"
                            >
                                <Share2 className="w-5 h-5 sm:mr-2" />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                        </div>
                    )}
                    
                    {/* Safety Notice */}
                    <div className="flex items-start gap-3 mt-8 p-4 rounded-xl text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-white/5">
                        <Shield className="w-4 h-4 shrink-0 text-zinc-400" />
                        <p>BloodReach does not screen donors or verify medical history. Please coordinate with your medical professional before proceeding with any donations.</p>
                    </div>

                </motion.div>
            </main>
        </div>
    );
}
