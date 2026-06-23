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

/* V2 urgency — pill badges, no solid color blobs */
const URGENCY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    IMMEDIATE: { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", label: "Critical" },
    TODAY:     { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", label: "Today" },
    SCHEDULED: { bg: "bg-[#F4F4F4]", text: "text-[#525252]",  label: "Scheduled" },
};

export function BentoRequestCard({ request, onClick, onAccept, isAccepting, isAccepted }: BentoRequestCardProps) {
    const urgency = URGENCY_STYLES[request.urgency_level ?? ""] ?? {
        bg: "bg-[#F4F4F4]",
        text: "text-[#525252]",
        label: "Standard",
    };

    return (
        <motion.article
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="group cursor-pointer"
            onClick={onClick}
            aria-label={`Blood request for ${request.blood_group} at ${request.hospital_name}`}
        >
            <div className="bg-white border border-[#ECECEC] rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-5 h-full flex flex-col transition-colors hover:border-[#D63A3A]">

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-1.5">
                        <span className={`w-fit px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${urgency.bg} ${urgency.text}`}>
                            {urgency.label}
                        </span>
                        <h3 className="text-[15px] font-semibold text-[#1E1E1E] leading-tight">
                            {request.patient_name}
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#F4F4F4] flex items-center justify-center border border-[#ECECEC] shrink-0 ml-3">
                        <span className="text-sm font-bold font-mono text-[#D63A3A]">{request.blood_group}</span>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#1E1E1E] truncate">{request.hospital_name}</p>
                            <p className="text-[11px] text-[#737373]">{request.city}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-2xl bg-[#FCFCFB] border border-[#ECECEC]">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Droplet className="w-3 h-3 text-[#D63A3A]" />
                                <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Units</span>
                            </div>
                            <p className="text-sm font-bold font-mono text-[#1E1E1E]">{request.units}</p>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-[#FCFCFB] border border-[#ECECEC]">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Clock className="w-3 h-3 text-[#9CA3AF]" />
                                <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Phase {request.escalation_phase || 1}</span>
                            </div>
                            <p className="text-[11px] font-semibold text-[#1E1E1E]">
                                {request.confirmed_count || 0}/{request.notified_count || 0} responded
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="mt-4 pt-4 border-t border-[#ECECEC]">
                    {isAccepted ? (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-[#15803D] mb-1 uppercase tracking-wide">You are helping</p>
                                <a
                                    href={`tel:${request.contact_phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs font-semibold text-[#1E1E1E] flex items-center gap-1.5"
                                >
                                    <Phone className="w-3 h-3" />
                                    {request.contact_phone}
                                </a>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                                <ChevronRight className="w-3.5 h-3.5 text-[#15803D]" />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAccept(e); }}
                            disabled={isAccepting}
                            className="w-full h-9 bg-[#1E1E1E] text-white rounded-[18px] text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors active:scale-[0.98]"
                        >
                            {isAccepting ? (
                                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
