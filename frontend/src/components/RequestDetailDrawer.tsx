"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, MapPin, Droplet, Clock, Phone, User, Heart, CheckCircle,
    AlertCircle, Share2, Shield, Edit2, Loader2
} from "lucide-react";
import { DonorService } from "@/services/donor.service";
import { RequestService } from "@/services/request.service";
import { AlertService } from "@/services/alert.service";
import type { BloodRequest, DonorResponse } from "@/types";
import Link from "next/link";
import Map from "@/components/Map";
import { formatDistance, estimateETA, calculateDistance } from "@/lib/geolocation";

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

const URGENCY_COLOR: Record<string, string> = {
    IMMEDIATE: "bg-rose-500 text-white border-rose-500",
    TODAY: "bg-amber-500 text-zinc-900 border-amber-500",
    SCHEDULED: "bg-blue-500 text-white border-blue-500",
};

interface Props {
    requestId: string | number | null;
    onClose: () => void;
    onActionComplete?: () => void;
}

export function RequestDetailDrawer({ requestId, onClose, onActionComplete }: Props) {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [request, setRequest] = useState<any | null>(null);
    const [acceptedDonors, setAcceptedDonors] = useState<DonorResponse[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(false);

    const fetchRequest = useCallback(async () => {
        if (!requestId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await RequestService.getRequestById(requestId.toString());
            setRequest(data);

            try {
                const responses = await DonorService.getResponsesForRequest(requestId.toString());
                setAcceptedDonors(responses);
            } catch { }
        } catch (err: any) {
            setError("Could not load request details.");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    // Load user profile
    useEffect(() => {
        if (isLoaded && user?.id) {
            DonorService.getProfile(user.id).then(setCurrentUserProfile).catch(() => { });
        }
    }, [user?.id, isLoaded]);

    // Load request when drawer opens
    useEffect(() => {
        if (requestId) {
            fetchRequest();
        } else {
            setRequest(null);
            setAcceptedDonors([]);
            setError(null);
        }
    }, [requestId, fetchRequest]);

    // Realtime donor responses
    useEffect(() => {
        if (!requestId) return;
        let channel: any;
        const setup = async () => {
            const { supabaseClient } = await import("@/lib/supabase/client");
            channel = supabaseClient
                .channel(`drawer_${requestId}_responses`)
                .on("postgres_changes", {
                    event: "*", schema: "public", table: "donor_responses",
                    filter: `request_id=eq.${requestId}`
                }, async () => {
                    try {
                        const responses = await DonorService.getResponsesForRequest(requestId.toString());
                        setAcceptedDonors(responses);
                    } catch { }
                })
                .subscribe();
        };
        setup();
        return () => { if (channel) channel.unsubscribe(); };
    }, [requestId]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleAccept = async () => {
        if (!currentUserProfile?.id) {
            router.push("/onboarding");
            return;
        }
        setAccepting(true);
        try {
            let distance = null;
            let eta = null;
            if (currentUserProfile.latitude && currentUserProfile.longitude && request?.latitude && request?.longitude) {
                distance = calculateDistance(
                    currentUserProfile.latitude, 
                    currentUserProfile.longitude, 
                    request.latitude, 
                    request.longitude
                );
                eta = estimateETA(distance);
            } else if (currentUserProfile.location && request?.location && request.location !== 'POINT(0 0)') {
                // Fallback to PostGIS point extraction if available
                const userLoc = parseLocation(currentUserProfile.location);
                const reqLoc = parseLocation(request.location);
                if (userLoc && reqLoc) {
                    distance = calculateDistance(userLoc.lat, userLoc.lng, reqLoc.lat, reqLoc.lng);
                    eta = estimateETA(distance);
                }
            }

            await DonorService.submitDonorResponse(
                requestId!.toString(), 
                currentUserProfile.id.toString(), 
                'ACCEPTED',
                distance,
                eta
            );
            if (request?.contact_phone) {
                await AlertService.sendSMS(
                    request.contact_phone,
                    `PULSE-AID ALERT: ${currentUserProfile.full_name || "A donor"} has offered to donate blood for ${request.patient_name}. They may contact you shortly.`
                );
            }
            await fetchRequest();
            onActionComplete?.();
        } catch (err: any) {
            alert(err.message || "We couldn't process this right now.");
        } finally {
            setAccepting(false);
        }
    };

    const handleComplete = async () => {
        try {
            await RequestService.updateRequest(requestId!.toString(), { status: "fulfilled" });
            onClose();
            onActionComplete?.();
        } catch { alert("Could not mark as fulfilled. Please try again."); }
    };

    const handleCancel = async () => {
        if (!confirm("Cancel this request? This cannot be undone.")) return;
        try {
            await RequestService.updateRequest(requestId!.toString(), { status: "cancelled" });
            onClose();
            onActionComplete?.();
        } catch { alert("Could not cancel request. Please try again."); }
    };

    const isOpen = !!requestId;
    const isClosed = request && (
        request.status === "fulfilled" || request.status === "cancelled" ||
        request.status === "COMPLETED" || request.status === "CANCELLED"
    );
    const isRequester = currentUserProfile?.id && request?.requester_id && 
        currentUserProfile.id.toString() === request.requester_id.toString();
    const isResponding = acceptedDonors.some(d => d.donor_id?.toString() === currentUserProfile?.id?.toString());
    const userResponseStatus = acceptedDonors.find(d => d.donor_id?.toString() === currentUserProfile?.id?.toString())?.status;
    const canSeeContact = isRequester || userResponseStatus === 'ACCEPTED' || userResponseStatus === 'CONFIRMED' || userResponseStatus === 'ARRIVED';
    const canSupport = !isRequester && !isResponding && !isClosed;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="drawer-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        key="drawer-panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 35 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-zinc-50 dark:bg-zinc-950 shadow-2xl overflow-y-auto flex flex-col rounded-l-[40px]"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-white/10 px-6 h-16 flex items-center justify-between shrink-0">
                            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                                {request ? `Case ${String(request.id).padStart(4, "0")}` : "Loading..."}
                            </span>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-white/20 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 p-6 space-y-6">
                            {loading && (
                                <div className="flex flex-col items-center justify-center h-64 gap-4">
                                    <div className="w-10 h-10 relative">
                                        <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
                                        <div className="absolute inset-0 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-500">Loading details...</p>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <AlertCircle className="w-8 h-8 text-zinc-400 mb-3" />
                                    <p className="font-bold text-zinc-900 dark:text-white">{error}</p>
                                </div>
                            )}

                            {request && !loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {/* Urgency Banner */}
                                    {request.urgency_level === "IMMEDIATE" && !isClosed && (
                                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse shrink-0" />
                                            <div>
                                                <p className="font-bold text-rose-800 dark:text-rose-400 text-sm">Critical Case</p>
                                                <p className="text-xs text-rose-700/70 dark:text-rose-500/70">Blood needed in the next few hours.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    {!isClosed && (
                                        <div className="flex gap-2">
                                            <a href={`tel:${request.contact_phone}`} className="flex-1">
                                                <button className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
                                                    <Phone className="w-4 h-4" /> Call Contact
                                                </button>
                                            </a>
                                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(request.hospital_name + " " + request.city)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                <button className="w-full py-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all hover:bg-zinc-50 dark:hover:bg-white/10">
                                                    <MapPin className="w-4 h-4" /> Directions
                                                </button>
                                            </a>
                                        </div>
                                    )}

                                    {/* Case File Card */}
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/10 rounded-[2rem] shadow-clay overflow-hidden relative">
                                        {isClosed && (
                                            <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                                                    {String(request.status).toLowerCase() === "cancelled" ? (
                                                        <><AlertCircle className="w-5 h-5 text-zinc-400" /><span className="font-bold text-zinc-900 dark:text-white text-sm">Cancelled</span></>
                                                    ) : (
                                                        <><CheckCircle className="w-5 h-5 text-emerald-500" /><span className="font-bold text-zinc-900 dark:text-white text-sm">Fulfilled</span></>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6">
                                            {/* Blood group + patient */}
                                            <div className="flex items-start gap-5 mb-6">
                                                <div className={`shrink-0 w-20 h-20 rounded-[1.25rem] flex flex-col items-center justify-center border-2 ${URGENCY_COLOR[request.urgency_level ?? ""] ?? "bg-zinc-100 text-zinc-900 border-zinc-200"}`}>
                                                    <span className="text-2xl font-black tracking-tighter">{request.blood_group}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-80">Needed</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-1 truncate">{request.patient_name}</h2>
                                                    <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 truncate">{request.hospital_name}</p>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                    <MapPin className="w-3.5 h-3.5" /> {request.city}
                                                </div>
                                                <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                    <Droplet className="w-3.5 h-3.5" /> {request.units} Unit{request.units > 1 ? "s" : ""}
                                                </div>
                                                <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                    <Clock className="w-3.5 h-3.5" /> {new Date(request.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                                {request.location && request.location !== 'POINT(0 0)' && (
                                                    <a 
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${parseLocation(request.location)!.lat},${parseLocation(request.location)!.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 bg-zinc-900 dark:bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-white dark:text-zinc-900 hover:scale-105 transition-transform"
                                                    >
                                                        <Share2 className="w-3.5 h-3.5 rotate-90" /> Directions
                                                    </a>
                                                )}
                                            </div>

                                            <div className="border-t border-zinc-200/50 dark:border-white/10 pt-5 space-y-4">
                                                {/* Contact */}
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                                                        <Phone className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Contact</p>
                                                        {canSeeContact ? (
                                                            <p className="font-extrabold text-zinc-900 dark:text-white font-mono">{request.contact_phone}</p>
                                                        ) : (
                                                            <p className="font-extrabold text-zinc-900 dark:text-white font-mono text-sm tracking-[0.2em] blur-[3px] select-none">XXXXXX0000</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Requester relation */}
                                                {request.requester_relation && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                                                            <User className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Requester Relation</p>
                                                            <p className="font-bold text-zinc-900 dark:text-white capitalize">{request.requester_relation.toLowerCase()}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Note */}
                                                {request.note && (
                                                    <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl p-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Note</p>
                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{request.note}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                     {/* Map Preview */}
                                    {request.location && request.location !== 'POINT(0 0)' && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Hospital Location</p>
                                                {!showMap && (
                                                    <button 
                                                        onClick={() => setShowMap(true)}
                                                        className="text-[10px] font-bold text-crimson hover:underline uppercase tracking-wider"
                                                    >
                                                        View Map
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {showMap ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "192px" }}
                                                    className="h-48 w-full rounded-[2rem] overflow-hidden border border-zinc-200/50 dark:border-white/10 shadow-sm"
                                                >
                                                    <Map 
                                                        center={[parseLocation(request.location)!.lng, parseLocation(request.location)!.lat]}
                                                        zoom={14}
                                                        markers={[{
                                                            id: 'hospital',
                                                            lat: parseLocation(request.location)!.lat,
                                                            lng: parseLocation(request.location)!.lng,
                                                            label: request.hospital_name,
                                                            type: 'hospital'
                                                        }]}
                                                        className="h-full w-full"
                                                    />
                                                </motion.div>
                                            ) : (
                                                <button 
                                                    onClick={() => setShowMap(true)}
                                                    className="w-full h-12 bg-zinc-100 dark:bg-white/5 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[1.25rem] flex items-center justify-center gap-2 text-sm font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <MapPin className="w-4 h-4" /> Load Map
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Donor Responses */}
                                    {acceptedDonors.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-6"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-emerald-900 dark:text-emerald-400 text-sm tracking-tight">Help is on the way</h3>
                                                    <p className="text-xs text-emerald-700/70 dark:text-emerald-500/70">{acceptedDonors.length} donor{acceptedDonors.length > 1 ? "s" : ""} responding</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {acceptedDonors.map((resp) => (
                                                    <div key={resp.id} className="bg-white dark:bg-zinc-900 border border-emerald-500/10 p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                                                        <div>
                                                            <p className="font-bold text-zinc-900 dark:text-white text-sm">{resp.profiles?.full_name || "A Donor"}</p>
                                                            {resp.distance_meters != null && (
                                                                <p className="text-[10px] text-zinc-500 font-medium">
                                                                    {formatDistance(resp.distance_meters)} • ETA ~{estimateETA(resp.distance_meters)} min
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isRequester && (
                                                                <a href={`tel:${resp.profiles?.phone}`}>
                                                                    <button className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95">
                                                                        <Phone className="w-3.5 h-3.5" /> Call
                                                                    </button>
                                                                </a>
                                                            )}
                                                            {currentUserProfile?.id?.toString() === resp.donor_id?.toString() && (
                                                                <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded-md">You</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                     {/* Actions */}
                                    {!isClosed && (
                                        <div className="space-y-3">
                                            {canSupport ? (
                                                <button
                                                    onClick={handleAccept}
                                                    disabled={accepting}
                                                    className="w-full py-4 bg-crimson text-white text-base font-bold rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(192,57,43,0.3)] clay-button-hover hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                                                >
                                                    {accepting ? (
                                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
                                                    ) : (
                                                        <><Heart className="w-5 h-5 mr-2" />I can help them</>
                                                    )}
                                                </button>
                                            ) : isResponding ? (
                                                <button disabled className="w-full py-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-base font-bold rounded-2xl flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 mr-2" /> You are responding
                                                </button>
                                            ) : isRequester ? (
                                                <div className="p-4 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl text-center">
                                                    <p className="text-sm font-bold text-zinc-500">This is your request</p>
                                                </div>
                                            ) : null}

                                            {isRequester && !isClosed && (
                                                <>
                                                    <button
                                                        onClick={handleComplete}
                                                        className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-base font-bold rounded-2xl flex items-center justify-center shadow-md clay-button-hover"
                                                    >
                                                        <CheckCircle className="w-5 h-5 mr-2" /> Mark as Fulfilled
                                                    </button>
                                                    <div className="flex gap-3">
                                                        <Link href={`/request/${requestId}/edit`} className="flex-1">
                                                            <button className="w-full py-3.5 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold rounded-2xl flex items-center justify-center transition-all hover:bg-zinc-100 dark:hover:bg-white/5">
                                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={handleCancel}
                                                            className="flex-1 py-3.5 border-2 border-zinc-200 dark:border-zinc-800 text-rose-600 font-bold rounded-2xl flex items-center justify-center transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {/* Share */}
                                            <button
                                                onClick={() => navigator.share?.({ title: "Blood Request", url: `${window.location.origin}/request/${requestId}` })}
                                                className="w-full py-3.5 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white font-bold rounded-2xl flex items-center justify-center transition-colors hover:bg-zinc-200 dark:hover:bg-white/10"
                                            >
                                                <Share2 className="w-4 h-4 mr-2" /> Share this Request
                                            </button>
                                        </div>
                                    )}

                                    {/* Safety Notice */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-white/5">
                                        <Shield className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
                                        <p>BloodReach does not screen donors or verify medical history. Coordinate with your medical professional before proceeding.</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
