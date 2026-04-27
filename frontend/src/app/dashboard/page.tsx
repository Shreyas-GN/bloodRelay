"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RequestService } from "@/services/request.service";
import { DonorService } from "@/services/donor.service";
import {
    AlertCircle, Droplet, MapPin, Clock, Heart, Activity,
    TrendingUp, Plus, Settings, CheckCircle2, Zap, ShieldCheck,
    LayoutGrid, List, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from '@/components/ui/Badge';
import { AlertService } from '@/services/alert.service';
import { DonorAvailabilityToggle } from "@/components/DonorAvailabilityToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { RequestDetailDrawer } from "@/components/RequestDetailDrawer";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { BentoRequestCard } from "@/components/dashboard/BentoRequestCard";
import type { BloodRequest, User } from "@/types";

type Tab = "donate" | "mine";

const STATUS_BADGE: Record<string, { bg: string, text: string }> = {
    CREATED: { bg: "bg-zinc-100", text: "text-zinc-600" },
    open: { bg: "bg-amber-500/10", text: "text-amber-700" },
    SEARCHING_FOR_DONORS: { bg: "bg-[var(--color-warn-light)]", text: "text-[var(--color-warn)]" },
    DONOR_ACCEPTED: { bg: "bg-[var(--color-safe-light)]", text: "text-[var(--color-safe)]" },
    fulfilled: { bg: "bg-[var(--color-safe-light)]", text: "text-[var(--color-safe)]" },
    COMPLETED: { bg: "bg-zinc-100", text: "text-zinc-600" },
    cancelled: { bg: "bg-rose-500/10", text: "text-rose-700" },
    CANCELLED: { bg: "bg-rose-500/10", text: "text-rose-700" },
};

const STATUS_LABEL: Record<string, string> = {
    CREATED: "Created",
    open: "Looking for donors",
    SEARCHING_FOR_DONORS: "Looking for donors",
    DONOR_ACCEPTED: "Donor found",
    fulfilled: "Donor found",
    COMPLETED: "Completed",
    cancelled: "Cancelled",
    CANCELLED: "Cancelled",
};

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [profile, setProfile] = useState<User | null>(null);
    const [allRequests, setAllRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>("donate");
    const [acceptingId, setAcceptingId] = useState<number | string | null>(null);
    const [acceptedIds, setAcceptedIds] = useState<Set<number | string>>(new Set());
    const [selectedRequestId, setSelectedRequestId] = useState<string | number | null>(null);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [profileData, requestsData] = await Promise.all([
                DonorService.getProfile(user.id).catch(() => null),
                RequestService.getActiveRequests().catch(() => []), 
            ]);
            setProfile(profileData as any);
            setAllRequests(requestsData as any);
            
            if (profileData) {
                try {
                    const data = await DonorService.getResponsesForDonor(profileData.id);
                    setAcceptedIds(new Set(data.map((r: any) => r.request_id)));
                } catch {
                    // Ignore
                }
            }
        } catch {
            // Logged silently
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) { router.push("/"); return; }
        fetchData();
    }, [isLoaded, user, fetchData, router]);

    const handleAccept = async (requestId: any) => {
        setAcceptingId(requestId);
        try {
            await DonorService.submitDonorResponse(requestId.toString(), profile!.id.toString());
            
            const req = allRequests.find((r: any) => r.id === requestId);
            if (req?.contact_phone) {
                await AlertService.sendSMS(
                    req.contact_phone,
                    `PULSE-AID ALERT: Good news! ${profile?.full_name || 'A donor'} has offered to donate blood for ${req.patient_name || 'your request'}. They may contact you shortly. Please check your dashboard for details.`
                );
            }

            setAcceptedIds((prev) => new Set(prev).add(requestId));
            await fetchData();
        } catch (err: any) {
            alert(err.message || "We encountered an issue updating this. Please try again.");
        } finally {
            setAcceptingId(null);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--color-base-50)]">
                <div className="w-12 h-12 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--color-base-200)]" />
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--color-blood)] border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    const myRequests = allRequests.filter((r) => r.requester_id === (profile?.id ?? -1));
    const donateRequests = allRequests.filter(
        (r) =>
            r.requester_id !== (profile?.id ?? -1) &&
            r.blood_group === profile?.blood_group &&
            (r.status === "SEARCHING_FOR_DONORS" || r.status === "CREATED" || r.status === "open" || acceptedIds.has(r.id))
    );

    const displayName = user?.firstName ?? user?.username ?? "There";

    const hasEmergency = donateRequests.length > 0;

    return (
        <div className="min-h-[100dvh] bg-[var(--color-base-50)] font-sans text-[var(--color-base-900)] pb-safe relative">
            {/* Global Noise is applied via globals.css body::before */}

            {/* Nav Header */}
            <header className="sticky top-0 z-50 bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] border-b border-[var(--color-base-200)] h-[56px] flex justify-center">
                <nav className="w-full max-w-[1280px] px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 outline-none">
                            <Droplet className="w-5 h-5 fill-[var(--color-blood)] stroke-[var(--color-blood)]" />
                            <span className="text-[1.125rem] font-bold tracking-[-0.05em] font-display text-[var(--color-base-900)]">PulseAid</span>
                        </Link>
                        
                        <div className="hidden md:flex items-center gap-2 bg-[var(--color-base-50)] border border-[var(--color-base-200)] px-3 py-1 rounded-[var(--radius-pill)]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[0.75rem] font-mono font-bold text-[var(--color-base-500)] tracking-widest uppercase">1,248 Active Donors</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/dashboard" className="text-[var(--color-base-900)] font-bold transition-colors hover:underline">
                            Dashboard
                        </Link>
                        <Link
                            href="/request/wizard"
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-blood)] text-white rounded-[var(--radius-pill)] text-sm font-bold shadow-[var(--shadow-clay-hard)] hover:-translate-y-px transition-transform"
                        >
                            <AlertTriangle className={`w-4 h-4 ${hasEmergency ? 'animate-pulse' : ''}`} />
                            Emergency
                        </Link>
                        <div className="relative group flex items-center justify-center">
                            <div className="w-[32px] h-[32px] rounded-full overflow-hidden border-[2px] border-[var(--color-blood)] cursor-pointer">
                                {/* The Clerk UserButton will be inside here */}
                                <Settings className="w-4 h-4 m-auto mt-1" />
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <main className="max-w-[1280px] mx-auto px-6 py-8">
                {/* STRICT 12-COLUMN BENTO GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:grid-rows-[auto_auto_auto]">
                    
                    {/* Emergency Banner (Conditional) */}
                    {hasEmergency && (
                        <div className="lg:col-[1/-1] h-[56px] bg-[var(--color-blood)] text-white sticky top-[56px] z-40 flex items-center gap-3 px-6 rounded-[var(--radius-card)] shadow-[var(--shadow-clay-hard)] mb-4">
                            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                            <span className="font-mono text-sm uppercase tracking-wider font-bold">
                                NEW EMERGENCY REQUEST — {donateRequests[0]?.blood_group} needed at {donateRequests[0]?.hospital_name}
                            </span>
                        </div>
                    )}

                    {/* ROW 1: Identity Panel (4 cols) + Live Pulse Feed (8 cols) */}
                    
                    {/* User Profile Card */}
                    <div className="lg:col-[1/5] lg:row-start-1 bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-clay)] p-6 min-h-[200px] flex flex-col justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-[64px] h-[64px] rounded-full border-[3px] border-[var(--color-blood)] shadow-[0_2px_0_var(--color-blood)] flex items-center justify-center text-white font-display font-bold text-[28px]" style={{ background: 'linear-gradient(135deg, var(--color-blood-light), var(--color-blood))' }}>
                                {displayName[0]}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-display font-bold text-[1.25rem] text-[var(--color-base-900)]">
                                        {displayName}
                                    </h2>
                                    <span className="bg-[var(--color-warn-light)] text-[var(--color-warn)] font-mono text-[0.875rem] rounded-[8px] px-[10px] py-[2px] font-bold">
                                        {profile?.blood_group ?? "N/A"}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 bg-[var(--color-safe-light)] text-[var(--color-safe)] rounded-[var(--radius-pill)] px-[10px] py-[2px] w-fit">
                                    <span className="w-2 h-2 rounded-full bg-[var(--color-safe)] animate-pulse" />
                                    <span className="text-[0.75rem] font-bold uppercase tracking-widest">{profile?.is_available_donor ? 'Active' : 'Unavailable'}</span>
                                </div>
                            </div>
                        </div>
                        <Link href="/settings" className="mt-6 block text-center bg-transparent border-[1.5px] border-[var(--color-base-200)] text-[var(--color-base-700)] rounded-[var(--radius-pill)] py-2 text-[0.875rem] font-medium hover:border-[var(--color-blood)] hover:text-[var(--color-blood)] transition-colors">
                            View Profile
                        </Link>
                    </div>

                    {/* Live Pulse Card */}
                    <div className="lg:col-[5/13] lg:row-start-1">
                        <ActivityTimeline />
                    </div>

                    {/* ROW 2: Availability (4 cols) + Impact (4 cols) + Community (4 cols) */}

                    {/* Availability Card */}
                    <div className="lg:col-[1/5] lg:row-start-2 bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-clay)] p-6 min-h-[200px] flex flex-col justify-center border-t-[8px] border-[var(--color-safe)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <div className="flex flex-col relative z-10 h-full justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-display font-bold text-[1.125rem] text-[var(--color-base-900)]">Donor Status</h3>
                                {profile && (
                                    <div className="scale-90 origin-right">
                                        <DonorAvailabilityToggle
                                            initialAvailable={profile.is_available_donor ?? false}
                                            onToggle={() => fetchData()}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                {profile?.is_available_donor ? (
                                    <p className="font-sans text-[0.875rem] text-[var(--color-base-500)]">Active: You'll be notified of urgent {profile?.blood_group || 'blood'} requests within 20km.</p>
                                ) : (
                                    <p className="font-sans text-[0.875rem] text-[var(--color-warn)] font-medium">Invisible Mode: You won't receive new requests until you re-activate.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* ROW 3: Active Requests Feed (12 cols) */}
                    <div className="lg:col-[5/13] lg:row-start-2 lg:row-span-2 bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-clay)] p-6">
                        {/* Feed Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 border-b border-[var(--color-base-200)] pb-4">
                            <div className="space-y-1">
                                <h2 className="font-display font-bold text-[1.5rem] tracking-tight text-[var(--color-base-900)]">
                                    Emergency Board
                                </h2>
                            </div>

                            <div className="flex gap-4 border-b border-[var(--color-base-200)] w-full sm:w-auto">
                                <button
                                    onClick={() => setTab("donate")}
                                    className={`relative pb-2 text-sm font-bold transition-all ${tab === "donate" ? "text-[var(--color-base-900)] border-b-2 border-[var(--color-blood)]" : "text-[var(--color-base-500)] hover:text-[var(--color-base-900)] border-b-2 border-transparent"}`}
                                >
                                    Live Feed
                                    {donateRequests.length > 0 && (
                                        <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-[4px] bg-[var(--color-blood-light)] text-[10px] text-[var(--color-blood)] font-mono">
                                            {donateRequests.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setTab("mine")}
                                    className={`relative pb-2 text-sm font-bold transition-all ${tab === "mine" ? "text-[var(--color-base-900)] border-b-2 border-[var(--color-blood)]" : "text-[var(--color-base-500)] hover:text-[var(--color-base-900)] border-b-2 border-transparent"}`}
                                >
                                    My Posts
                                </button>
                            </div>
                        </div>

                        {/* Request Grid */}
                        <AnimatePresence mode="wait">
                            {tab === "donate" ? (
                                <motion.div key="donate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    {/* FILTER BAR */}
                                    {profile?.is_available_donor && donateRequests.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2 mb-6">
                                            {['Critical', 'Nearby', 'Compatible', 'Recent'].map((filter, idx) => (
                                                <button key={filter} className={`px-4 py-1.5 rounded-[var(--radius-pill)] text-[0.75rem] font-bold font-mono tracking-widest uppercase transition-colors ${idx === 0 ? 'bg-[var(--color-blood-light)] text-[var(--color-blood)] border border-[var(--color-blood)]' : 'bg-[var(--color-base-50)] text-[var(--color-base-500)] border border-[var(--color-base-200)] hover:border-[var(--color-base-500)]'}`}>
                                                    {filter}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {!profile?.blood_group ? (
                                        <div className="p-12 text-center border border-dashed border-[var(--color-base-200)] rounded-[var(--radius-card)] bg-[var(--color-base-50)]">
                                            <div className="w-[64px] h-[64px] rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--color-base-200)]">
                                                <Settings className="w-8 h-8 text-[var(--color-base-500)]" />
                                            </div>
                                            <h3 className="font-display font-bold text-[1.25rem] text-[var(--color-base-900)] mb-2">Blood Group Not Set</h3>
                                            <p className="text-[var(--color-base-500)] text-[0.9375rem] max-w-xs mx-auto mb-8">We need your blood group to show you relevant requests near you.</p>
                                            <Link href="/onboarding" className="inline-block bg-[var(--color-blood)] text-white px-8 py-3 rounded-[var(--radius-pill)] font-bold shadow-[var(--shadow-clay-hard)] hover:-translate-y-px transition-transform">
                                                Set Up Profile
                                            </Link>
                                        </div>
                                    ) : !profile.is_available_donor ? (
                                        <div className="p-12 text-center border border-dashed border-[var(--color-base-200)] rounded-[var(--radius-card)] bg-[var(--color-base-50)]">
                                            <div className="w-[64px] h-[64px] rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--color-base-200)]">
                                                <ShieldCheck className="w-8 h-8 text-[var(--color-base-500)]" />
                                            </div>
                                            <h3 className="font-display font-bold text-[1.25rem] text-[var(--color-base-900)] mb-2">Availability Paused</h3>
                                            <p className="text-[var(--color-base-500)] text-[0.9375rem] max-w-xs mx-auto">Toggle availability above to start receiving matching requests.</p>
                                        </div>
                                    ) : donateRequests.length === 0 ? (
                                        <div className="p-12 text-center border-[1.5px] border-[var(--color-safe-light)] rounded-[var(--radius-card)] bg-[var(--color-safe-light)]">
                                            <div className="w-[64px] h-[64px] rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                <CheckCircle2 className="w-8 h-8 text-[var(--color-safe)]" />
                                            </div>
                                            <h3 className="font-display font-bold text-[1.25rem] text-[var(--color-base-900)] mb-2">You're all caught up!</h3>
                                            <p className="text-[var(--color-base-500)] text-[0.9375rem] max-w-xs mx-auto">No urgent {profile.blood_group} requests right now. We'll alert you if something changes.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {donateRequests.map((req) => (
                                                <BentoRequestCard
                                                    key={req.id}
                                                    request={req}
                                                    onClick={() => setSelectedRequestId(req.id)}
                                                    onAccept={() => handleAccept(req.id)}
                                                    isAccepting={acceptingId === req.id}
                                                    isAccepted={acceptedIds.has(req.id)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div key="mine" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    {myRequests.length === 0 ? (
                                        <div className="p-12 text-center border border-dashed border-[var(--color-base-200)] rounded-[var(--radius-card)] bg-[var(--color-base-50)]">
                                            <div className="w-[64px] h-[64px] rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--color-base-200)]">
                                                <Plus className="w-8 h-8 text-[var(--color-base-500)]" />
                                            </div>
                                            <h3 className="font-display font-bold text-[1.25rem] text-[var(--color-base-900)] mb-2">No Posts Yet</h3>
                                            <p className="text-[var(--color-base-500)] text-[0.9375rem] max-w-xs mx-auto mb-8">Need blood for someone? Create a request to reach donors instantly.</p>
                                            <Link href="/request/wizard" className="inline-block bg-[var(--color-blood)] text-white px-8 py-3 rounded-[var(--radius-pill)] font-bold shadow-[var(--shadow-clay-hard)] hover:-translate-y-px transition-transform">
                                                Create Request
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {myRequests.map((req) => {
                                                const statusStyle = STATUS_BADGE[req.status] ?? STATUS_BADGE["CREATED"];
                                                const statusLabel = STATUS_LABEL[req.status] ?? "Unknown";
                                                
                                                return (
                                                    <motion.div
                                                        key={req.id}
                                                        layout
                                                        onClick={() => setSelectedRequestId(req.id)}
                                                        className="bg-white border-[1.5px] border-[var(--color-base-200)] rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-clay)] cursor-pointer hover:border-[var(--color-blood)] transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between mb-6">
                                                            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text}`}>
                                                                {statusLabel}
                                                            </div>
                                                            <div className="w-[40px] h-[40px] rounded-[12px] bg-[var(--color-base-50)] flex items-center justify-center font-bold font-mono text-[var(--color-blood)] border border-[var(--color-base-200)]">
                                                                {req.blood_group}
                                                            </div>
                                                        </div>
                                                        <h3 className="font-display font-bold text-[1.125rem] text-[var(--color-base-900)] tracking-tight mb-2 truncate">
                                                            {req.patient_name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-[var(--color-base-500)] text-[0.875rem] font-medium font-sans">
                                                            <MapPin className="w-3 h-3" />
                                                            {req.hospital_name}
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </main>

            {/* Request Detail Drawer */}
            <RequestDetailDrawer
                requestId={selectedRequestId}
                onClose={() => setSelectedRequestId(null)}
                onActionComplete={() => { fetchData(); setSelectedRequestId(null); }}
            />
        </div>
    );
}
