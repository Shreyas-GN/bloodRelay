"use client";

import { Users, TrendingUp, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export function CommunityAnalytics() {
    return (
        <div className="bg-zinc-900 border-[1.5px] border-zinc-800 rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-clay)] flex flex-col h-full relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="font-display font-bold text-[1.125rem] tracking-tight">Community Analytics</h3>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-blood)] animate-pulse" />
                    Network Pulse
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
                {/* Metric 1 */}
                <div className="flex flex-col justify-end p-4 rounded-[16px] bg-zinc-800/50 border border-zinc-700/50 min-h-[120px]">
                    <div className="mb-auto">
                        <Users className="w-4 h-4 text-emerald-400 mb-2" />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Registered Donors</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-display font-bold text-2xl text-white">1,248</span>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="flex flex-col justify-end p-4 rounded-[16px] bg-zinc-800/50 border border-zinc-700/50 min-h-[120px]">
                    <div className="mb-auto">
                        <MapPin className="w-4 h-4 text-[var(--color-blood)] mb-2" />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Local Demand</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-display font-bold text-2xl text-white">High</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[var(--color-blood)] w-[85%]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
