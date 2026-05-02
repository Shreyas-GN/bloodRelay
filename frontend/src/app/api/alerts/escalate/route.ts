import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { AlertEngineService } from '@/services/alert-engine.service';
import type { BloodRequest } from '@/types';

export async function POST(req: Request) {
    try {
        // Authenticate cron job (e.g. Vercel CRON secret or Supabase Edge function auth)
        // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        // Find all requests that are still in SEARCHING status
        const { data: requests, error } = await supabaseServer
            .from('blood_requests')
            .select('*')
            .eq('status', 'SEARCHING');

        if (error) {
            throw error;
        }

        const now = new Date();
        let escalatedCount = 0;

        for (const reqData of requests) {
            const request = reqData as BloodRequest;
            const createdAt = new Date(request.created_at);
            const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

            // Phase 1 -> Phase 2 (after 5 minutes)
            if (request.escalation_phase === 1 && diffMinutes >= 5) {
                console.log(`[Escalation] Request ${request.id} escalating to Phase 2`);
                await AlertEngineService.executePhase2(request);
                escalatedCount++;
            }
            // Phase 2 -> Phase 3 (after 10 minutes)
            else if (request.escalation_phase === 2 && diffMinutes >= 10) {
                console.log(`[Escalation] Request ${request.id} escalating to Phase 3`);
                await AlertEngineService.executePhase3(request);
                escalatedCount++;
            }
            // Phase 3 -> Expired (after 2 hours)
            else if (request.escalation_phase === 3 && diffMinutes >= 120) {
                console.log(`[Escalation] Request ${request.id} expired`);
                await (supabaseServer as any)
                    .from('blood_requests')
                    .update({ status: 'EXPIRED' })
                    .eq('id', request.id);
                escalatedCount++;
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Processed escalation for ${escalatedCount} requests` 
        });
    } catch (error: any) {
        console.error('Escalation Error:', error);
        return NextResponse.json({ error: 'Failed to process escalations' }, { status: 500 });
    }
}
