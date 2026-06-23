"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function getActiveRequestsAction() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer
        .from('blood_requests')
        .select(`
            *,
            donor_responses (
                *,
                profiles (full_name, phone, blood_group)
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch active requests: ${error.message}`);
    return data;
}

export async function getRequestByIdAction(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer
        .from('blood_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (error) throw new Error(`Failed to fetch request: ${error.message}`);
    return data;
}

export async function updateRequestAction(requestId: string, updateData: any) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Enforce that only the requester can update it
    const { data: requestCheck } = await supabaseServer
        .from('blood_requests')
        .select('requester_id')
        .eq('id', requestId)
        .single();

    if (requestCheck?.requester_id !== userId) {
        throw new Error("Unauthorized: You can only update your own requests.");
    }

    const { data, error } = await supabaseServer
        .from('blood_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

    if (error) throw new Error(`Failed to update request: ${error.message}`);
    return data;
}

export async function getUserRequestsAction() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer
        .from('blood_requests')
        .select(`
            *,
            donor_responses (
                *,
                profiles (full_name, phone, blood_group)
            )
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user requests: ${error.message}`);
    return data;
}
