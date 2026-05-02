import { supabaseServer } from '@/lib/supabase/server';

export class CooldownService {
    /**
     * Checks if a donor is eligible to receive an alert.
     * Criteria:
     * 1. Has not donated in the last 90 days (3 months).
     * 2. Has not been notified for any request in the last 24 hours (prevent fatigue).
     */
    static async isDonorEligible(donorId: string): Promise<boolean> {
        // 1. Check Profile-level cooldown
        const { data: profile, error } = await (supabaseServer as any)
            .from('profiles')
            .select('cooldown_until, last_donation_date')
            .eq('id', donorId)
            .single();

        if (error || !profile) return false;

        const now = new Date();
        const p = profile as any;

        // If a manual cooldown_until is set and hasn't passed
        if (p.cooldown_until && new Date(p.cooldown_until) > now) {
            return false;
        }

        // If last donation was within 90 days
        if (p.last_donation_date) {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(now.getDate() - 90);
            if (new Date(p.last_donation_date) > ninetyDaysAgo) {
                return false;
            }
        }

        // Check notification fatigue (limit to 1 notification every 24 hours per donor)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(now.getHours() - 24);

        const { count, error: countError } = await (supabaseServer as any)
            .from('notification_logs')
            .select('*', { count: 'exact', head: true })
            .eq('donor_id', donorId)
            .gte('created_at', twentyFourHoursAgo.toISOString());

        if (!countError && count && count >= 1) {
            return false;
        }

        return true;
    }

    /**
     * Update a donor's cooldown after a successful donation.
     */
    static async recordDonation(donorId: string): Promise<void> {
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

        await (supabaseServer as any)
            .from('profiles')
            .update({ 
                last_donation_date: new Date().toISOString(),
                cooldown_until: ninetyDaysFromNow.toISOString()
            })
            .eq('id', donorId);
    }
}
