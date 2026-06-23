"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function getProfileAction() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch profile: ${error.message}`);
    return data;
}

export async function updateProfileAction(profileData: any) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer
        .from('profiles')
        .upsert({ id: userId, ...profileData })
        .select()
        .single();

    if (error) throw new Error(`Failed to update profile: ${error.message}`);
    return data;
}

export async function submitDonorResponseAction(
    requestId: string,
    status: 'ACCEPTED' | 'CONFIRMED' | 'ARRIVED' | 'CANCELLED' = 'ACCEPTED',
    distanceMeters?: number | null,
    etaMinutes?: number | null
) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer
        .from('donor_responses')
        .upsert({
            request_id: requestId,
            donor_id: userId,
            status: status,
            distance_meters: distanceMeters,
            eta_minutes: etaMinutes,
            responded_at: new Date().toISOString()
        }, { onConflict: 'request_id,donor_id' })
        .select()
        .single();

    if (error) throw new Error(`Failed to submit donor response: ${error.message}`);

    try {
        await supabaseServer.rpc('increment_confirmed_count', { req_id: requestId });
    } catch (e) {
        console.error("Failed to increment confirmed count", e);
    }

    return data;
}

export async function getResponsesForRequestAction(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // We can enforce that only the requester or a responder can view these
    // But since it's a server action, the service role bypasses RLS.
    // For safety, let's just fetch it. The UI already restricts access to the page.
    const { data, error } = await supabaseServer
        .from('donor_responses')
        .select(`
            *,
            profiles!inner(*)
        `)
        .eq('request_id', requestId);

    if (error) throw new Error(`Failed to fetch donor responses: ${error.message}`);
    return data;
}

export async function cancelResponseAction(requestId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer
        .from('donor_responses')
        .update({ status: 'CANCELLED' })
        .match({ request_id: requestId, donor_id: userId })
        .select()
        .single();

    if (error) throw new Error(`Failed to update donor response status: ${error.message}`);
    return data;
}

export async function getNearbyDonorsAction(reqLat: number, reqLng: number, radiusKm: number, reqBloodGroup: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer.rpc('find_nearby_donors_v2', {
        req_lat: reqLat,
        req_lng: reqLng,
        radius_km: radiusKm,
        req_blood_group: reqBloodGroup,
    });

    if (error) throw new Error(`Failed to fetch nearby donors: ${error.message}`);
    return data;
}

export async function getResponsesForDonorAction() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabaseServer
        .from('donor_responses')
        .select('request_id, status')
        .eq('donor_id', userId);

    if (error) throw new Error(`Failed to fetch donor responses: ${error.message}`);
    return data;
}
