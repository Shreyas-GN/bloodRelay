"use client";

import { motion } from "framer-motion";
import { slideDownFade } from "@/lib/motion";

interface Props {
  bloodGroup: string;
  status: string;
  radius: number;
  donorsNotified: number;
  elapsedTime: string;
}

const STATUS_LABEL: Record<string, string> = {
  searching:      "Searching",
  donor_accepted: "Accepted",
  fulfilled:      "Fulfilled",
  cancelled:      "Cancelled",
  expired:        "Expired",
};

const DOT_COLOR: Record<string, string> = {
  searching:      "bg-[var(--color-warning)]",
  donor_accepted: "bg-[var(--color-success)]",
  fulfilled:      "bg-[var(--color-success)]",
  cancelled:      "bg-[var(--color-text-muted)]",
  expired:        "bg-[var(--color-text-muted)]",
};

export function EmergencyBar({ bloodGroup, status, radius, donorsNotified, elapsedTime }: Props) {
  const label    = STATUS_LABEL[status] ?? "Active";
  const dotColor = DOT_COLOR[status] ?? "bg-[var(--color-warning)]";
  const isLive   = status === "searching" || status === "donor_accepted";

  return (
    <motion.div
      variants={slideDownFade}
      initial="hidden"
      animate="visible"
      role="status"
      aria-label={`Emergency bar: ${bloodGroup} blood, status ${label}`}
      className="sticky top-14 z-40 bg-[var(--color-surface-zinc)]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-11 flex items-center gap-0 overflow-x-auto"
           style={{ scrollbarWidth: "none" }}>

        {/* Blood group pill */}
        <span className="shrink-0 bg-[var(--color-primary)] text-white text-[11px] font-mono font-black px-2.5 py-1 rounded-lg leading-none mr-3">
          {bloodGroup}
        </span>

        <Divider />

        {/* Status */}
        <div className="shrink-0 flex items-center gap-1.5 px-3">
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor}${isLive ? " animate-pulse" : ""}`} aria-hidden="true" />
          <span className="text-[11px] font-semibold text-white/80">{label}</span>
        </div>

        <Divider />

        {/* Radius */}
        <BarStat label="Radius" value={`${radius}km`} />

        <Divider />

        {/* Donors */}
        <BarStat label="Notified" value={String(donorsNotified)} />

        <Divider />

        {/* Elapsed */}
        <BarStat label="Elapsed" value={elapsedTime} />
      </div>
    </motion.div>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-white/10 shrink-0" aria-hidden="true" />;
}

function BarStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="shrink-0 flex items-center gap-1.5 px-3">
      <span className="text-[11px] text-white/50">{label}</span>
      <span className="text-[11px] font-mono font-bold text-white">{value}</span>
    </div>
  );
}
