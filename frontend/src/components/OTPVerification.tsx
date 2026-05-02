"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, RefreshCw, Phone } from "lucide-react";

interface OTPVerificationProps {
    phone: string;
    onVerified: () => void;
    onBack?: () => void;
}

export function OTPVerification({ phone, onVerified, onBack }: OTPVerificationProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Auto-send OTP on mount
    useEffect(() => {
        sendOTP();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const sendOTP = async () => {
        setSending(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
        } catch (e: any) {
            setError(e.message || 'Failed to send OTP');
        } finally {
            setSending(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setCanResend(false);
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        await sendOTP();
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Enter all 6 digits');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp: code })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSuccess(true);
            setTimeout(onVerified, 1000);
        } catch (e: any) {
            setError(e.message || 'Verification failed');
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Auto-verify when all 6 digits entered
    useEffect(() => {
        if (otp.every(d => d !== '') && !loading) {
            handleVerify();
        }
    }, [otp]);

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-crimson/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-crimson" />
                </div>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Verify your number</h2>
                <p className="text-sm text-zinc-500">
                    We sent a 6-digit code via Telegram to<br />
                    <span className="font-bold text-zinc-900 dark:text-white">{phone}</span>
                </p>
            </div>

            {/* OTP Boxes */}
            <div className="flex gap-3" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        disabled={loading || success}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
                            ${success
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                : digit
                                    ? 'border-crimson bg-crimson/5 text-zinc-900 dark:text-white'
                                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white'
                            } focus:border-crimson focus:ring-2 focus:ring-crimson/20`}
                    />
                ))}
            </div>

            {/* Success / Error */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Verified! Continuing...
                    </motion.div>
                )}
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-rose-600 dark:text-rose-400 font-medium text-center"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Verify Button */}
            {!success && (
                <button
                    onClick={handleVerify}
                    disabled={otp.some(d => !d) || loading}
                    className="w-full py-3.5 bg-crimson text-white font-bold rounded-xl transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100 shadow-[0_8px_30px_rgba(192,57,43,0.3)]"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Verifying...
                        </span>
                    ) : 'Confirm Code'}
                </button>
            )}

            {/* Resend */}
            <div className="text-sm text-zinc-500 text-center">
                {canResend ? (
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="text-crimson font-semibold hover:underline flex items-center gap-1 mx-auto"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {sending ? 'Sending...' : 'Resend Code'}
                    </button>
                ) : (
                    <span>Resend in <span className="font-bold text-zinc-700 dark:text-zinc-300">{countdown}s</span></span>
                )}
            </div>

            {onBack && (
                <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
                    ← Change number
                </button>
            )}
        </div>
    );
}
