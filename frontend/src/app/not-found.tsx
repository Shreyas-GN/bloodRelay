import Link from 'next/link';
import { Droplet, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-base-50)] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-[80px] h-[80px] bg-white rounded-full shadow-[var(--shadow-clay)] flex items-center justify-center mb-8 border border-[var(--color-base-200)]">
        <Droplet className="w-10 h-10 text-[var(--color-blood)] animate-pulse" />
      </div>
      
      <h1 className="font-display text-[3rem] font-bold tracking-tight text-[var(--color-base-900)] mb-4 leading-none">
        404 <br />
        <span className="text-[1.5rem] font-medium text-[var(--color-base-500)]">Page Not Found</span>
      </h1>
      
      <p className="text-[var(--color-base-500)] max-w-md mb-12">
        The link you followed might be broken, or the request has been fulfilled and removed. Let's get you back on track.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white border border-[var(--color-base-200)] text-[var(--color-base-700)] rounded-[var(--radius-pill)] font-bold hover:border-[var(--color-blood)] hover:text-[var(--color-blood)] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Link 
          href="/emergency" 
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--color-blood)] text-white rounded-[var(--radius-pill)] font-bold shadow-[var(--shadow-clay-hard)] hover:-translate-y-px transition-transform"
        >
          <AlertTriangle className="w-4 h-4" />
          Emergency Center
        </Link>
      </div>
    </div>
  );
}
