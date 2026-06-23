"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getProfileAction, getResponsesForDonorAction, submitDonorResponseAction } from "@/app/actions/donor.actions";
import { getActiveRequestsAction } from "@/app/actions/request.actions";
import { getRecentActivitiesAction, logActivityAction } from "@/app/actions/activity.actions";

import {
    Droplet, MapPin, Settings, AlertTriangle,
    Plus, CheckCircle2, Activity, Heart,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertService } from "@/services/alert.service";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { RequestDetailDrawer } from "@/components/request/RequestDetailDrawer";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { BentoRequestCard } from "@/components/dashboard/BentoRequestCard";
import { EmergencyTracker } from "@/components/dashboard/EmergencyTracker";
import { AvailabilityCard } from "@/components/dashboard/AvailabilityCard";
import { ImpactCard } from "@/components/dashboard/ImpactCard";
import { FilterPills, type FilterOption } from "@/components/dashboard/FilterPills";
import type { BloodRequest, User } from "@/types";
import { supabaseClient } from "@/lib/supabase/client";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import { NotificationPrompt } from "@/components/notifications/NotificationPrompt";
import { BottomNav } from "@/components/nav/BottomNav";
import { staggerContainer, slideUpFade } from "@/lib/motion";
import { EmptyState } from "@/components/ui/EmptyState";
import { CommandPalette, useCommandPalette } from "@/components/ui/CommandPalette";

/* ─── Status badge maps ─── */
const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
    searching:      { bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
    donor_accepted: { bg: "bg-[#DCFCE7]", text: "text-[#15803D]" },
    fulfilled:      { bg: "bg-[#D1FAE5]", text: "text-[#065F46]" },
    cancelled:      { bg: "bg-[#F4F4F4]", text: "text-[#525252]" },
    expired:        { bg: "bg-[#FFF7ED]", text: "text-[#9A3412]" },
};

const STATUS_LABEL: Record<string, string> = {
    searching:      "Searching",
    donor_accepted: "Donor found",
    fulfilled:      "Fulfilled",
    cancelled:      "Cancelled",
    expired:        "Expired",
};

