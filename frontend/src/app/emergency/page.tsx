"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Droplet, AlertTriangle, ArrowRight, Mic, MicOff, CheckCircle } from "lucide-react";
import { OTPVerification } from "@/components/OTPVerification";

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
    const [entryMode, setEntryMode] = useState<'ai' | 'manual'>('ai');
    const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

    // Auto-detect location on mount
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

    // Voice-to-text
    const handleVoice = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Voice input not supported in this browser.");

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
            const transcript = e.results[0][0].transcript;
            setText(prev => prev + " " + transcript);
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
    };

    // AI Parse the text
    const handleParse = async () => {
        if (!text.trim()) return;
        setParsing(true);
        setParseError(null);
        try {
            const res = await fetch("/api/ai/parse-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setParsed(json.data);
            if (json.data.requester_name) {
                setRequesterName(json.data.requester_name);
            }
        } catch (e: any) {
            setParseError(e.message || "Could not parse request. Please try again.");
        } finally {
            setParsing(false);
        }
    };

    // Called after OTP is verified
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
                    patient_name: isAnonymous ? "Anonymous Patient" : (parsed.patient_name || requesterName || "Emergency Patient"),
                    hospital_name: parsed.hospital_name || "Unknown Hospital",
                    city: isManualLocation ? manualCity : (parsed.hospital_name || "Bangalore"),
                    contact_phone: phone,
                    urgency_level: parsed.urgency_level,
                    status: "SEARCHING",
                    latitude: location?.lat || 12.9716, 
                    longitude: location?.lng || 77.5946,
                    requester_phone: phone,
                    requester_name: isAnonymous ? "Anonymous" : (requesterName || parsed.requester_name),
                    metadata: {
                        relation: parsed.relation,
                        is_anonymous: isAnonymous
                    }
                })
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
        <div className="min-h-[100dvh] bg-zinc-950 flex flex-col selection:bg-crimson/30">
            {/* Header */}
            <header className="px-6 pt-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">Emergency Mode</span>
                </div>
                <h1 className="text-4xl font-black text-white mt-3 leading-none tracking-tight">
                    Need Blood<br />
                    <span className="text-crimson">Right Now?</span>
                </h1>
                <p className="text-zinc-400 text-sm mt-2 font-medium">No login needed. Describe what you need.</p>
            </header>

            {/* Steps */}
            <main className="flex-1 px-6 pb-10 overflow-y-auto">
                <AnimatePresence mode="wait">

                    {/* Step 1: Input */}
                    {step === "input" && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6 pt-4"
                        >
                            {/* Location Indicator */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {locationLabel}
                                </div>
                                <button 
                                    onClick={() => setIsManualLocation(!isManualLocation)}
                                    className="text-[11px] font-black text-rose-400 uppercase tracking-wider hover:text-white transition-colors underline decoration-rose-500/50 underline-offset-4"
                                >
                                    {isManualLocation ? "✔ Use GPS" : "📍 Set Manually"}
                                </button>
                            </div>

                            {isManualLocation && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2"
                                >
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Search City / Area</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            value={manualCity}
                                            onChange={(e) => setManualCity(e.target.value)}
                                            placeholder="e.g. Indiranagar, Bangalore"
                                            className="flex-1 bg-zinc-800 border-none text-white text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-crimson"
                                        />
                                        <button 
                                            onClick={() => {
                                                setLocationLabel(`📍 ${manualCity}`);
                                                setIsManualLocation(false);
                                            }}
                                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                                        >
                                            Lock
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 italic">This helps us alert the right donors in your area.</p>
                                </motion.div>
                            )}

                            {/* Entry Mode Switcher */}
                            <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl mb-2">
                                <button 
                                    onClick={() => setEntryMode('ai')}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${entryMode === 'ai' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    AI Assistant
                                </button>
                                <button 
                                    onClick={() => {
                                        setEntryMode('manual');
                                        setParsed({
                                            blood_group: 'O+',
                                            units: 1,
                                            patient_name: '',
                                            hospital_name: '',
                                            requester_name: '',
                                            relation: 'Unspecified',
                                            reason: '',
                                            urgency_level: 'IMMEDIATE'
                                        });
                                    }}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${entryMode === 'manual' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Standard Form
                                </button>
                            </div>

                            {entryMode === 'ai' ? (
                                <>
                                    {/* AI Text Input */}
                                    <div className="relative">
                                        <textarea
                                            value={text}
                                            onChange={e => setText(e.target.value)}
                                            placeholder={`e.g. "Need 2 units of B+ blood urgently at Manipal Hospital for my father who is in ICU"`}
                                            rows={5}
                                            className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 rounded-2xl p-4 pr-14 text-base resize-none focus:outline-none focus:ring-2 focus:ring-crimson/40 focus:border-crimson transition-all"
                                        />
                                        <button
                                            onClick={handleVoice}
                                            className={`absolute right-4 top-4 p-2 rounded-xl transition-all ${isListening ? 'bg-crimson text-white animate-pulse shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                                        >
                                            <Mic className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleParse}
                                        disabled={parsing || !text.trim()}
                                        className="w-full py-4 bg-white text-zinc-950 rounded-2xl font-black text-sm tracking-tight hover:bg-zinc-100 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {parsing ? <><span className="w-4 h-4 rounded-full border-2 border-zinc-900/30 border-t-zinc-900 animate-spin" /> Analyzing...</> : <>Verify Emergency Details <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Blood Group</label>
                                            <select 
                                                value={parsed?.blood_group || 'O+'}
                                                onChange={(e) => setParsed({...parsed!, blood_group: e.target.value})}
                                                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl py-3 px-4 focus:border-crimson"
                                            >
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Units Needed</label>
                                            <input 
                                                type="number" min="1" max="10"
                                                value={parsed?.units || 1}
                                                onChange={(e) => setParsed({...parsed!, units: parseInt(e.target.value) || 1})}
                                                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl py-3 px-4 focus:border-crimson"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Hospital Name</label>
                                        <input 
                                            type="text" placeholder="e.g. Apollo Hospital"
                                            value={parsed?.hospital_name || ''}
                                            onChange={(e) => setParsed({...parsed!, hospital_name: e.target.value})}
                                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl py-3 px-4 focus:border-crimson"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Patient Name</label>
                                            <input 
                                                type="text" placeholder="Patient Name"
                                                value={parsed?.patient_name || ''}
                                                onChange={(e) => setParsed({...parsed!, patient_name: e.target.value})}
                                                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl py-3 px-4 focus:border-crimson"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Relation</label>
                                            <input 
                                                type="text" placeholder="e.g. Sister, Friend"
                                                value={parsed?.relation || ''}
                                                onChange={(e) => setParsed({...parsed!, relation: e.target.value})}
                                                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl py-3 px-4 focus:border-crimson"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setStep('verify')}
                                        disabled={!parsed?.hospital_name || !parsed?.blood_group}
                                        className="w-full py-4 bg-crimson text-white rounded-2xl font-black text-sm tracking-tight hover:bg-red-700 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        Review Emergency Request <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Parse Error */}
                            {parseError && (
                                <p className="text-sm text-rose-400 font-medium flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {parseError}
                                </p>
                            )}

                            {/* Parsed Result Preview - Only show in AI mode after parsing */}
                            {entryMode === 'ai' && parsed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-3"
                                >
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Detected Details</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Blood", value: parsed.blood_group || "Not detected" },
                                            { label: "Units", value: `${parsed.units} unit${parsed.units > 1 ? 's' : ''}` },
                                            { label: "Requester", value: parsed.requester_name || "You" },
                                            { label: "Relation", value: parsed.relation || "Unspecified" },
                                            { label: "Hospital", value: parsed.hospital_name || "Not detected" },
                                            { label: "Urgency", value: parsed.urgency_level },
                                        ].map(item => (
                                            <div key={item.label} className="bg-zinc-800 rounded-xl p-3">
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className="text-sm font-bold text-white">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 pt-2">
                                        <button 
                                            onClick={() => setIsAnonymous(!isAnonymous)}
                                            className={`flex-1 py-2 px-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${isAnonymous ? 'bg-zinc-800 border-zinc-600 text-white' : 'border-zinc-800 text-zinc-500'}`}
                                        >
                                            {isAnonymous ? '✔ Posted Anonymously' : 'Post Anonymously?'}
                                        </button>
                                    </div>
                                    {!parsed.blood_group && (
                                        <p className="text-xs text-amber-400 flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            Blood group not detected. Please include it in your description.
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {/* Contact Details */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Your Name</label>
                                    <input
                                        type="text"
                                        value={requesterName}
                                        onChange={e => setRequesterName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/40 focus:border-crimson transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Your Phone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+91..."
                                        className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/40 focus:border-crimson transition-all"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            {!parsed ? (
                                <button
                                    onClick={handleParse}
                                    disabled={!text.trim() || parsing}
                                    className="w-full py-4 bg-crimson text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-red-700 disabled:opacity-40 shadow-[0_8px_30px_rgba(192,57,43,0.4)]"
                                >
                                    {parsing ? (
                                        <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Parsing...</>
                                    ) : (
                                        <>Parse My Request <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setParsed(null)}
                                        className="flex-1 py-4 border-2 border-zinc-700 text-zinc-300 font-bold rounded-2xl hover:border-zinc-500 transition-colors"
                                    >
                                        Re-parse
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!phone.trim()) return setParseError("Enter your phone number first");
                                            if (!parsed.blood_group) return setParseError("Blood group is required. Re-describe with blood group.");
                                            setParseError(null);
                                            setStep("otp");
                                        }}
                                        className="flex-[2] py-4 bg-crimson text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-red-700 shadow-[0_8px_30px_rgba(192,57,43,0.4)]"
                                    >
                                        Verify & Submit <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Login Fallback */}
                            <p className="text-center text-xs text-zinc-600">
                                Have an account?{" "}
                                <a href="/sign-in" className="text-zinc-400 hover:text-white font-semibold transition-colors">Sign in instead</a>
                            </p>
                        </motion.div>
                    )}

                    {/* Step 2: OTP */}
                    {step === "otp" && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            className="pt-8"
                        >
                            <OTPVerification
                                phone={phone}
                                onVerified={handleOTPVerified}
                                onBack={() => setStep("input")}
                            />
                        </motion.div>
                    )}

                    {/* Step 3: Submitting */}
                    {step === "submitting" && (
                        <motion.div
                            key="submitting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center"
                        >
                            <div className="relative w-20 h-20">
                                <span className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                                <span className="absolute inset-0 rounded-full border-4 border-crimson border-t-transparent animate-spin" />
                                <Droplet className="absolute inset-0 m-auto w-7 h-7 text-crimson" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-xl">Creating your request...</p>
                                <p className="text-zinc-500 text-sm mt-1">Alerting nearby donors</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Done */}
                    {step === "done" && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-white font-black text-2xl">Request Sent!</p>
                                <p className="text-zinc-400 text-sm mt-2 max-w-xs">
                                    Donors near you are being alerted right now. You'll be contacted shortly.
                                </p>
                            </div>
                            {createdRequestId && (
                                <button
                                    onClick={() => router.push(`/request/${createdRequestId}`)}
                                    className="px-8 py-4 bg-white text-zinc-900 font-bold rounded-2xl hover:bg-zinc-100 transition-colors"
                                >
                                    Track Your Request →
                                </button>
                            )}
                            <a href="/" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">Go to Home</a>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}
