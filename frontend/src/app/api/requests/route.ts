import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { AlertEngineService } from '@/services/alert-engine.service';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // 1. Prepare data (convert lat/lng to PostGIS location)
        const { latitude, longitude, ...rest } = body;
        const requestData: any = {
            ...rest,
            status: 'SEARCHING',
            escalation_phase: 1,
            created_at: new Date().toISOString()
        };

        if (latitude && longitude) {
            requestData.location = `POINT(${longitude} ${latitude})`;
        }

        // 2. Create the request
        const { data: request, error } = await supabaseServer
            .from('blood_requests')
            .insert(requestData)
            .select()
            .single();

        if (error) {
            console.error('Request creation error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 2. Trigger Phase 1 Notifications immediately
        try {
            await AlertEngineService.executePhase1(request);
        } catch (alertError) {
            console.error('Alert Engine Phase 1 failed:', alertError);
            // We don't fail the request creation if alerts fail, but we log it.
        }

        return NextResponse.json({ success: true, request });
    } catch (error: any) {
        console.error('API Request error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