/* ─── Skeleton ─── */
function DashboardSkeleton() {
    const sk = "bg-[#F4F4F4] animate-[skeleton-pulse_1.5s_ease-in-out_infinite]";
    return (
        <div className="min-h-[100dvh] bg-[#FCFCFB]">
            <header
                className="sticky top-0 z-50 border-b border-[#ECECEC] h-16"
                style={{ background: "rgba(252,252,251,0.92)" }}
            />
            <main className="max-w-[1280px] mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left col skeleton */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        {/* Small cards row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={`rounded-[28px] border border-[#ECECEC] p-5 min-h-[104px] ${sk}`} />
                            ))}
                        </div>
                        {/* Board skeleton */}
                        <div className="bg-white rounded-[28px] border border-[#ECECEC] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`h-4 w-32 rounded-full ${sk}`} />
                                <div className={`h-5 w-10 rounded-full ${sk}`} />
                            </div>
                            <div className="flex gap-2 mb-5">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`h-9 w-20 rounded-full ${sk}`} />
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className={`rounded-[28px] border border-[#ECECEC] p-5 h-[200px] ${sk}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Activity skeleton */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-[28px] border border-[#ECECEC] overflow-hidden">
                            <div className={`h-14 border-b border-[#ECECEC] ${sk}`} />
                            <div className="p-2 space-y-0.5">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3">
                                        <div className={`w-5 h-5 rounded-full ${sk} shrink-0`} />
                                        <div className={`flex-1 h-3 rounded-full ${sk}`} />
                                        <div className={`w-12 h-3 rounded-full ${sk} shrink-0`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ─── Helpers ─── */
function isToday(date: Date): boolean {
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}

/* ─── Page ─── */
export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    useRealtimeAlerts();

    const [profile, setProfile] = useState<User | null>(null);
    const [allRequests, setAllRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<number | string | null>(null);
    const [acceptedIds, setAcceptedIds] = useState<Set<number | string>>(new Set());
    const [selectedRequestId, setSelectedRequestId] = useState<string | number | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
    const [boardError, setBoardError] = useState<string | null>(null);
    const [showMyPosts, setShowMyPosts] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [profileData, requestsData, activitiesData] = await Promise.all([
                getProfileAction().catch(() => null),
                getActiveRequestsAction().catch(() => []),
                getRecentActivitiesAction().catch(() => [])
            ]);
            setProfile(profileData as any);
            setAllRequests(requestsData as any);

            if (profileData) {
                try {
                    const data = await getResponsesForDonorAction();
                    setAcceptedIds(new Set(data.filter((r: any) => r.status !== 'CANCELLED').map((r: any) => r.request_id)));
                } catch { /* ignore */ }
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [user?.id]);

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) { router.push("/"); return; }
        fetchData();

        const channel = supabaseClient
            .channel("dashboard_changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "blood_requests" }, () => fetchData())
            .on("postgres_changes", { event: "*", schema: "public", table: "donor_responses" }, () => fetchData())
            .subscribe();

        return () => { supabaseClient.removeChannel(channel); };
    }, [isLoaded, user, fetchData, router]);

    const handleAccept = async (requestId: any) => {
        setAcceptingId(requestId);
        setBoardError(null);
        try {
            await submitDonorResponseAction(requestId.toString(), 'ACCEPTED');

            const req = allRequests.find((r: any) => r.id === requestId);
            if (req?.contact_phone) {
                await AlertService.sendSMS(
                    req.contact_phone,
                    `BloodRelay ALERT: ${profile?.full_name || "A donor"} has offered to donate blood for ${req.patient_name || "your request"}. Check your dashboard for details.`
                );
            }

            await logActivityAction(
                "donor_accepted",
                `You offered to donate blood for ${req?.patient_name || "a patient"} at ${req?.hospital_name || "the hospital"}.`,
                requestId.toString()
            );

            setAcceptedIds((prev) => new Set(prev).add(requestId));
            await fetchData();
        } catch (err: any) {
            setBoardError(err.message || "We encountered an issue. Please try again.");
        } finally {
            setAcceptingId(null);
        }
    };

    useEffect(() => {
        if (!loading && profile && profile.profile_completed === false) {
            router.push("/onboarding");
        }
    }, [loading, profile, router]);

    const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();

    if (!isLoaded || loading) return <DashboardSkeleton />;

    /* ─── Derived data ─── */
    const donateRequests = allRequests.filter(
        (r) =>
            r.requester_id !== (profile?.id ?? -1) &&
            (r.blood_group === profile?.blood_group || r.requester_id === null) &&
            (r.status === "searching" || r.status === "donor_accepted" || acceptedIds.has(r.id))
    );

    const myRequests = allRequests.filter((r) => r.requester_id === (profile?.id ?? -1));

    const filteredRequests = (() => {
        if (activeFilter === "Emergency")
            return donateRequests.filter((r) => r.urgency_level === "IMMEDIATE");
        if (activeFilter === "Today")
            return donateRequests.filter((r) => isToday(new Date(r.created_at)));
        if (activeFilter === "Fulfilled")
            return allRequests.filter((r) => acceptedIds.has(r.id) && r.status === "fulfilled");
        return donateRequests;
    })();

    const filterCounts: Partial<Record<FilterOption, number>> = {
        Emergency: donateRequests.filter((r) => r.urgency_level === "IMMEDIATE").length,
        Today: donateRequests.filter((r) => isToday(new Date(r.created_at))).length,
        Fulfilled: allRequests.filter((r) => acceptedIds.has(r.id) && r.status === "fulfilled").length,
    };

    /* ─── Impact stats ─── */
    const livesSupported = acceptedIds.size;
    const successfulDonations = allRequests.filter(
        (r) => acceptedIds.has(r.id) && r.status === "fulfilled"
    ).length;
    const activeNow = allRequests.filter((r) => r.status === "searching").length;

    const displayName = user?.firstName ?? user?.username ?? "There";
    const hasEmergency = donateRequests.some((r) => r.urgency_level === "IMMEDIATE");

    return (
        <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 md:pb-0">

            <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />

            {/* ── Nav ─────────────────────────────────────── */}
            <header
                className="sticky top-0 z-50 border-b border-[var(--color-border-subtle)] h-16 flex justify-center"
                style={{ background: "rgba(252,252,251,0.92)", backdropFilter: "blur(12px)" }}
            >
                <nav className="w-full max-w-[1280px] px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Link href="/" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-md">
                            <Droplet className="w-4 h-4 fill-[var(--color-cta)] stroke-[var(--color-cta)]" />
                            <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">BloodRelay</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" aria-hidden="true" />
                            <span className="text-[11px] font-medium text-[var(--color-text-muted)]">Donor network active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search trigger */}
                        <button
                            onClick={() => setCmdOpen(true)}
                            className="hidden md:flex items-center gap-2 h-8 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] text-[12px] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)] transition-colors"
                            aria-label="Open command palette (Ctrl+K)"
                        >
                            <span>Search…</span>
                            <kbd className="text-[10px] font-mono opacity-60">⌘K</kbd>
                        </button>
                        <Link
                            href="/activity"
                            className="hidden md:block text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors font-medium"
                        >
                            Activity
                        </Link>
                        <NotificationBell />
                        <Link
                            href="/request/wizard"
                            className="h-9 px-4 bg-[var(--color-cta)] text-white text-[13px] font-medium rounded-[var(--radius-button)] flex items-center gap-1.5 hover:bg-[var(--color-cta-hover)] transition-colors"
                        >
                            <AlertTriangle className={`w-3.5 h-3.5 ${hasEmergency ? "animate-pulse" : ""}`} aria-hidden="true" />
                            Emergency
                        </Link>
                        <Link
                            href="/settings"
                            className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-cta)] transition-colors"
                            aria-label="Settings"
                        >
                            <Settings className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="max-w-[1280px] mx-auto px-6 py-6">

                {/* ── Emergency banner ─────────────────────── */}
                <AnimatePresence>
                    {hasEmergency && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            className="flex items-center gap-3 px-5 py-3 text-white rounded-[var(--radius-card)] mb-5"
                            style={{ background: "var(--color-cta)" }}
                            role="alert"
                            aria-live="polite"
                        >
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" aria-hidden="true" />
                            <span className="text-[13px] font-medium truncate">
                                {donateRequests.find((r) => r.urgency_level === "IMMEDIATE")?.blood_group} needed urgently — someone nearby needs help
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Bento Grid ───────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* ── Left column: 8/12 ──────────────────── */}
                    <div className="lg:col-span-8 flex flex-col gap-4">

                        {/* ── Row 1: Availability + Impact Cards ── */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            <AvailabilityCard
                                profile={profile}
                                onToggle={fetchData}
                            />
                            <ImpactCard
                                label="Lives Supported"
                                value={livesSupported}
                                icon={Heart}
                            />
                            <ImpactCard
                                label="Donations Made"
                                value={successfulDonations}
                                icon={CheckCircle2}
                            />
                            <ImpactCard
                                label="Active Requests"
                                value={activeNow}
                                icon={Activity}
                            />
                        </motion.div>

                        {/* ── Row 2: Emergency Board (dominant) ── */}
                        <motion.div
                            variants={slideUpFade}
                            initial="hidden"
                            animate="visible"
                            className="card-base p-5 flex flex-col gap-4"
                        >
                            {/* Board error */}
                            <AnimatePresence>
                                {boardError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-4 py-3 rounded-[var(--radius-input)] flex items-center justify-between gap-3"
                                        style={{ background: "var(--color-danger-light)", border: "1px solid rgba(220,38,38,0.15)" }}
                                    >
                                        <p className="text-[13px] font-medium" style={{ color: "var(--color-danger)" }}>{boardError}</p>
                                        <button
                                            onClick={() => setBoardError(null)}
                                            className="shrink-0 text-lg leading-none transition-opacity hover:opacity-70"
                                            style={{ color: "var(--color-danger)" }}
                                            aria-label="Dismiss error"
                                        >
                                            ×
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Board header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Emergency Board</h2>
                                    <p className="text-xs text-[#737373] mt-0.5">
                                        {profile?.blood_group
                                            ? `Showing ${profile.blood_group} compatible requests`
                                            : "Live requests near you"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex items-center gap-1.5 text-[10px] rounded-full px-2.5 py-1 font-semibold uppercase tracking-wider shrink-0"
                                        style={{ background: "var(--color-success-light)", color: "#065F46" }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" aria-hidden="true" />
                                        Live
                                    </div>
                                    <button
                                        onClick={() => setShowMyPosts((v) => !v)}
                                        className="px-3.5 py-1.5 text-[13px] font-semibold rounded-full transition-colors shrink-0"
                                        style={
                                            showMyPosts
                                                ? { background: "var(--color-text-primary)", color: "#fff" }
                                                : { background: "var(--color-base-100)", color: "var(--color-text-muted)" }
                                        }
                                    >
                                        My Posts
                                        {myRequests.length > 0 && (
                                            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#D63A3A] text-[9px] text-white font-bold align-middle">
                                                {myRequests.length}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {showMyPosts ? (
                                    /* ── My Posts view ─── */
                                    <motion.div
                                        key="mine"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {myRequests.length === 0 ? (
                                            <EmptyState
                                                title="No requests yet"
                                                message="Need blood for someone? Create a request to reach nearby donors instantly."
                                                action={{ label: "Create request", href: "/request/wizard" }}
                                            />
                                        ) : (
                                            <div className="space-y-6">
                                                {myRequests[0].status === "searching" && (
                                                    <EmergencyTracker
                                                        request={myRequests[0]}
                                                        responses={(myRequests[0] as any).donor_responses || []}
                                                        isRequester={true}
                                                    />
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {myRequests.map((req) => {
                                                        return (
                                                            <motion.div
                                                                key={req.id}
                                                                layout
                                                                onClick={() => setSelectedRequestId(req.id)}
                                                                className="card-interactive cursor-pointer p-5"
                                                            >
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <span className={`badge ${
                                                                        req.status === "donor_accepted" ? "badge-accepted" :
                                                                        req.status === "fulfilled" ? "badge-fulfilled" :
                                                                        req.status === "cancelled" ? "badge-cancelled" :
                                                                        req.status === "expired" ? "badge-expired" : "badge-searching"
                                                                    }`}>
                                                                        {STATUS_LABEL[req.status] ?? req.status}
                                                                    </span>
                                                                    <div
                                                                        className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold font-metric text-[var(--color-cta)] text-sm border border-[var(--color-border)]"
                                                                        style={{ background: "rgba(214,58,58,0.07)" }}
                                                                    >
                                                                        {req.blood_group}
                                                                    </div>
                                                                </div>
                                                                <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate mb-1.5">
                                                                    {req.patient_name}
                                                                </h3>
                                                                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs">
                                                                    <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                                                                    <span className="truncate">{req.hospital_name}</span>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    /* ── Live Feed view ─── */
                                    <motion.div
                                        key="donate"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex flex-col gap-4"
                                    >
                                        {/* Filter Pills */}
                                        {profile?.is_available_donor && (
                                            <FilterPills
                                                active={activeFilter}
                                                onChange={setActiveFilter}
                                                counts={filterCounts}
                                            />
                                        )}

                                        {/* Request cards / empty states */}
                                        {!profile?.blood_group ? (
                                            <EmptyState
                                                title="Blood group not set"
                                                message="We need your blood group to find relevant requests near you."
                                                action={{ label: "Set up profile", href: "/onboarding" }}
                                            />
                                        ) : !profile.is_available_donor ? (
                                            <EmptyState
                                                title="You're taking a break"
                                                message="Toggle availability above whenever you're ready — we'll match you with requests right away."
                                            />
                                        ) : filteredRequests.length === 0 ? (
                                            activeFilter === "Fulfilled" ? (
                                                <EmptyState
                                                    title="No fulfilled donations yet"
                                                    message="Once you help with a request and it's marked complete, it appears here."
                                                    className="bg-[var(--color-success-light)] rounded-[var(--radius-card)]"
                                                />
                                            ) : donateRequests.length === 0 ? (
                                                <EmptyState
                                                    title="You're all caught up"
                                                    message={`No urgent ${profile.blood_group} requests right now. We'll alert you the moment something comes in.`}
                                                    className="bg-[var(--color-success-light)] rounded-[var(--radius-card)]"
                                                />
                                            ) : (
                                                <EmptyState
                                                    title="No matches for this filter"
                                                    message={`No requests match "${activeFilter}" right now. Try a different filter.`}
                                                />
                                            )
                                        ) : (
                                            <motion.div
                                                variants={staggerContainer}
                                                initial="hidden"
                                                animate="visible"
                                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                            >
                                                {filteredRequests.map((req) => (
                                                    <BentoRequestCard
                                                        key={req.id}
                                                        request={req}
                                                        onClick={() => setSelectedRequestId(req.id)}
                                                        onAccept={() => handleAccept(req.id)}
                                                        isAccepting={acceptingId === req.id}
                                                        isAccepted={acceptedIds.has(req.id)}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* ── Right column: Activity Stream 4/12 ─── */}
                    <div className="lg:col-span-4">
                        <ActivityTimeline limit={30} />
                    </div>
                </div>
            </main>

            <RequestDetailDrawer
                requestId={selectedRequestId}
                onClose={() => setSelectedRequestId(null)}
                onActionComplete={() => { fetchData(); setSelectedRequestId(null); }}
            />
            <NotificationPrompt />
            <BottomNav />
        </div>
    );
}
