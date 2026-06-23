"use client";

import { motion } from "framer-motion";
import { pulseBreath } from "@/lib/motion";

interface Props {
  status: string;
  bloodGroup: string;
  elapsedTime: string;
  radius: number;
  donorsNotified: number;
  patientName: string;
  hospital: string;
}

const STATUS_CONFIG: Record<string, { label: string; textColor: string; dotColor: string }> = {
  searching:      { label: "SEARCHING",       textColor: "text-[var(--color-warning)]",        dotColor: "bg-[var(--color-warning)]" },
  donor_accepted: { label: "DONOR ACCEPTED",   textColor: "text-[var(--color-success)]",        dotColor: "bg-[var(--color-success)]" },
  fulfilled:      { label: "FULFILLED",        textColor: "text-[var(--color-success)]",        dotColor: "bg-[var(--color-success)]" },
  cancelled:      { label: "CANCELLED",        textColor: "text-[var(--color-text-muted)]",     dotColor: "bg-[var(--color-text-muted)]" },
  expired:        { label: "EXPIRED",          textColor: "text-[var(--color-text-muted)]",     dotColor: "bg-[var(--color-text-muted)]" },
};

const ETA: Record<string, string> = {
  searching:      "~12 min",
  donor_accepted: "~8 min",
  fulfilled:      "Arrived",
  cancelled:      "—",
  expired:        "—",
};

export function MissionStatusCard({
  status, bloodGroup, elapsedTime, radius, donorsNotified, patientName, hospital,
}: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.searching;
  const isSearching = status === "searching";
  const eta = ETA[status] ?? "—";

  const metrics = [
    { label: "ELAPSED",  value: elapsedTime },
    { label: "RADIUS",   value: `${radius}km` },
    { label: "NOTIFIED", value: String(donorsNotified) },
    { label: "ETA",      value: eta },
  ];

  return (
    <motion.div
      variants={isSearching ? pulseBreath : undefined}
      initial={isSearching ? "rest" : false}
      animate={isSearching ? "pulse" : false}
      className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden"
    >
      <div className="p-6 sm:p-10">
        {/* Status indicator */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotColor}${isSearching ? " animate-pulse" : ""}`}
            aria-hidden="true"
          />
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] font-mono ${cfg.textColor}`}>
            {cfg.label}
          </span>
        </div>

        {/* Blood group — dominant */}
        <div className="mb-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)] mb-2">
            Blood Group
          </p>
          <span
            className="font-mono font-black leading-none tracking-tight text-[var(--color-text-primary)]"
            style={{ fontSize: "clamp(4rem, 14vw, 7rem)" }}
            aria-label={`Blood group ${bloodGroup}`}
          >
            {bloodGroup}
          </span>
        </div>

        {/* Patient + hospital */}
        <div className="mb-8">
          <p className="text-base font-semibold text-[var(--color-text-secondary)]">{patientName}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{hospital}</p>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-3 pt-5 border-t border-[var(--color-border-subtle)]">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1.5">
                {m.label}
              </p>
              <p className="font-mono text-lg sm:text-xl font-bold text-[var(--color-text-primary)] leading-none">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
