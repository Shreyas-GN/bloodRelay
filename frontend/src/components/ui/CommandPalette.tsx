"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Droplet, MapPin, Heart, X, CornerDownLeft } from "lucide-react";
import { scaleIn } from "@/lib/motion";

/* ── Static data ─────────────────────────────────────────── */
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const HOSPITALS = [
    { name: "Manipal Hospital", city: "Bangalore" },
    { name: "AIIMS", city: "New Delhi" },
    { name: "Apollo Hospital", city: "Chennai" },
    { name: "Fortis Hospital", city: "Mumbai" },
    { name: "Narayana Health", city: "Bangalore" },
    { name: "Max Super Speciality", city: "Gurugram" },
    { name: "Lilavati Hospital", city: "Mumbai" },
    { name: "KEM Hospital", city: "Pune" },
];

const CITIES = [
    "Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad",
    "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat",
];

interface CommandItem {
    id: string;
    type: "action" | "blood" | "hospital" | "city";
    label: string;
    sub?: string;
    href?: string;
    action?: () => void;
}

function buildItems(router: ReturnType<typeof useRouter>): CommandItem[] {
    return [
        /* ── Actions ── */
        {
            id: "new-request",
            type: "action",
            label: "New blood request",
            sub: "Post an emergency request",
            href: "/request/wizard",
        },
        {
            id: "dashboard",
            type: "action",
            label: "Go to dashboard",
            sub: "View live requests and your stats",
            href: "/dashboard",
        },
        {
            id: "profile",
            type: "action",
            label: "View profile",
            sub: "Blood group, availability, donation history",
            href: "/profile",
        },
        {
            id: "notifications",
            type: "action",
            label: "Notifications",
            sub: "Check recent alerts",
            href: "/notifications",
        },
        {
            id: "settings",
            type: "action",
            label: "Settings",
            sub: "Distance, privacy, notifications",
            href: "/settings",
        },

        /* ── Blood groups ── */
        ...BLOOD_GROUPS.map((bg) => ({
            id: `bg-${bg}`,
            type: "blood" as const,
            label: `${bg} blood type`,
            sub: "Filter requests by blood group",
        })),

        /* ── Hospitals ── */
        ...HOSPITALS.map((h) => ({
            id: `h-${h.name}`,
            type: "hospital" as const,
            label: h.name,
            sub: h.city,
        })),

        /* ── Cities ── */
        ...CITIES.map((c) => ({
            id: `city-${c}`,
            type: "city" as const,
            label: c,
            sub: "City",
        })),
    ];
}

const TYPE_ICONS: Record<CommandItem["type"], React.ElementType> = {
    action: CornerDownLeft,
    blood: Droplet,
    hospital: MapPin,
    city: MapPin,
};

const TYPE_LABELS: Record<CommandItem["type"], string> = {
    action: "Action",
    blood: "Blood Group",
    hospital: "Hospital",
    city: "City",
};

