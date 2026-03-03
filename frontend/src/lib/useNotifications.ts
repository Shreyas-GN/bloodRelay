"use client";

import { useState, useEffect, useCallback } from "react";
import { useApiClient } from "./useApiClient";
import type { Notification } from "@/types";

const POLL_INTERVAL_MS = 20_000;

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refresh: () => void;
}

export function useNotifications(): UseNotificationsReturn {
    const api = useApiClient();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        try {
            const [notifRes, countRes] = await Promise.all([
                api.get<Notification[]>("notifications/"),
                api.get<{ unread_count: number }>("notifications/unread-count/"),
            ]);
            setNotifications(notifRes.data);
            setUnreadCount(countRes.data.unread_count);
        } catch {
            // Silently fail — polling will retry
        } finally {
            setLoading(false);
        }
    }, [api]);

    const markAsRead = useCallback(
        async (id: number) => {
            await api.post("notifications/mark-read/", { notification_ids: [id] });
            await fetchAll();
        },
        [api, fetchAll]
    );

    const markAllAsRead = useCallback(async () => {
        await api.post("notifications/mark-read/", { notification_ids: [] });
        await fetchAll();
    }, [api, fetchAll]);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchAll]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchAll,
    };
}
