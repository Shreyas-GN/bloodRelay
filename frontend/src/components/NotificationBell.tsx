"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/lib/useNotifications";
import type { Notification } from "@/types";

const NOTIFICATION_ICONS: Record<string, string> = {
    DONOR_NEEDED: "🩸",
    REQUEST_ACCEPTED: "✅",
    REQUEST_COMPLETED: "🎉",
    REQUEST_CANCELLED: "❌",
    DONOR_MATCH: "💉",
};

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        if (notification.related_request) {
            router.push(`/request/${notification.related_request.id}`);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Toggle notifications"
            >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full translate-x-1/2 -translate-y-1/2">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No notifications</p>
                                    <p className="text-sm mt-1">You&apos;re all caught up!</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleClick(notification)}
                                        className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${!notification.is_read ? "bg-red-50" : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.type === "DONOR_NEEDED"
                                                        ? "bg-red-100"
                                                        : "bg-green-100"
                                                    }`}
                                            >
                                                <span className="text-xl">
                                                    {NOTIFICATION_ICONS[notification.type] ?? "🔔"}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {formatDistanceToNow(new Date(notification.created_at), {
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                            </div>

                                            {!notification.is_read && (
                                                <div className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mt-2" />
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
