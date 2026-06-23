"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { slideUpFade } from "@/lib/motion";
import type { LucideIcon } from "lucide-react";

interface ImpactCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
}

export function ImpactCard({ label, value, icon: Icon }: ImpactCardProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (value === 0) {
            setCount(0);
            return;
        }
        const duration = 600;
        const startTime = Date.now();
        let raf: number;

        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * value));
            if (progress < 1) {
                raf = requestAnimationFrame(tick);
            }
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value]);

    return (
        <motion.div
            variants={slideUpFade}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-[28px] border border-[#ECECEC] shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-5 flex flex-col justify-between min-h-[104px]"
        >
            <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider leading-tight">
                    {label}
                </p>
                <div className="w-7 h-7 rounded-xl bg-[#F4F4F4] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#737373]" />
                </div>
            </div>
            <p className="text-[2rem] font-bold font-mono text-[#1E1E1E] tracking-tight leading-none">
                {count}
            </p>
        </motion.div>
    );
}
