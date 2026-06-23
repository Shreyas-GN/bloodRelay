"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Hospital {
  id: string;
  name: string;
  city: string;
  distance: string;
}

interface HospitalResultCardProps {
  hospital: Hospital;
  isSelected: boolean;
  onClick: () => void;
}

export function HospitalResultCard({
  hospital,
  isSelected,
  onClick,
}: HospitalResultCardProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn(
        "w-full p-4 rounded-[var(--radius-card)] border-2 text-left transition-all duration-[150ms]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blood)] focus-visible:ring-offset-2",
        isSelected
          ? "bg-[var(--color-blood-light)] border-[var(--color-blood)] shadow-[0_4px_16px_rgba(214,58,58,0.12)]"
          : "bg-white border-[var(--color-base-200)] hover:border-[var(--color-base-300)] hover:shadow-[var(--shadow-clay)]"
      )}
    >
      <p className="font-bold text-[1rem] text-[var(--color-base-900)] leading-tight">
        {hospital.name}
      </p>
      <div className="flex items-center gap-3 mt-1.5">
        <span className="flex items-center gap-1 text-[0.8125rem] text-[var(--color-base-500)]">
          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {hospital.city}
        </span>
        <span className="font-mono text-[0.75rem] font-bold text-[var(--color-base-400)]">
          {hospital.distance}
        </span>
      </div>
    </button>
  );
}
