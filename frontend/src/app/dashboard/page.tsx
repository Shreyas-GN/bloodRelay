"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RequestService } from "@/services/request.service";
import { DonorService } from "@/services/donor.service";
import {
    AlertCircle, Droplet, MapPin, Clock, Heart, Activity,
    TrendingUp, Plus, Settings, CheckCircle2, Zap, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DonorAvailabilityToggle } from "@/components/DonorAvailabilityToggle";
import { NotificationBell } from "@/components/NotificationBell";
import type { BloodRequest, User } from "@/types";

type Tab = "donate" | "mine";

const URGENCY_COLOR: Record<string, string> = {
    IMMEDIATE: "bg-rose-500 text-white border-rose-500",
    TODAY: "bg-amber-500 text-zinc-900 border-amber-500",
    SCHEDULED: "bg-blue-500 text-white border-blue-500",
};

const STATUS_BADGE: Record<string, { bg: string, text: string }> = {
    CREATED: { bg: "bg-zinc-100 dark:bg-white/10", text: "text-zinc-600 dark:text-zinc-300" },
    open: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400" },
    SEARCHING_FOR_DONORS: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400" },
    DONOR_ACCEPTED: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
    fulfilled: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
    COMPLETED: { bg: "bg-zinc-100 dark:bg-white/10", text: "text-zinc-600 dark:text-zinc-400" },
    cancelled: { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-400" },
    CANCELLED: { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-400" },
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

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [profileData, requestsData] = await Promise.all([
                DonorService.getProfile(user.id).catch(() => null),
                RequestService.getActiveRequests().catch(() => []), 
            ]);
            setProfile(profileData as any);
            setAllRequests(requestsData as any);
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
            await RequestService.updateRequest(requestId, { 
                status: 'DONOR_ACCEPTED',
                donor_name: profile?.full_name || user?.firstName || 'A generous donor',
                donor_phone: profile?.phone || ''
            });
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
            <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 relative flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
                        <div className="absolute inset-0 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    const myRequests = allRequests.filter((r) => r.requester_id === (profile?.id ?? -1));
    const donateRequests = allRequests.filter(
        (r) =>
            r.requester_id !== (profile?.id ?? -1) &&
            r.blood_group === profile?.blood_group &&
            ((r.status === "SEARCHING_FOR_DONORS" || r.status === "CREATED" || r.status === "open") || (r.status === "DONOR_ACCEPTED" && r.donor_phone === profile?.phone))
    );

    const displayName = user?.firstName ?? user?.username ?? "There";

    return (
        <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 selection:bg-crimson/30 pb-safe">
            {/* Nav Header */}
            <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-white/10">
                <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 outline-none group">
                        <motion.div
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="bg-rose-600/10 p-1.5 rounded-xl"
                        >
                            <Droplet className="w-5 h-5 fill-crimson stroke-crimson" />
                        </motion.div>
                        <span className="text-[17px] font-bold tracking-tight">PulseAid</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Link href="/settings">
                            <motion.button 
                                whileHover={{ scale: 0.95 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                            </motion.button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                
                {/* Hero / Pulse Identity */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200/50 dark:border-white/10 pb-8"
                >
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-900 dark:text-white">
                            Good morning, {displayName}.
                        </h1>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Here's what's happening near you.
                        </p>
                    </div>
                    <Link href="/request/wizard">
                        <motion.button 
                            whileHover={{ scale: 0.98 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-crimson hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(192,57,43,0.3)] transition-all"
                        >
                            <AlertCircle className="w-4 h-4" />
                            Request blood for someone
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Data Telemetry Grid (Bento) -> Situational Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                            <Droplet className="w-5 h-5 text-crimson" />
                        </div>
                        <p className="text-3xl font-extrabold tracking-tight font-mono text-zinc-900 dark:text-white mb-1">
                            {profile?.blood_group ?? "Not set"}
                        </p>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Your blood group</p>
                    </div>

                    <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${profile?.is_available_donor ? 'bg-emerald-500/10' : 'bg-zinc-500/10'}`}>
                            <Heart className={`w-5 h-5 ${profile?.is_available_donor ? 'text-emerald-600' : 'text-zinc-500'}`} />
                        </div>
                        <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">
                            {profile?.is_available_donor ? "Available to help" : "Not available right now"}
                        </p>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</p>
                    </div>

                    <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                        {donateRequests.length > 0 && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
                        )}
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                            <Zap className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-3xl font-extrabold tracking-tight font-mono text-zinc-900 dark:text-white mb-1">
                            {donateRequests.length}
                        </p>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Requests near you</p>
                    </div>

                    <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-extrabold tracking-tight font-mono text-zinc-900 dark:text-white mb-1">
                            {myRequests.length}
                        </p>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Requests you made</p>
                    </div>
                </motion.div>

                {/* Router Toggle */}
                {profile && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <DonorAvailabilityToggle
                            initialAvailable={profile.is_available_donor ?? false}
                            onToggle={() => fetchData()}
                        />
                    </motion.div>
                )}

                {/* Data Views */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-6">
                    
                    {/* View Switcher Engine */}
                    <div className="flex gap-2 p-1.5 bg-zinc-200/50 dark:bg-white/5 rounded-2xl w-fit">
                        <button
                            onClick={() => setTab("donate")}
                            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "donate" ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                        >
                            {tab === "donate" && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-white dark:bg-zinc-800 shadow-sm rounded-xl -z-10" />
                            )}
                            Who needs help
                            {donateRequests.length > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-crimson text-[10px] text-white">
                                    {donateRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setTab("mine")}
                            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "mine" ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                        >
                            {tab === "mine" && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-white dark:bg-zinc-800 shadow-sm rounded-xl -z-10" />
                            )}
                            Requests I made
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {tab === "donate" ? (
                            <motion.div key="donate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="min-h-[300px]">
                                {!profile?.blood_group ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-white/5 border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl">
                                        <div className="p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl mb-4">
                                            <Settings className="w-6 h-6 text-zinc-400" />
                                        </div>
                                        <p className="text-zinc-900 dark:text-white font-bold mb-1">You haven't set your blood group yet</p>
                                        <p className="text-sm text-zinc-500 mb-6 max-w-sm">Add it now so we can show you relevant requests near you.</p>
                                        <Link href="/onboarding">
                                            <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800">Set Blood Group</Button>
                                        </Link>
                                    </div>
                                ) : !profile.is_available_donor ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl">
                                        <ShieldCheck className="w-8 h-8 text-zinc-400 mb-4" />
                                        <p className="text-zinc-900 dark:text-white font-bold mb-1">You've turned off availability</p>
                                        <p className="text-sm text-zinc-500 max-w-sm">Requests near you won't reach you while this is off. Turn it back on when you're ready.</p>
                                    </div>
                                ) : donateRequests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-4" />
                                        <p className="text-emerald-900 dark:text-emerald-400 font-bold mb-1">No matching requests right now</p>
                                        <p className="text-sm text-emerald-700/70 dark:text-emerald-500/70 max-w-sm">You're set up to help. You'll get a notification when someone near you needs {profile.blood_group}.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {donateRequests.map((req, i) => (
                                            <motion.div key={req.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="group relative">
                                                <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] pointer-events-none" />
                                                <div className="relative p-6 flex flex-col h-full">
                                                    
                                                    {/* Header Status Phase */}
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold tracking-tight ${URGENCY_COLOR[req.urgency_level ?? ""] ?? "bg-zinc-100 text-zinc-900 border-zinc-200"}`}>
                                                            {req.blood_group} needed
                                                        </div>
                                                        {req.urgency_level === "IMMEDIATE" && (
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-widest animate-pulse">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                                                Needed in the next few hours
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Facility Data Block */}
                                                    <div className="mb-6 flex-1">
                                                        <h3 className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white mb-2">{req.patient_name}</h3>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                                <div className="w-6 flex justify-center"><MapPin className="w-4 h-4" /></div>
                                                                <span className="font-medium truncate">{req.hospital_name}, {req.city}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                                <div className="w-6 flex justify-center"><Droplet className="w-4 h-4" /></div>
                                                                <span className="font-medium">{req.units} unit(s)</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                                <div className="w-6 flex justify-center"><Clock className="w-4 h-4" /></div>
                                                                <span className="font-medium font-mono">Posted at {new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Execution Engine */}
                                                    {req.status === 'DONOR_ACCEPTED' && req.donor_phone === profile?.phone ? (
                                                        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                                                            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-1">You are helping {req.patient_name}!</p>
                                                            <p className="text-xs text-emerald-700 dark:text-emerald-500 mb-3">Please call the patient's contact right away to coordinate the donation.</p>
                                                            <a href={`tel:${req.contact_phone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">
                                                                Call {req.contact_phone}
                                                            </a>
                                                        </div>
                                                    ) : (
                                                    <motion.button
                                                        whileHover={{ scale: 0.98 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleAccept(req.id)}
                                                        disabled={acceptingId === req.id || acceptedIds.has(req.id)}
                                                        className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 transition-all ${
                                                            acceptedIds.has(req.id)
                                                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 cursor-not-allowed border border-emerald-500/20"
                                                                : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(255,255,255,0.05)]"
                                                        } disabled:opacity-50`}
                                                    >
                                                        {acceptedIds.has(req.id) ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4" /> You're helping
                                                            </>
                                                        ) : acceptingId === req.id ? (
                                                            <>
                                                                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                                Confirming...
                                                            </>
                                                        ) : (
                                                            <>I can help</>
                                                        )}
                                                    </motion.button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="mine" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="min-h-[300px]">
                                {myRequests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-white/5 border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl">
                                        <div className="p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl mb-4">
                                            <Activity className="w-6 h-6 text-zinc-400" />
                                        </div>
                                        <p className="text-zinc-900 dark:text-white font-bold mb-1">You haven't made any requests yet</p>
                                        <p className="text-sm text-zinc-500 mb-6 max-w-sm">If someone near you needs blood, you can request help from here.</p>
                                        <Link href="/request/wizard">
                                            <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800">Request help</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myRequests.map((req, i) => {
                                            const statusStyle = STATUS_BADGE[req.status] ?? STATUS_BADGE["CREATED"];
                                            const statusLabel = STATUS_LABEL[req.status] ?? "Unknown status";
                                            
                                            return (
                                            <motion.div key={req.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                                                <Link href={`/request/${req.id}`} className="block relative group outline-none">
                                                    <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-white/10 group-hover:border-crimson/30 transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)] pointer-events-none" />
                                                    <div className="relative p-6">
                                                        
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-current/10 ${statusStyle.bg} ${statusStyle.text}`}>
                                                                {statusLabel}
                                                            </div>
                                                            <span className="text-[10px] font-mono text-zinc-400">
                                                                {new Date(req.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm tracking-tight border ${URGENCY_COLOR[req.urgency_level ?? ""] ?? "bg-zinc-100 text-zinc-900 border-zinc-200"}`}>
                                                                {req.blood_group}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <h3 className="font-extrabold text-zinc-900 dark:text-white truncate tracking-tight">{req.patient_name}</h3>
                                                                <p className="text-xs font-semibold text-zinc-500 truncate">{req.hospital_name}</p>
                                                            </div>
                                                        </div>

                                                        {req.status === 'DONOR_ACCEPTED' && req.donor_phone && (
                                                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/5">
                                                                <p className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Donor Found</p>
                                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">{req.donor_name}</p>
                                                                <a href={`tel:${req.donor_phone}`} className="inline-block px-4 py-2 bg-zinc-100 dark:bg-white/10 rounded-lg text-sm font-bold text-zinc-900 dark:text-white hover:bg-zinc-200 transition-colors">
                                                                    Call Donor
                                                                </a>
                                                            </div>
                                                        )}

                                                    </div>
                                                </Link>
                                            </motion.div>
                                        )})}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
