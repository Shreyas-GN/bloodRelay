"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { Clock, Radio, Users } from "lucide-react";

interface MapOverlayCardProps {
  bloodGroup: string;
  status: string;
  radius: number;
  donorsNotified: number;
  elapsedTime: string;
  eta: string;
  hospital: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  searching:      { label: "Searching",       color: "text-[var(--color-warning)]",    dot: "bg-[var(--color-warning)] animate-pulse" },
  donor_accepted: { label: "Donor Accepted",  color: "text-[var(--color-success)]",    dot: "bg-[var(--color-success)]" },
  fulfilled:      { label: "Fulfilled",       color: "text-[var(--color-success)]",    dot: "bg-[var(--color-success)]" },
  cancelled:      { label: "Cancelled",       color: "text-[var(--color-text-muted)]", dot: "bg-[var(--color-text-muted)]" },
  expired:        { label: "Expired",         color: "text-[var(--color-text-muted)]", dot: "bg-[var(--color-text-muted)]" },
};

export function MapOverlayCard({
  bloodGroup, status, radius, donorsNotified, elapsedTime, eta, hospital,
}: MapOverlayCardProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.searching;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="hidden md:block absolute top-4 left-4 z-20 w-[220px]"
      role="complementary"
      aria-label="Mission status"
    >
      <div
        className="bg-white rounded-[var(--radius-card)] overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 1px 0 rgba(0,0,0,0.04)" }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-[var(--color-border-subtle)]">
          {/* Status */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} aria-hidden="true" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>

          {/* Blood group */}
          <div className="flex items-end justify-between">
            <span
              className="font-mono font-black leading-none text-[var(--color-text-primary)]"
              style={{ fontSize: "2.25rem" }}
              aria-label={`Blood group ${bloodGroup}`}
            >
              {bloodGroup}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] mb-1 text-right leading-tight max-w-[90px] truncate">
              {hospital}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 space-y-2.5">
          <OverlayStat icon={<Radio className="w-3 h-3" />} label="Search radius" value={`${radius} km`} />
          <OverlayStat icon={<Users className="w-3 h-3" />} label="Donors notified" value={String(donorsNotified)} />
          <OverlayStat icon={<Clock className="w-3 h-3" />} label="Elapsed" value={elapsedTime} />
        </div>

        {/* ETA footer */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between py-2 px-3 bg-[var(--color-border-subtle)] rounded-[10px]">
            <span className="text-[10px] text-[var(--color-text-muted)]">ETA</span>
            <span className="font-mono font-bold text-sm text-[var(--color-text-primary)]">{eta}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OverlayStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
        {icon}
        <span className="text-[11px] text-[var(--color-text-secondary)]">{label}</span>
      </div>
      <span className="font-mono font-bold text-sm text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}
