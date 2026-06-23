"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase/server";
import type { ActivityEventType } from "@/types/database.types";

export async function logActivityAction(
    eventType: ActivityEventType,
    description: string,
    requestId?: string | null
) {
    const { userId } = await auth();
    if (!userId) return; // Silent fail if unauthorized for activities

    try {
        const { error } = await supabaseServer
            .from('activities')
            .insert({
                user_id: userId,
                event_type: eventType,
                description,
                request_id: requestId ?? null,
            });
        if (error) console.error('logActivityAction failed:', error);
    } catch (err) {
        console.error('logActivityAction threw:', err);
    }
}

export async function getRecentActivitiesAction() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) throw new Error(`Failed to fetch activities: ${error.message}`);
    return data;
}
