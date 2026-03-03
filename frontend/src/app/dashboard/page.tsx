"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiClient } from "@/lib/useApiClient";
import {
    AlertCircle, Droplet, MapPin, Clock, Heart,
    TrendingUp, Plus, Settings, CheckCircle2, Zap,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DonorAvailabilityToggle } from "@/components/DonorAvailabilityToggle";
import { NotificationBell } from "@/components/NotificationBell";
import type { BloodRequest, User } from "@/types";

type Tab = "donate" | "mine";

const URGENCY_COLOR: Record<string, string> = {
    IMMEDIATE: "bg-red-500",
    TODAY: "bg-orange-500",
    SCHEDULED: "bg-blue-500",
};

const STATUS_BADGE: Record<string, "info" | "warning" | "success" | "danger" | "default"> = {
    CREATED: "info",
    SEARCHING_FOR_DONORS: "warning",
    DONOR_ACCEPTED: "success",
    COMPLETED: "default",
    CANCELLED: "danger",
};

function UrgencyBar({ level }: { level: string }) {
    return <div className={`h-1 w-full ${URGENCY_COLOR[level] ?? "bg-gray-300"}`} />;
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const api = useApiClient();

    const [profile, setProfile] = useState<User | null>(null);
    const [allRequests, setAllRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>("donate");
    const [acceptingId, setAcceptingId] = useState<number | null>(null);
    const [acceptedIds, setAcceptedIds] = useState<Set<number>>(new Set());

    const fetchData = useCallback(async () => {
        try {
            const [profileRes, requestsRes] = await Promise.all([
                api.get<User>("users/profile/"),
                api.get<BloodRequest[]>("requests/"),
            ]);
            setProfile(profileRes.data);
            setAllRequests(requestsRes.data);
        } catch {
            // handled silently — user sees empty state
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) { router.push("/"); return; }
        fetchData();
    }, [isLoaded, user, fetchData, router]);

    const handleAccept = async (requestId: number) => {
        setAcceptingId(requestId);
        try {
            await api.post(`requests/${requestId}/accept/`);
            setAcceptedIds((prev) => new Set(prev).add(requestId));
            await fetchData();
        } catch (err: any) {
            const msg = err.response?.data?.error ?? "Could not accept request. Try again.";
            alert(msg);
        } finally {
            setAcceptingId(null);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-red" />
                    <p className="text-gray-500 text-sm font-medium animate-pulse">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const myRequests = allRequests.filter((r) => r.requester_id === (profile?.id ?? -1));

    // Requests from others that match the user's blood group and are still searching
    const donateRequests = allRequests.filter(
        (r) =>
            r.requester_id !== (profile?.id ?? -1) &&
            r.blood_group === profile?.blood_group &&
            (r.status === "SEARCHING_FOR_DONORS" || r.status === "CREATED")
    );

    const timeOfDay =
        new Date().getHours() < 12
            ? "Good morning"
            : new Date().getHours() < 18
                ? "Good afternoon"
                : "Good evening";
    const displayName = user?.firstName ?? user?.username ?? "Donor";

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Droplet className="w-6 h-6 text-brand-red" />
                        <span className="text-xl font-bold">
                            <span className="text-brand-red">Pulse</span>
                            <span className="text-brand-blue">Aid</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <Link href="/settings">
                            <Button variant="ghost" size="sm" className="w-9 h-9 rounded-full p-0 text-gray-500">
                                <Settings className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Welcome row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {timeOfDay}, {displayName} 👋
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            {profile?.blood_group
                                ? `You're a ${profile.blood_group} donor — ${donateRequests.length} request${donateRequests.length !== 1 ? "s" : ""} waiting for you`
                                : "Complete your profile to start donating"}
                        </p>
                    </div>
                    <Link href="/request/wizard">
                        <Button size="lg" className="shadow-lg shadow-brand-red/20">
                            <Plus className="w-5 h-5 mr-2" />
                            Request Blood
                        </Button>
                    </Link>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Droplet className="w-5 h-5 text-brand-red" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{profile?.blood_group ?? "—"}</p>
                                <p className="text-xs text-gray-500">Blood Group</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${profile?.is_available_donor ? "bg-green-50" : "bg-gray-100"}`}>
                                <Heart className={`w-5 h-5 ${profile?.is_available_donor ? "text-green-600" : "text-gray-400"}`} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">
                                    {profile?.is_available_donor ? "Available" : "Away"}
                                </p>
                                <p className="text-xs text-gray-500">Donor Status</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Zap className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{donateRequests.length}</p>
                                <p className="text-xs text-gray-500">Needs Your Blood</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{myRequests.length}</p>
                                <p className="text-xs text-gray-500">My Requests</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Availability Toggle */}
                {profile && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <DonorAvailabilityToggle
                            initialAvailable={profile.is_available_donor ?? false}
                            onToggle={() => fetchData()}
                        />
                    </motion.div>
                )}

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                        <button
                            onClick={() => setTab("donate")}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "donate"
                                ? "bg-white text-brand-red shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            🩸 Donate Blood
                            {donateRequests.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                                    {donateRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setTab("mine")}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "mine"
                                ? "bg-white text-brand-blue shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            📋 My Requests
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {tab === "donate" ? (
                            <motion.div
                                key="donate"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {!profile?.blood_group ? (
                                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                                        <p className="text-gray-500 text-sm">
                                            Complete your profile to see matching requests.
                                        </p>
                                        <Link href="/onboarding" className="mt-3 inline-block">
                                            <Button variant="outline" size="sm">Complete Profile</Button>
                                        </Link>
                                    </div>
                                ) : !profile.is_available_donor ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                                        <Heart className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                                        <p className="font-semibold text-amber-800">You&apos;re currently set as unavailable</p>
                                        <p className="text-sm text-amber-600 mt-1">Toggle your availability above to start accepting requests.</p>
                                    </div>
                                ) : donateRequests.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                                        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                        <h3 className="font-bold text-gray-800">All clear!</h3>
                                        <p className="text-gray-500 text-sm mt-1">
                                            No active requests for {profile.blood_group} blood in your area right now.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {donateRequests.map((req, i) => (
                                            <motion.div
                                                key={req.id}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.07 }}
                                            >
                                                <Card className="h-full border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                                                    <UrgencyBar level={req.urgency_level} />
                                                    <CardContent className="p-5 flex flex-col h-full">
                                                        {/* Blood group badge + urgency */}
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-white text-xl shadow-lg ${URGENCY_COLOR[req.urgency_level] ?? "bg-gray-400"}`}>
                                                                {req.blood_group}
                                                            </div>
                                                            {req.urgency_level === "IMMEDIATE" && (
                                                                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full animate-pulse">
                                                                    <AlertCircle className="w-3 h-3" /> URGENT
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="font-bold text-gray-900">{req.patient_name}</h3>
                                                        <p className="text-sm text-gray-500 mt-0.5 truncate">{req.hospital_name}</p>

                                                        <div className="mt-3 space-y-1.5 text-sm text-gray-600 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                <span>{req.city}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Droplet className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                <span>{req.units} unit{req.units !== 1 ? "s" : ""} needed</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                <span>{new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                            </div>
                                                        </div>

                                                        {/* Accept button — the Uber moment */}
                                                        <button
                                                            onClick={() => handleAccept(req.id)}
                                                            disabled={acceptingId === req.id || acceptedIds.has(req.id)}
                                                            className={`mt-5 w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${acceptedIds.has(req.id)
                                                                ? "bg-green-500 cursor-default"
                                                                : "bg-brand-red hover:bg-red-700 shadow-lg shadow-brand-red/30 hover:shadow-brand-red/50"
                                                                } disabled:opacity-60`}
                                                        >
                                                            {acceptedIds.has(req.id) ? (
                                                                <>
                                                                    <CheckCircle2 className="w-5 h-5" /> Accepted!
                                                                </>
                                                            ) : acceptingId === req.id ? (
                                                                <>
                                                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                                    Accepting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Heart className="w-5 h-5" /> I Can Donate
                                                                </>
                                                            )}
                                                        </button>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="mine"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {myRequests.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                                        <h3 className="font-bold text-gray-800 mb-2">No requests yet</h3>
                                        <p className="text-gray-500 text-sm mb-5">Need blood urgently? Create a request and get matched in seconds.</p>
                                        <Link href="/request/wizard">
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                New Blood Request
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {myRequests.map((req, i) => (
                                            <motion.div
                                                key={req.id}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.07 }}
                                            >
                                                <Link href={`/request/${req.id}`} className="block h-full">
                                                    <Card className="h-full border-gray-100 hover:border-brand-red/30 hover:shadow-lg transition-all overflow-hidden">
                                                        <UrgencyBar level={req.urgency_level} />
                                                        <CardContent className="p-5">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${URGENCY_COLOR[req.urgency_level] ?? "bg-gray-400"}`}>
                                                                    {req.blood_group}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-900 line-clamp-1">{req.patient_name}</h3>
                                                                    <p className="text-xs text-gray-500 truncate">{req.hospital_name}</p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                    <span>{req.city}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                                <Badge variant={STATUS_BADGE[req.status] ?? "default"} className="text-[10px] uppercase tracking-wider">
                                                                    {req.status.replace(/_/g, " ")}
                                                                </Badge>
                                                                {req.urgency_level === "IMMEDIATE" && (
                                                                    <span className="text-xs font-bold text-red-600 flex items-center gap-1 animate-pulse">
                                                                        <AlertCircle className="w-3 h-3" /> Urgent
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            </motion.div>
                                        ))}
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
