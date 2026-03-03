"use client";

import { useEffect } from 'react';

interface ErrorToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md">
                {/* Error Icon */}
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                {/* Message */}
                <p className="flex-1 font-medium">{message}</p>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:bg-red-700 rounded p-1 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

interface SuccessToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export function SuccessToast({ message, onClose, duration = 3000 }: SuccessToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md">
                {/* Success Icon */}
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                {/* Message */}
                <p className="flex-1 font-medium">{message}</p>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:bg-green-700 rounded p-1 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