/* ── Component ───────────────────────────────────────────── */
export function CommandPalette({ open, onOpenChange }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [cursor, setCursor] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const items = buildItems(router);

    const filtered = query.trim()
        ? items.filter(
              (item) =>
                  item.label.toLowerCase().includes(query.toLowerCase()) ||
                  item.sub?.toLowerCase().includes(query.toLowerCase())
          )
        : items.filter((i) => i.type === "action");

    const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
        const group = TYPE_LABELS[item.type];
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});

    const flat = filtered;

    useEffect(() => {
        if (open) {
            setQuery("");
            setCursor(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    useEffect(() => {
        setCursor(0);
    }, [query]);

    const handleSelect = useCallback(
        (item: CommandItem) => {
            if (item.href) router.push(item.href);
            if (item.action) item.action();
            onOpenChange(false);
        },
        [router, onOpenChange]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setCursor((c) => Math.min(c + 1, flat.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor((c) => Math.max(c - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const item = flat[cursor];
            if (item) handleSelect(item);
        } else if (e.key === "Escape") {
            onOpenChange(false);
        }
    };

    // Scroll active item into view
    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`) as HTMLElement;
        el?.scrollIntoView({ block: "nearest" });
    }, [cursor]);

    let globalIdx = 0;

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <AnimatePresence>
                    {open && (
                        <>
                            {/* Backdrop */}
                            <Dialog.Overlay asChild>
                                <motion.div
                                    key="backdrop"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="fixed inset-0 z-[999]"
                                    style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
                                />
                            </Dialog.Overlay>

                            {/* Panel */}
                            <Dialog.Content
                                aria-label="Command palette"
                                aria-describedby={undefined}
                                onKeyDown={handleKeyDown}
                                className="fixed z-[1000] top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4 outline-none"
                            >
                                <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
                                <motion.div
                                    key="panel"
                                    variants={scaleIn}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                                    className="bg-[var(--color-bg-elevated)] rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden"
                                    style={{ boxShadow: "var(--shadow-elevated)" }}
                                >
                                    {/* Search input */}
                                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border-subtle)]">
                                        <Search
                                            className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]"
                                            aria-hidden="true"
                                        />
                                        <input
                                            ref={inputRef}
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search requests, hospitals, donors, cities…"
                                            className="flex-1 bg-transparent text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
                                            aria-label="Search"
                                            aria-autocomplete="list"
                                        />
                                        {query && (
                                            <button
                                                onClick={() => setQuery("")}
                                                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                                                aria-label="Clear search"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Results */}
                                    <div
                                        ref={listRef}
                                        role="listbox"
                                        aria-label="Search results"
                                        className="overflow-y-auto max-h-[60vh] py-2"
                                    >
                                        {flat.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                                                    No results for &quot;{query}&quot;
                                                </p>
                                                <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
                                                    Try a blood group, city, or hospital name.
                                                </p>
                                            </div>
                                        ) : (
                                            Object.entries(grouped).map(([group, groupItems]) => (
                                                <div key={group}>
                                                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                                                        {group}
                                                    </p>
                                                    {groupItems.map((item) => {
                                                        const idx = flat.indexOf(item);
                                                        const Icon = TYPE_ICONS[item.type];
                                                        const isActive = cursor === idx;

                                                        return (
                                                            <button
                                                                key={item.id}
                                                                data-idx={idx}
                                                                role="option"
                                                                aria-selected={isActive}
                                                                onClick={() => handleSelect(item)}
                                                                onMouseEnter={() => setCursor(idx)}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors outline-none"
                                                                style={{
                                                                    background: isActive
                                                                        ? "var(--color-base-100)"
                                                                        : "transparent",
                                                                }}
                                                            >
                                                                <div
                                                                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                                                    style={{
                                                                        background: isActive
                                                                            ? "var(--color-border)"
                                                                            : "var(--color-base-100)",
                                                                    }}
                                                                >
                                                                    <Icon
                                                                        className="w-3.5 h-3.5"
                                                                        style={{
                                                                            color: item.type === "blood"
                                                                                ? "var(--color-cta)"
                                                                                : "var(--color-text-muted)",
                                                                        }}
                                                                        aria-hidden="true"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
                                                                        {item.label}
                                                                    </p>
                                                                    {item.sub && (
                                                                        <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                                                                            {item.sub}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {isActive && (
                                                                    <CornerDownLeft
                                                                        className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-muted)]"
                                                                        aria-hidden="true"
                                                                    />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Footer hint */}
                                    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[var(--color-border-subtle)]">
                                        <span className="text-[10px] text-[var(--color-text-muted)]">↑↓ navigate</span>
                                        <span className="text-[10px] text-[var(--color-text-muted)]">↵ select</span>
                                        <span className="text-[10px] text-[var(--color-text-muted)]">esc close</span>
                                    </div>
                                </motion.div>
                            </Dialog.Content>
                        </>
                    )}
                </AnimatePresence>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

/* ── Hook: Cmd+K / Ctrl+K trigger ───────────────────────── */
export function useCommandPalette() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return { open, setOpen };
}
