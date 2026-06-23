"use client";

import { cn } from "@/lib/utils";
import { StatusBadge, type UrgencyLevel } from "@/components/ui/StatusBadge";

interface ReviewCardProps {
  bloodGroup: string;
  units: number;
  hospitalName: string;
  urgencyLevel: UrgencyLevel;
  patientName: string;
  contactPhone: string;
  location: string;
  className?: string;
}

export function ReviewCard({
  bloodGroup,
  units,
  hospitalName,
  urgencyLevel,
  patientName,
  contactPhone,
  location,
  className,
}: ReviewCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-clay)] border border-[var(--color-base-200)] overflow-hidden",
        className
      )}
    >
      {/* Blood group hero row */}
      <div className="bg-[var(--color-blood-light)] border-b border-[rgba(214,58,58,0.12)] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-[0.625rem] font-mono font-bold text-[var(--color-blood)] uppercase tracking-[0.12em] mb-1">
            Blood Required
          </p>
          <p className="font-mono font-bold text-[2.75rem] text-[var(--color-blood)] leading-none">
            {bloodGroup}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.625rem] font-mono font-bold text-[var(--color-base-500)] uppercase tracking-[0.12em] mb-1">
            Units
          </p>
          <p className="font-mono font-bold text-[2.25rem] text-[var(--color-base-900)] leading-none">
            {units}
          </p>
        </div>
      </div>

      {/* Detail rows */}
      <div className="p-6 space-y-4">
        <ReviewRow label="Hospital" value={hospitalName} />
        <ReviewRow label="Patient" value={patientName} />
        <ReviewRow label="Contact" value={contactPhone} />
        <ReviewRow label="Area" value={location || "Via GPS"} />
        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-base-100)]">
          <span className="text-[0.625rem] font-mono font-bold text-[var(--color-base-400)] uppercase tracking-[0.12em]">
            Urgency
          </span>
          <StatusBadge urgency={urgencyLevel} />
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[0.625rem] font-mono font-bold text-[var(--color-base-400)] uppercase tracking-[0.12em] shrink-0 mt-0.5">
        {label}
      </span>
      <span className="font-semibold text-[0.9375rem] text-[var(--color-base-900)] text-right leading-snug">
        {value}
      </span>
    </div>
  );
}
