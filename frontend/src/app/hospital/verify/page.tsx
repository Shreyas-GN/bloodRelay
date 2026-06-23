"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Droplet, Shield, ShieldCheck, ArrowRight, Building, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

export default function HospitalVerify() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hospital_name: '',
    license_id: '',
    city: 'Bangalore',
    admin_name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      router.push('/hospital/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4">
      <main className="max-w-md w-full">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center bg-rose-500/10 text-crimson rounded-2xl p-4 mb-2">
              <Building className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Hospital Certification</h1>
            <p className="text-zinc-500 text-sm font-medium">Verify your medical institution to broadcast emergency requests.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Institution Name</label>
                <input
                  type="text" required placeholder="e.g. City General Hospital"
                  value={form.hospital_name}
                  onChange={e => setForm({...form, hospital_name: e.target.value})}
                  className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-crimson"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Medical License ID / Registry Number</label>
                <input
                  type="text" required placeholder="e.g. MC-55420-1A"
                  value={form.license_id}
                  onChange={e => setForm({...form, license_id: e.target.value})}
                  className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-crimson"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Primary intake coordinator name</label>
                <input
                  type="text" required placeholder="e.g. Dr. Sarah K."
                  value={form.admin_name}
                  onChange={e => setForm({...form, admin_name: e.target.value})}
                  className="w-full bg-zinc-800 border-none rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-crimson"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !form.hospital_name || !form.license_id || !form.admin_name}
                className="w-full py-4 bg-crimson hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin mr-3" /> Verifying Credentials...</>
                ) : (
                  <>
                    Request Verification
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>

              <div className="flex items-start gap-2.5 text-[10px] font-medium text-zinc-500 leading-normal">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verification requires a valid medical institution license. Access is audited by the health registry department.</span>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
