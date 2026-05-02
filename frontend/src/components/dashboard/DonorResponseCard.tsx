"use client";

import { Phone, CheckCircle, Navigation, Clock } from 'lucide-react';
import { formatDistance, estimateETA } from '@/lib/geolocation';
import type { DonorResponse } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
    response: DonorResponse;
    isRequester: boolean;
}

export function DonorResponseCard({ response, isRequester }: Props) {
    const [showContact, setShowContact] = useState(false);
    
    // Status mapping
    const statusMap = {
        'ACCEPTED': { label: 'Responded', color: 'text-amber-600 bg-amber-50 border-amber-200' },
        'CONFIRMED': { label: 'Confirmed', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        'ARRIVED': { label: 'Arrived', color: 'text-blue-600 bg-blue-50 border-blue-200' },
        'CANCELLED': { label: 'Cancelled', color: 'text-zinc-500 bg-zinc-50 border-zinc-200' }
    };
    
    const statusConfig = statusMap[response.status] || statusMap['ACCEPTED'];
    const isActive = response.status !== 'CANCELLED';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${isActive ? 'bg-white shadow-sm border-zinc-200 dark:bg-zinc-900 dark:border-white/10' : 'bg-zinc-50 border-zinc-100 opacity-60 dark:bg-zinc-900/50 dark:border-white/5'} flex flex-col gap-3`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">{response.profiles?.full_name || "A Donor"}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                        {response.distance_meters && (
                            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                                <Navigation className="w-3 h-3" /> {formatDistance(response.distance_meters)}
                            </span>
                        )}
                    </div>
                </div>
                
                {response.profiles?.blood_group && (
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-crimson flex items-center justify-center font-bold text-sm">
                        {response.profiles.blood_group}
                    </div>
                )}
            </div>

            {isActive && isRequester && (
                <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex gap-2">
                    {showContact ? (
                        <a 
                            href={`tel:${response.profiles?.phone}`}
                            className="flex-1 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-lg flex items-center justify-center gap-2"
                        >
                            <Phone className="w-4 h-4" /> {response.profiles?.phone}
                        </a>
                    ) : (
                        <button 
                            onClick={() => setShowContact(true)}
                            className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <Phone className="w-4 h-4" /> Reveal Contact
                        </button>
                    )}
                    
                    {response.distance_meters && (
                        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg flex flex-col items-center justify-center shrink-0 min-w-[70px]">
                            <span className="text-[10px] font-bold uppercase">ETA</span>
                            <span className="text-xs font-bold font-mono">{estimateETA(response.distance_meters)}m</span>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
