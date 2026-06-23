"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Heart, Activity } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import type { ActivityEventType } from "@/types/database.types";

interface ActivityRow {
    id: string;
    user_id: string;
    request_id: string | null;
    event_type: ActivityEventType;
    description: string;
    created_at: string;
}

type StyleKey = "request" | "response" | "fulfillment";

const EVENT_STYLE_MAP: Record<ActivityEventType, StyleKey> = {
    request_created:      "request",
    request_cancelled:    "request",
    request_expired:      "request",
    donor_accepted:       "response",
    profile_completed:    "response",
    availability_changed: "response",
    notification_sent:    "response",
    request_fulfilled:    "fulfillment",
};

const STYLE_MAP: Record<StyleKey, {
    borderColor: string;
    iconBg: string;
    iconColor: string;
    icon: React.ComponentType<any>;
}> = {
    request: {
        borderColor: "#D63A3A",
        iconBg: "#FEE2E2",
        iconColor: "text-[#D63A3A]",
        icon: AlertTriangle,
    },
    response: {
        borderColor: "#22C55E",
        iconBg: "#DCFCE7",
        iconColor: "text-[#15803D]",
        icon: Heart,
    },
    fulfillment: {
        borderColor: "#22C55E",
        iconBg: "#D1FAE5",
        iconColor: "text-[#065F46]",
        icon: CheckCircle2,
    },
};

interface Props {
    userId?: string;
    limit?: number;
    compact?: boolean;
}

export function ActivityTimeline({ userId, limit = 20, compact = false }: Props) {
    const [activities, setActivities] = useState<ActivityRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            setLoading(true);
            try {
                let query = (supabaseClient as any)
                    .from("activities")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(limit);

                if (userId) query = query.eq("user_id", userId);

                const { data, error } = await query;
                if (!error && data) setActivities(data as ActivityRow[]);
            } catch { /* silently fail */ }
            finally { setLoading(false); }
        }
        fetch();
    }, [userId, limit]);

    if (loading) {
        return (
            <div className="bg-white rounded-[28px] border border-[#ECECEC] shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden h-full min-h-[200px]">
                <div className="flex items-center justify-between p-5 border-b border-[#ECECEC]">
                    <div className="h-3.5 w-20 bg-[#F4F4F4] rounded-full animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" />
                    <div className="h-5 w-12 bg-[#F4F4F4] rounded-full animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" />
                </div>
                <div className="flex-1 p-1">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 pl-4">
                            <div className="w-5 h-5 rounded-full bg-[#F4F4F4] animate-[skeleton-pulse_1.5s_ease-in-out_infinite] shrink-0" />
                            <div className="flex-1 h-3 bg-[#F4F4F4] rounded-full animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" style={{ width: `${70 + (i % 3) * 10}%` }} />
                            <div className="w-12 h-3 bg-[#F4F4F4] rounded-full animate-[skeleton-pulse_1.5s_ease-in-out_infinite] shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="bg-white rounded-[28px] border border-[#ECECEC] shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center h-full min-h-[200px] p-6">
                <div className="w-11 h-11 bg-[#F4F4F4] rounded-full flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <h3 className="text-[14px] font-semibold text-[#1E1E1E]">No activity yet</h3>
                <p className="text-xs text-[#737373] mt-1 max-w-[200px] leading-relaxed">
                    Your activity will appear here as you participate.
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-[28px] border border-[#ECECEC] shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden relative ${compact ? "" : "h-[360px]"}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 sticky top-0 bg-white z-10 border-b border-[#ECECEC]">
                <h3 className="text-[14px] font-semibold text-[#1E1E1E]">
                    {userId ? "Activity" : "Live Feed"}
                </h3>
                <div className="flex items-center gap-1.5 bg-[#DCFCE7] text-[#15803D] text-[10px] rounded-full px-2.5 py-1 font-semibold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                    Live
                </div>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <div className="pb-10">
                    {activities.map((item, i) => {
                        const styleKey = EVENT_STYLE_MAP[item.event_type] ?? "response";
                        const style = STYLE_MAP[styleKey];
                        const Icon = style.icon;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03, duration: 0.2 }}
                                className="flex items-start gap-3 px-5 py-3 hover:bg-[#FCFCFB] transition-colors border-l-[3px]"
                                style={{ borderLeftColor: style.borderColor }}
                            >
                                <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                    style={{ background: style.iconBg }}
                                >
                                    <Icon className={`w-3 h-3 ${style.iconColor}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] text-[#374151] leading-snug">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="text-[11px] text-[#9CA3AF] shrink-0 mt-0.5 whitespace-nowrap">
                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Fade gradient */}
            <div
                className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                style={{ background: "linear-gradient(transparent, white)" }}
            />
        </div>
    );
}
