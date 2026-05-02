"use client";

import { motion } from 'framer-motion';
import { AlertCircle, Clock, Users, ChevronRight, Activity, CheckCircle } from 'lucide-react';
import type { BloodRequest, DonorResponse } from '@/types';
import { DonorResponseCard } from './DonorResponseCard';

interface Props {
    request: BloodRequest;
    responses: DonorResponse[];
    isRequester: boolean;
}

export function EmergencyTracker({ request, responses, isRequester }: Props) {
    const phase = request.escalation_phase || 1;
    const notified = request.notified_count || 0;
    
    // Sort responses: active first, then chronological
    const sortedResponses = [...responses].sort((a, b) => {
        if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return 1;
        if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const activeCount = sortedResponses.filter(r => r.status !== 'CANCELLED').length;
    
    // Calculate progress (visual only, for ring animation)
    // Assuming target is 3 active donors
    const progress = Math.min((activeCount / 3) * 100, 100);

    return (
        <div className="bg-zinc-900 rounded-[2rem] p-6 text-white shadow-2xl border border-zinc-800 relative overflow-hidden">
            {/* Background animated gradient pulse */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-crimson/20 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-widest">Live Tracker</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold font-mono">
                        <Activity className="w-3.5 h-3.5 text-crimson" /> Phase {phase}
                    </div>
                </div>

                {/* Primary Metric Ring */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-20 h-20 shrink-0">
                        {/* Background track */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                            {/* Progress */}
                            <motion.circle 
                                initial={{ strokeDasharray: "0 251" }}
                                animate={{ strokeDasharray: `${(progress / 100) * 251} 251` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                className="text-crimson transition-all duration-1000 ease-out" 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-black">{activeCount}</span>
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-bold mb-1">
                            {activeCount > 0 ? `${activeCount} Donors Found` : 'Searching for Donors...'}
                        </h2>
                        <p className="text-sm text-zinc-400">
                            {notified > 0 ? `Alerted ${notified} nearby people matching ${request.blood_group}` : `Scanning proximity network for ${request.blood_group}`}
                        </p>
                    </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertCircle className="w-4 h-4 text-zinc-300" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Request Broadcasted</p>
                            <p className="text-xs text-zinc-500 mt-0.5">Radius expanded based on phase {phase} protocol</p>
                        </div>
                    </div>
                    {activeCount > 0 && (
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 relative">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"
                                />
                                <CheckCircle className="w-4 h-4 text-emerald-400 relative z-10" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-400">Responses Received</p>
                                <p className="text-xs text-emerald-400/60 mt-0.5">Donors are viewing the request details</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Donor Cards */}
                {sortedResponses.length > 0 && (
                    <div className="space-y-3 border-t border-white/10 pt-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Live Responses</p>
                        {sortedResponses.map(resp => (
                            <DonorResponseCard 
                                key={resp.id} 
                                response={resp} 
                                isRequester={isRequester} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
