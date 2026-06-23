"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { hoverScale } from "@/lib/motion";

interface BloodGroupCardProps {
  group: string;
  isSelected: boolean;
  onClick: () => void;
}

export function BloodGroupCard({ group, isSelected, onClick }: BloodGroupCardProps) {
  return (
    <motion.button
      onClick={onClick}
      {...hoverScale}
      animate={isSelected ? { y: -3 } : { y: 0 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex items-center justify-center",
        "h-[100px] rounded-[20px] border-2 transition-colors duration-[150ms]",
        "font-mono font-bold text-[1.625rem] select-none cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blood)] focus-visible:ring-offset-2",
        isSelected
          ? "bg-[var(--color-blood-light)] border-[var(--color-blood)] text-[var(--color-blood)] shadow-[0_6px_24px_rgba(214,58,58,0.18)]"
          : "bg-white border-[var(--color-base-200)] text-[var(--color-base-900)] hover:border-[var(--color-base-400)] hover:shadow-[var(--shadow-clay)]"
      )}
      aria-pressed={isSelected}
    >
      {group}
      {isSelected && (
        <motion.div
          layoutId="blood-group-selected"
          className="absolute inset-0 rounded-[18px] ring-2 ring-[var(--color-blood)] ring-offset-0"
          initial={false}
        />
      )}
    </motion.button>
  );
}
