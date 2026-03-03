"use client";

import { useState } from 'react';
import { useApiClient } from '@/lib/useApiClient';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface CancelRequestButtonProps {
    requestId: number;
    onCancel?: () => void;
}

export function CancelRequestButton({ requestId, onCancel }: CancelRequestButtonProps) {
    const api = useApiClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCancel = async () => {
        setLoading(true);
        setError(null);

        try {
            await api.post(`requests/${requestId}/cancel/`);

            if (onCancel) {
                onCancel();
            } else {
                // Redirect to dashboard
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('Error cancelling request:', err);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to delete request'
            );
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            {/* Delete Button */}
            <button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-100 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md h-12"
            >
                <Trash2 className="w-5 h-5" />
                Delete Request
            </button>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Delete Blood Request?
                        </h3>

                        {/* Message */}
                        <p className="text-gray-600 text-center mb-6">
                            Are you sure you want to delete this notification? This will remove it from the donor feed.
                            <br /><br />
                            <span className="text-sm bg-red-50 text-red-800 px-2 py-1 rounded">
                                NOTE: If you found a donor outside the app, please delete this to save other donors' time.
                            </span>
                        </p>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    setError(null);
                                }}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                            >
                                Keep Request
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete Forever
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
