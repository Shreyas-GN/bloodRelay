"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { updateProfileAction } from "@/app/actions/donor.actions";
import { logActivityAction } from "@/app/actions/activity.actions";
import type { User } from "@/types";

interface Props {
    profile: User | null;
    onToggle: () => void;
}

export function AvailabilityCard({ profile, onToggle }: Props) {
    const { user } = useUser();
    const [isAvailable, setIsAvailable] = useState(profile?.is_available_donor ?? false);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (!user || loading || !profile) return;
        setLoading(true);
        const next = !isAvailable;
        try {
            await updateProfileAction({ is_available_donor: next });
            await logActivityAction(
                "availability_changed",
                next ? "You turned on donor availability." : "You turned off donor availability."
            );
            setIsAvailable(next);
            onToggle();
        } catch {
            /* silently ignore */
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[28px] border border-[#ECECEC] shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-3 justify-between">
            <div>
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="relative w-3 h-3 shrink-0">
                        <span
                            className={`absolute inset-0 rounded-full transition-colors ${
                                isAvailable ? "bg-[#22C55E]" : "bg-[#D1D5DB]"
                            }`}
                        />
                        {isAvailable && (
                            <span className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-40" />
                        )}
                    </div>
                    <span className="text-[13px] font-semibold text-[#1E1E1E]">
                        {isAvailable ? "Active" : "Unavailable"}
                    </span>
                </div>
                <p className="text-xs text-[#737373] leading-relaxed">
                    {isAvailable
                        ? `Matching ${profile?.blood_group ?? ""} requests near you`
                        : "Not receiving requests right now"}
                </p>
            </div>

            <button
                onClick={handleToggle}
                disabled={loading || !profile}
                aria-label={isAvailable ? "Pause availability" : "Go active as donor"}
                className={`w-full h-[52px] rounded-[18px] text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isAvailable
                        ? "bg-[#F4F4F4] text-[#737373] hover:bg-[#ECECEC]"
                        : "bg-[#D63A3A] text-white hover:bg-[#C52F2F]"
                }`}
            >
                {loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                ) : isAvailable ? (
                    "Pause"
                ) : (
                    "Go Active"
                )}
            </button>
        </div>
    );
}
