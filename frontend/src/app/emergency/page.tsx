"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mic, ArrowRight, AlertTriangle, CheckCircle, Droplet, X } from "lucide-react";
import { OTPVerification } from "@/components/auth/OTPVerification";

type Step = "input" | "otp" | "submitting" | "done";

interface ParsedRequest {
    blood_group: string | null;
    urgency_level: string;
    hospital_name: string | null;
    units: number;
    patient_name: string | null;
    requester_name: string | null;
    relation: string | null;
    reason: string | null;
}

const field =
    "w-full h-12 bg-white border border-[#ECECEC] text-[#1E1E1E] placeholder:text-[#C0C0C0] rounded-[16px] px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#D63A3A]/15 focus:border-[#D63A3A] transition-all";

const label = "block text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-[0.06em] mb-1.5";

export default function EmergencyPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("input");
    const [text, setText] = useState("");
    const [phone, setPhone] = useState("");
    const [requesterName, setRequesterName] = useState("");
    const [parsed, setParsed] = useState<ParsedRequest | null>(null);
    const [parsing, setParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationLabel, setLocationLabel] = useState<string>("Detecting location...");
    const [isManualLocation, setIsManualLocation] = useState(false);
    const [manualCity, setManualCity] = useState("Bangalore");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [entryMode, setEntryMode] = useState<"ai" | "manual">("ai");
    const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocationLabel(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                },
                () => setLocationLabel("Location unavailable — enter hospital manually")
            );
        }
    }, []);

    const handleVoice = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) { setParseError("Voice input isn't supported in this browser. Please type your request."); return; }
        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = false;
        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }
        setIsListening(true);
        recognition.start();
        recognition.onresult = (e: any) => {
            setText((prev) => prev + " " + e.results[0][0].transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
    };

    const handleParse = async () => {
        if (!text.trim()) return;
        setParsing(true);
        setParseError(null);
        try {
            const res = await fetch("/api/ai/parse-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setParsed(json.data);
            if (json.data.requester_name) setRequesterName(json.data.requester_name);
        } catch (e: any) {
            setParseError(e.message || "Couldn't parse your request. Try again.");
        } finally {
            setParsing(false);
        }
    };

    const handleOTPVerified = async () => {
        if (!parsed) return;
        setStep("submitting");
        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    blood_group: parsed.blood_group || "O+",
                    units: parsed.units,
                    patient_name: isAnonymous
                        ? "Anonymous Patient"
                        : parsed.patient_name || requesterName || "Emergency Patient",
                    hospital_name: parsed.hospital_name || "Unknown Hospital",
                    city: isManualLocation ? manualCity : parsed.hospital_name || "Bangalore",
                    contact_phone: phone,
                    urgency_level: parsed.urgency_level,
                    requester_relation: parsed.relation || null,
                    status: "searching",
                    latitude: location?.lat || 12.9716,
                    longitude: location?.lng || 77.5946,
                    location: location
                        ? `POINT(${location.lng} ${location.lat})`
                        : `POINT(77.5946 12.9716)`,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Submission failed");
            setCreatedRequestId(data.request?.id);
            setStep("done");
        } catch (e: any) {
            setParseError(e.message);
            setStep("input");
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[#FCFCFB] selection:bg-red-100 selection:text-[#C52F2F]">
            {/* Top bar */}
            <header className="px-6 pt-7">
                <div className="max-w-[480px] mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[#9E9E9E] hover:text-[#1E1E1E] transition-colors text-sm font-medium"
                    >
                        <span className="text-[#D63A3A] text-lg leading-none">●</span>
                        BloodRelay
                    </Link>
                </div>
            </header>

            <main className="max-w-[480px] mx-auto px-6 pb-20">
                <AnimatePresence mode="wait">

                    {/* ─── INPUT STEP ─────────────────────────────────────────── */}
                    {step === "input" && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22 }}
                        >
                            {/* Page title */}
                            <div className="pt-10 pb-8">
                                <h1 className="text-[42px] font-extrabold text-[#1E1E1E] leading-[1.0] tracking-[-0.03em]">
                                    Need blood
                                    <br />
                                    <span className="text-[#D63A3A]">right now?</span>
                                </h1>
                                <p className="mt-3 text-[15px] text-[#737373] leading-relaxed">
                                    No account needed. Tell us what you need.
                                </p>
                            </div>

                            {/* Location row */}
                            <div className="mb-5 flex items-center justify-between py-3 px-4 bg-white border border-[#ECECEC] rounded-[16px]">
                                <div className="flex items-center gap-2 min-w-0">
                                    <MapPin className="w-4 h-4 text-[#D63A3A] shrink-0" />
                                    <span className="text-sm text-[#737373] truncate">{locationLabel}</span>
                                </div>
                                <button
                                    onClick={() => setIsManualLocation(!isManualLocation)}
                                    className="text-xs font-semibold text-[#D63A3A] hover:text-[#C52F2F] transition-colors shrink-0 ml-3"
                                >
                                    {isManualLocation ? "Use GPS" : "Set manually"}
                                </button>
                            </div>

                            <AnimatePresence>
                                {isManualLocation && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-5 overflow-hidden"
                                    >
                                        <div className="bg-white border border-[#ECECEC] rounded-[16px] p-4 space-y-3">
                                            <p className={label}>City / Area</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={manualCity}
                                                    onChange={(e) => setManualCity(e.target.value)}
                                                    placeholder="e.g. Indiranagar, Bangalore"
                                                    className={field}
                                                />
                                                <button
                                                    onClick={() => {
                                                        setLocationLabel(`📍 ${manualCity}`);
                                                        setIsManualLocation(false);
                                                    }}
                                                    className="px-4 h-12 bg-[#1E1E1E] text-white text-sm font-semibold rounded-[16px] hover:bg-[#333] transition-colors shrink-0"
                                                >
                                                    Set
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-[#C0C0C0]">
                                                Helps us alert the right donors in your area.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Mode switcher */}
                            <div className="flex p-1 bg-[#F4F4F4] rounded-[18px] mb-6">
                                <button
                                    onClick={() => setEntryMode("ai")}
                                    className={`flex-1 py-2.5 rounded-[14px] text-sm font-semibold transition-all ${
                                        entryMode === "ai"
                                            ? "bg-white text-[#1E1E1E] shadow-[0_1px_0_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.06)]"
                                            : "text-[#9E9E9E] hover:text-[#737373]"
                                    }`}
                                >
                                    AI Assistant
                                </button>
                                <button
                                    onClick={() => {
                                        setEntryMode("manual");
                                        if (!parsed)
                                            setParsed({
                                                blood_group: "O+",
                                                units: 1,
                                                patient_name: "",
                                                hospital_name: "",
                                                requester_name: "",
                                                relation: "Unspecified",
                                                reason: "",
                                                urgency_level: "IMMEDIATE",
                                            });
                                    }}
                                    className={`flex-1 py-2.5 rounded-[14px] text-sm font-semibold transition-all ${
                                        entryMode === "manual"
                                            ? "bg-white text-[#1E1E1E] shadow-[0_1px_0_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.06)]"
                                            : "text-[#9E9E9E] hover:text-[#737373]"
                                    }`}
                                >
                                    Standard Form
                                </button>
                            </div>

                            {/* ── AI mode ── */}
                            {entryMode === "ai" && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder={`e.g. "Need 2 units of B+ blood urgently at Manipal Hospital for my father who is in ICU"`}
                                            rows={5}
                                            className="w-full bg-white border border-[#ECECEC] text-[#1E1E1E] placeholder:text-[#C0C0C0] rounded-[16px] p-4 pr-14 text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#D63A3A]/15 focus:border-[#D63A3A] transition-all"
                                        />
                                        <button
                                            onClick={handleVoice}
                                            title={isListening ? "Stop listening" : "Speak"}
                                            className={`absolute right-3 top-3 p-2.5 rounded-[12px] transition-all ${
                                                isListening
                                                    ? "bg-[#D63A3A] text-white animate-pulse"
                                                    : "bg-[#F4F4F4] text-[#9E9E9E] hover:text-[#1E1E1E] hover:bg-[#ECECEC]"
                                            }`}
                                        >
                                            <Mic className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Analyze button — only when not yet parsed */}
                                    {!parsed && (
                                        <button
                                            onClick={handleParse}
                                            disabled={parsing || !text.trim()}
                                            className="w-full h-12 bg-[#1E1E1E] text-white rounded-[18px] font-semibold text-[15px] hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-2 disabled:opacity-35 active:scale-[0.99]"
                                        >
                                            {parsing ? (
                                                <>
                                                    <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                                                    Analyzing…
                                                </>
                                            ) : (
                                                <>
                                                    Analyze Request
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Detected details — after successful parse */}
                                    <AnimatePresence>
                                        {parsed && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                className="bg-white border border-[#ECECEC] rounded-[20px] overflow-hidden"
                                                style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}
                                            >
                                                <div className="px-5 py-4 border-b border-[#F4F4F4] flex items-center justify-between">
                                                    <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-[0.06em]">
                                                        Detected details
                                                    </p>
                                                    <button
                                                        onClick={() => setParsed(null)}
                                                        className="text-[#C0C0C0] hover:text-[#737373] transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="p-5 grid grid-cols-3 gap-4">
                                                    {[
                                                        { label: "Blood", value: parsed.blood_group || "—" },
                                                        { label: "Units", value: String(parsed.units) },
                                                        {
                                                            label: "Urgency",
                                                            value: parsed.urgency_level?.replace(/_/g, " ") || "—",
                                                        },
                                                        {
                                                            label: "Hospital",
                                                            value: parsed.hospital_name || "Not detected",
                                                        },
                                                        {
                                                            label: "For",
                                                            value: parsed.patient_name || "Patient",
                                                        },
                                                        {
                                                            label: "Relation",
                                                            value: parsed.relation || "—",
                                                        },
                                                    ].map((item) => (
                                                        <div key={item.label} className="space-y-0.5 min-w-0">
                                                            <p className="text-[10px] font-semibold text-[#C0C0C0] uppercase tracking-[0.06em]">
                                                                {item.label}
                                                            </p>
                                                            <p className="text-sm font-semibold text-[#1E1E1E] truncate">
                                                                {item.value}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {!parsed.blood_group && (
                                                    <div className="px-5 pb-4">
                                                        <p className="text-xs text-amber-600 flex items-center gap-1.5">
                                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                            Blood group not detected — include it in your description.
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="px-5 pb-5 pt-1 border-t border-[#F4F4F4] flex items-center justify-between">
                                                    <button
                                                        onClick={() => setIsAnonymous(!isAnonymous)}
                                                        className="flex items-center gap-2 text-xs font-semibold transition-colors group"
                                                    >
                                                        <span
                                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                isAnonymous
                                                                    ? "border-[#D63A3A] bg-[#D63A3A]"
                                                                    : "border-[#ECECEC] group-hover:border-[#C0C0C0]"
                                                            }`}
                                                        >
                                                            {isAnonymous && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                                            )}
                                                        </span>
                                                        <span
                                                            className={
                                                                isAnonymous ? "text-[#D63A3A]" : "text-[#9E9E9E]"
                                                            }
                                                        >
                                                            Post anonymously
                                                        </span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* ── Manual form ── */}
                            {entryMode === "manual" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={label}>Blood Group</label>
                                            <select
                                                value={parsed?.blood_group || "O+"}
                                                onChange={(e) =>
                                                    setParsed({ ...parsed!, blood_group: e.target.value })
                                                }
                                                className={field + " appearance-none cursor-pointer"}
                                            >
                                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                                                    (bg) => (
                                                        <option key={bg} value={bg}>
                                                            {bg}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={label}>Units needed</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={parsed?.units || 1}
                                                onChange={(e) =>
                                                    setParsed({
                                                        ...parsed!,
                                                        units: parseInt(e.target.value) || 1,
                                                    })
                                                }
                                                className={field}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={label}>Hospital name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Apollo Hospital"
                                            value={parsed?.hospital_name || ""}
                                            onChange={(e) =>
                                                setParsed({ ...parsed!, hospital_name: e.target.value })
                                            }
                                            className={field}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={label}>Patient name</label>
                                            <input
                                                type="text"
                                                placeholder="Patient name"
                                                value={parsed?.patient_name || ""}
                                                onChange={(e) =>
                                                    setParsed({ ...parsed!, patient_name: e.target.value })
                                                }
                                                className={field}
                                            />
                                        </div>
                                        <div>
                                            <label className={label}>Your relation</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Father, Friend"
                                                value={parsed?.relation || ""}
                                                onChange={(e) =>
                                                    setParsed({ ...parsed!, relation: e.target.value })
                                                }
                                                className={field}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error message */}
                            {parseError && (
                                <p className="mt-4 text-sm text-red-600 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    {parseError}
                                </p>
                            )}

                            {/* ── Contact section ── */}
                            <div className="mt-6">
                                <p className={label}>Your contact details</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] text-[#9E9E9E] mb-1.5">Name</label>
                                        <input
                                            type="text"
                                            value={requesterName}
                                            onChange={(e) => setRequesterName(e.target.value)}
                                            placeholder="John Doe"
                                            className={field}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] text-[#9E9E9E] mb-1.5">Phone</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 98765..."
                                            className={field}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Primary CTA ── */}
                            <div className="mt-5 space-y-3">
                                {/* AI mode: after parsing */}
                                {entryMode === "ai" && parsed && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setParsed(null)}
                                            className="h-12 px-5 border border-[#ECECEC] text-[#737373] rounded-[18px] font-semibold text-sm hover:border-[#D0D0D0] hover:text-[#1E1E1E] transition-colors"
                                        >
                                            Re-parse
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!phone.trim())
                                                    return setParseError("Enter your phone number first.");
                                                if (!parsed.blood_group)
                                                    return setParseError(
                                                        "Blood group required — mention it in your description."
                                                    );
                                                setParseError(null);
                                                setStep("otp");
                                            }}
                                            className="flex-1 h-12 bg-[#D63A3A] text-white rounded-[18px] font-semibold text-[15px] hover:bg-[#C52F2F] transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-[0_4px_16px_rgba(214,58,58,0.25)]"
                                        >
                                            Verify & Submit
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Manual mode: direct to OTP */}
                                {entryMode === "manual" && (
                                    <button
                                        onClick={() => {
                                            if (!phone.trim())
                                                return setParseError("Enter your phone number first.");
                                            if (!parsed?.blood_group || !parsed?.hospital_name)
                                                return setParseError("Blood group and hospital name are required.");
                                            setParseError(null);
                                            setStep("otp");
                                        }}
                                        className="w-full h-12 bg-[#D63A3A] text-white rounded-[18px] font-semibold text-[15px] hover:bg-[#C52F2F] transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-[0_4px_16px_rgba(214,58,58,0.25)]"
                                    >
                                        Review & Submit
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <p className="text-center text-[13px] text-[#C0C0C0] mt-6">
                                Have an account?{" "}
                                <a
                                    href="/sign-in"
                                    className="text-[#737373] hover:text-[#1E1E1E] font-semibold transition-colors"
                                >
                                    Sign in instead
                                </a>
                            </p>
                        </motion.div>
                    )}

                    {/* ─── OTP STEP ───────────────────────────────────────────── */}
                    {step === "otp" && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 32 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -32 }}
                            transition={{ duration: 0.22 }}
                            className="pt-12"
                        >
                            <OTPVerification
                                phone={phone}
                                onVerified={handleOTPVerified}
                                onBack={() => setStep("input")}
                            />
                        </motion.div>
                    )}

                    {/* ─── SUBMITTING STEP ────────────────────────────────────── */}
                    {step === "submitting" && (
                        <motion.div
                            key="submitting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center min-h-[65vh] gap-6 text-center"
                        >
                            <div className="relative w-14 h-14">
                                <span className="absolute inset-0 rounded-full border-2 border-[#ECECEC]" />
                                <span className="absolute inset-0 rounded-full border-2 border-[#D63A3A] border-t-transparent animate-spin" />
                                <Droplet className="absolute inset-0 m-auto w-5 h-5 text-[#D63A3A]" />
                            </div>
                            <div>
                                <p className="text-[#1E1E1E] font-bold text-xl">Creating your request…</p>
                                <p className="text-[#737373] text-sm mt-1.5">Alerting nearby donors</p>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── DONE STEP ──────────────────────────────────────────── */}
                    {step === "done" && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center min-h-[65vh] gap-6 text-center"
                        >
                            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[#1E1E1E] font-extrabold text-[32px] leading-none tracking-tight">
                                    Request sent.
                                </p>
                                <p className="text-[#737373] text-[15px] mt-3 max-w-[280px] leading-relaxed">
                                    Donors near you are being notified. You'll be contacted shortly.
                                </p>
                            </div>
                            {createdRequestId && (
                                <button
                                    onClick={() => router.push(`/request/${createdRequestId}`)}
                                    className="h-12 px-8 bg-[#1E1E1E] text-white font-semibold rounded-[18px] hover:bg-[#2a2a2a] transition-colors"
                                >
                                    Track your request →
                                </button>
                            )}
                            <a
                                href="/"
                                className="text-sm text-[#C0C0C0] hover:text-[#737373] transition-colors"
                            >
                                Go to home
                            </a>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}
