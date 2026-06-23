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
        'CANCELLED': { label: 'Cancelled', color: 'text-[var(--color-base-500)] bg-[var(--color-base-50)] border-[var(--color-base-200)]' }
    };
    
    const statusConfig = statusMap[response.status] || statusMap['ACCEPTED'];
    const isActive = response.status !== 'CANCELLED';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${isActive ? 'bg-white shadow-sm border-[var(--color-base-200)]' : 'bg-[var(--color-base-50)] border-[var(--color-base-100)] opacity-60'} flex flex-col gap-3`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-[var(--color-base-900)]">{response.profiles?.full_name || "A Donor"}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                        {response.distance_meters && (
                            <span className="text-xs font-medium text-[var(--color-base-500)] flex items-center gap-1">
                                <Navigation className="w-3 h-3" /> {formatDistance(response.distance_meters)}
                            </span>
                        )}
                    </div>
                </div>
                
                {response.profiles?.blood_group && (
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-blood-light)] text-[var(--color-blood)] flex items-center justify-center font-bold text-sm">
                        {response.profiles.blood_group}
                    </div>
                )}
            </div>

            {isActive && isRequester && (
                <div className="pt-3 border-t border-[var(--color-base-100)] flex gap-2">
                    {showContact ? (
                        <a
                            href={`tel:${response.profiles?.phone}`}
                            className="flex-1 py-2 bg-[var(--color-base-900)] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2"
                        >
                            <Phone className="w-4 h-4" /> {response.profiles?.phone}
                        </a>
                    ) : (
                        <button
                            onClick={() => setShowContact(true)}
                            className="flex-1 py-2 bg-[var(--color-base-100)] text-[var(--color-base-900)] text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[var(--color-base-200)] transition-colors"
                        >
                            <Phone className="w-4 h-4" /> Reveal Contact
                        </button>
                    )}

                    {response.distance_meters && (
                        <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg flex flex-col items-center justify-center shrink-0 min-w-[70px]">
                            <span className="text-[10px] font-bold uppercase">ETA</span>
                            <span className="text-xs font-bold font-mono">{estimateETA(response.distance_meters)}m</span>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
