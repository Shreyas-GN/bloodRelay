"use server";

import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase/server';
import { ActivityService } from '@/services/activity.service';

export async function saveOnboardingProfile(data: {
    blood_group: string;
    phone: string;
    city: string;
    is_available_donor: boolean;
    latitude: number | null;
    longitude: number | null;
    location: string | null;
    full_name: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const profileData = {
        full_name: data.full_name,
        blood_group: data.blood_group,
        phone: data.phone,
        city: data.city,
        is_available_donor: data.is_available_donor,
        is_donor: data.is_available_donor,
        profile_completed: true,
        latitude: data.latitude,
        longitude: data.longitude,
        location: data.location,
    };

    const { error } = await (supabaseServer as any)
        .from('profiles')
        .upsert({ id: userId, ...profileData });

    if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
    }

    await ActivityService.log(userId, 'profile_completed', 'Completed donor profile setup.', null, supabaseServer as any);
    
    return { success: true };
}
