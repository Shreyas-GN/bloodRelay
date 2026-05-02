"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useProfile } from '@/context/AuthContext';
import { registerForPushNotifications } from '@/lib/firebase/messaging';
import { Bell, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationPrompt() {
    const { user } = useUser();
    const { profile } = useProfile();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Only show if:
        // 1. User is logged in
        // 2. User is a donor
        // 3. Browser supports notifications
        // 4. We don't already have an FCM token
        // 5. Permission hasn't been denied yet
        if (
            user && 
            profile?.is_available_donor && 
            !profile?.fcm_token && 
            'Notification' in window && 
            Notification.permission === 'default'
        ) {
            const timer = setTimeout(() => setShow(true), 3000); // Wait 3s before prompting
            return () => clearTimeout(timer);
        }
    }, [user, profile]);

    const handleEnable = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = await registerForPushNotifications(user.id);
            if (token) {
                setSuccess(true);
                setTimeout(() => setShow(false), 2000);
            } else {
                setShow(false); // They probably denied it
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:w-[400px] z-[100]"
                >
                    <div className="bg-white dark:bg-zinc-900 border-2 border-crimson rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 relative overflow-hidden">
                        {/* Background Accent */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-crimson/5 rounded-full" />
                        
                        <button 
                            onClick={() => setShow(false)}
                            className="absolute top-4 right-4 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-crimson/10 flex items-center justify-center flex-shrink-0">
                                {success ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                ) : (
                                    <Bell className="w-6 h-6 text-crimson animate-bounce" />
                                )}
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="font-bold text-zinc-900 dark:text-white">
                                    {success ? 'Notifications Enabled!' : 'Enable Emergency Alerts'}
                                </h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {success 
                                        ? 'You will now receive instant push notifications for matching blood requests.' 
                                        : 'Don\'t miss life-critical requests. Get notified instantly when someone nearby needs your blood type.'}
                                </p>
                            </div>
                        </div>

                        {!success && (
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleEnable}
                                    disabled={loading}
                                    className="flex-1 py-2.5 bg-crimson text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Requesting...' : 'Enable Now'}
                                </button>
                                <button
                                    onClick={() => setShow(false)}
                                    className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                                >
                                    Later
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
