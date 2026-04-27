"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Heart } from "lucide-react";

interface ActivityItem {
    id: string;
    type: "request" | "response" | "fulfillment";
    user: string;
    action: string;
    target: string;
    time: string;
    bloodGroup: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
    { id: "1", type: "request", user: "Rahul S.", action: "requested", target: "Blood", time: "2m ago", bloodGroup: "O+" },
    { id: "2", type: "response", user: "Priya K.", action: "is responding to", target: "Amit V.", time: "15m ago", bloodGroup: "B+" },
    { id: "3", type: "fulfillment", user: "Suresh M.", action: "donated to", target: "City Hospital", time: "1h ago", bloodGroup: "AB-" },
    { id: "4", type: "request", user: "Ananya R.", action: "requested", target: "Blood", time: "3h ago", bloodGroup: "B-" },
];

const STYLE_MAP = {
    request: {
        border: "border-l-[4px] border-[var(--color-blood)]",
        iconBg: "bg-[var(--color-blood-light)]",
        iconColor: "text-[var(--color-blood)]",
        icon: AlertTriangle,
        bgClasses: "bg-white relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[var(--color-blood-light)]/20 before:to-transparent"
    },
    response: {
        border: "border-l-[4px] border-emerald-500",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        icon: Heart,
        bgClasses: "bg-white"
    },
    fulfillment: {
        border: "border-l-[4px] border-[var(--color-safe)]",
        iconBg: "bg-[var(--color-safe-light)]",
        iconColor: "text-[var(--color-safe)]",
        icon: CheckCircle2,
        bgClasses: "bg-white"
    },
};

export function ActivityTimeline() {
    if (MOCK_ACTIVITY.length === 0) {
        return (
            <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-clay)] flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <div className="w-[48px] h-[48px] bg-[var(--color-safe-light)] rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-[var(--color-safe)]" />
                </div>
                <h3 className="font-display font-bold text-[1.0625rem] text-[var(--color-base-900)]">You're all caught up!</h3>
                <p className="text-[0.875rem] text-[var(--color-base-500)] font-sans mt-1">No recent activity.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-clay)] flex flex-col h-[360px] overflow-hidden relative">
            <div className="flex items-center justify-between p-[24px] pb-[16px] sticky top-0 bg-white z-10 border-b border-[var(--color-base-200)]">
                <h3 className="font-display font-bold text-[0.9375rem] text-[var(--color-base-900)]">Live Pulse</h3>
                <div className="bg-[var(--color-safe-light)] text-[var(--color-safe)] font-mono text-[0.625rem] rounded-[var(--radius-pill)] px-[10px] py-[4px] font-bold flex items-center gap-1.5 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-safe)] animate-pulse" />
                    LIVE
                </div>
            </div>

            <div className="flex-1 overflow-y-scroll relative" style={{ scrollbarWidth: "none" }}>
                <div className="space-y-[2px] pb-[40px]">
                    {MOCK_ACTIVITY.map((item, i) => {
                        const style = STYLE_MAP[item.type];
                        const Icon = style.icon;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05, ease: "easeOut", duration: 0.3 }}
                                className={`flex items-start gap-[12px] p-[12px_16px] hover:bg-[var(--color-base-50)] transition-colors ${style.border} ${style.bgClasses} group`}
                            >
                                <div className={`w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 mt-[2px] ${style.iconBg}`}>
                                    <Icon className={`w-3 h-3 ${style.iconColor}`} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <p className="text-[0.9375rem] font-sans leading-snug">
                                        <span className="font-bold text-[var(--color-base-900)]">{item.user}</span>{" "}
                                        <span className="text-[var(--color-base-500)]">{item.action}</span>{" "}
                                        <span className="inline-flex items-center justify-center bg-[var(--color-warn-light)] text-[var(--color-warn)] font-mono text-[0.625rem] font-bold px-[6px] py-[1px] rounded-[4px] mx-1 uppercase">
                                            {item.bloodGroup}
                                        </span>
                                        <span className="text-[var(--color-base-500)]">{item.target}</span>
                                    </p>
                                </div>

                                <div className="font-mono text-[0.75rem] text-[var(--color-base-500)] shrink-0 mt-[2px]">
                                    {item.time}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Fade Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-[40px] pointer-events-none" style={{ background: "linear-gradient(transparent, white)" }} />
        </div>
    );
}
