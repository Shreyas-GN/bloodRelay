"use client";

import { useState } from 'react';
import { useApiClient } from '@/lib/useApiClient';

interface DonorAvailabilityToggleProps {
    initialAvailable: boolean;
    onToggle?: (newStatus: boolean) => void;
}

export function DonorAvailabilityToggle({ initialAvailable, onToggle }: DonorAvailabilityToggleProps) {
    const api = useApiClient();
    const [isAvailable, setIsAvailable] = useState(initialAvailable);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleToggle = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('users/toggle-availability/', {
                is_available: !isAvailable
            });

            const newStatus = response.data.is_available_donor;
            setIsAvailable(newStatus);

            if (onToggle) {
                onToggle(newStatus);
            }
        } catch (err: any) {
            console.error('Error toggling availability:', err);
            setError(err.response?.data?.error || 'Failed to update availability');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toggle Card */}
            <div className={`p-6 rounded-xl border-2 transition-all ${isAvailable
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isAvailable ? 'bg-green-500' : 'bg-gray-400'
                                }`}>
                                {isAvailable ? (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Donor Availability
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {isAvailable
                                        ? 'You will receive emergency blood donation requests'
                                        : 'You will not receive donation requests'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                        onClick={handleToggle}
                        disabled={loading}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isAvailable ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        role="switch"
                        aria-checked={isAvailable}
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${isAvailable
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-600 animate-pulse' : 'bg-gray-500'
                            }`} />
                        {isAvailable ? 'Available for Donations' : 'Not Available'}
                    </span>
                </div>

                {/* Info Text */}
                <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isAvailable ? (
                            <>
                                <span className="font-semibold text-green-600 dark:text-green-400">Active:</span> You'll be notified when someone nearby needs your blood type.
                            </>
                        ) : (
                            <>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Inactive:</span> Turn on availability when you're ready to donate.
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                </div>
            )}
        </div>
    );
}
