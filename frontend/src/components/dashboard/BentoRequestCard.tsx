"use client";

import { motion } from "framer-motion";
import { MapPin, Droplet, Clock, Phone, ChevronRight } from "lucide-react";
import type { BloodRequest } from "@/types";

interface BentoRequestCardProps {
    request: BloodRequest;
    onClick: () => void;
    onAccept: (e: React.MouseEvent) => void;
    isAccepting: boolean;
    isAccepted: boolean;
}

const URGENCY_STYLES: Record<string, { bg: string, text: string, label: string }> = {
    IMMEDIATE: { bg: "bg-rose-500", text: "text-white", label: "Critical" },
    TODAY: { bg: "bg-amber-500", text: "text-zinc-950", label: "Today" },
    SCHEDULED: { bg: "bg-blue-500", text: "text-white", label: "Scheduled" },
};

export function BentoRequestCard({ request, onClick, onAccept, isAccepting, isAccepted }: BentoRequestCardProps) {
    const urgency = URGENCY_STYLES[request.urgency_level ?? ""] ?? { bg: "bg-zinc-100", text: "text-zinc-900", label: "Standard" };

    return (
        <motion.article
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-item group cursor-pointer"
            onClick={onClick}
            aria-label={`Emergency blood request for ${request.blood_group} at ${request.hospital_name}`}
        >
            <div className="clay-card clay-card-hover p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${urgency.bg} ${urgency.text}`}>
                            {urgency.label}
                        </span>
                        <h3 className="font-extrabold text-xl tracking-tighter text-zinc-900 dark:text-white leading-none mt-1">
                            {request.patient_name}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            {request.requester_name || "Anonymous"} • {request.metadata?.relation || "Unspecified"}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                        <span className="text-lg font-black font-mono text-crimson">{request.blood_group}</span>
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate tracking-tight">{request.hospital_name}</p>
                            <p className="text-[10px] text-zinc-500 font-medium">{request.city}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-1">
                                <Droplet className="w-3 h-3 text-crimson" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Units</span>
                            </div>
                            <p className="text-sm font-black font-mono text-zinc-900 dark:text-white">{request.units}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phase {request.escalation_phase || 1}</span>
                            </div>
                            <p className="text-[11px] font-bold text-zinc-900 dark:text-white">
                                {request.confirmed_count || 0} / {request.notified_count || 0} Responded
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/5">
                    {isAccepted ? (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">You are helping</p>
                                <a href={`tel:${request.contact_phone}`} onClick={(e) => e.stopPropagation()} className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                    <Phone className="w-3 h-3" /> {request.contact_phone}
                                </a>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <ChevronRight className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAccept(e); }}
                            disabled={isAccepting}
                            className="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-sm tracking-tight clay-button-hover shadow-clay flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isAccepting ? (
                                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            ) : (
                                "I can help"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
