"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { DonorService } from '@/services/donor.service';
import { motion } from 'framer-motion';
import { Clock, Heart, AlertCircle } from 'lucide-react';

interface DonorAvailabilityToggleProps {
    initialAvailable: boolean;
    cooldownUntil?: string | null;
    lastDonationDate?: string | null;
    onToggle?: (newStatus: boolean) => void;
}

export function DonorAvailabilityToggle({ 
    initialAvailable, 
    cooldownUntil, 
    lastDonationDate,
    onToggle 
}: DonorAvailabilityToggleProps) {
    const { user } = useUser();
    const [isAvailable, setIsAvailable] = useState(initialAvailable);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if donor is in cooldown
    const inCooldown = cooldownUntil && new Date(cooldownUntil) > new Date();
    const cooldownDate = cooldownUntil ? new Date(cooldownUntil) : null;
    const daysRemaining = cooldownDate 
        ? Math.ceil((cooldownDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) 
        : 0;

    const handleToggle = async () => {
        if (!user) return;
        if (inCooldown) return; // Block override during cooldown

        setLoading(true);
        setError(null);

        try {
            const newStatus = !isAvailable;
            await DonorService.updateProfile(user.id, {
                is_available_donor: newStatus
            });
            setIsAvailable(newStatus);
            onToggle?.(newStatus);
        } catch (err: any) {
            setError(err.message || 'Failed to update availability');
        } finally {
            setLoading(false);
        }
    };

    // Cooldown state
    if (inCooldown) {
        return (
            <div className="p-5 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="font-bold text-zinc-900 dark:text-white">Donation Cooldown Active</p>
                        <p className="text-sm text-zinc-500">Your body is recovering. Rest up!</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 space-y-1.5">
                    {lastDonationDate && (
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Last Donated</span>
                            <span className="font-bold text-zinc-900 dark:text-white">
                                {new Date(lastDonationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Available Again</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                            {cooldownDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Days Remaining</span>
                        <span className="font-bold text-zinc-900 dark:text-white">{daysRemaining} days</span>
                    </div>
                </div>

                {/* Cooldown Progress Bar */}
                <div className="space-y-1">
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                        <div
                            className="bg-amber-500 h-2 rounded-full transition-all"
                            style={{
                                width: `${Math.max(5, 100 - (daysRemaining / 90) * 100)}%`
                            }}
                        />
                    </div>
                    <p className="text-xs text-zinc-400">Recovery progress</p>
                </div>

                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Donation cooldown is enforced to protect your health (90-day minimum rest period).
                </p>
            </div>
        );
    }

    // Normal toggle state
    return (
        <div className="space-y-4">
            <motion.div
                animate={{ 
                    backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                    borderColor: isAvailable ? 'rgb(16, 185, 129)' : 'rgb(63, 63, 70)'
                }}
                className="p-5 rounded-2xl border-2 transition-colors"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isAvailable ? 'bg-emerald-500/10' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                            <Heart className={`w-5 h-5 transition-colors ${isAvailable ? 'text-emerald-500' : 'text-zinc-400'}`} />
                        </div>
                        <div>
                            <p className="font-bold text-zinc-900 dark:text-white">Available to Donate</p>
                            <p className="text-xs text-zinc-500">
                                {isAvailable 
                                    ? 'You\'ll receive nearby emergency alerts' 
                                    : 'Turn on to start receiving requests'}
                            </p>
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                        onClick={handleToggle}
                        disabled={loading}
                        role="switch"
                        aria-checked={isAvailable}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 ${isAvailable ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                    >
                        <motion.span
                            animate={{ x: isAvailable ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
                        />
                    </button>
                </div>

                {isAvailable && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center gap-2"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Live — You're visible to the emergency system
                        </span>
                    </motion.div>
                )}
            </motion.div>

            {error && (
                <p className="text-sm text-rose-500 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
            )}

            {lastDonationDate && (
                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Last donated: {new Date(lastDonationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            )}
        </div>
    );
}
