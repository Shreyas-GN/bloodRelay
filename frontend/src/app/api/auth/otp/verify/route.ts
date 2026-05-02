import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
        }

        // Fetch stored OTP
        const { data, error } = await (supabaseServer as any)
            .from('otp_verifications')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'No OTP found for this number. Please request a new one.' }, { status: 404 });
        }

        // Check expiry
        if (new Date(data.expires_at) < new Date()) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 410 });
        }

        // Check if already verified
        if (data.verified) {
            return NextResponse.json({ error: 'This OTP has already been used.' }, { status: 409 });
        }

        // Validate OTP
        if (data.otp_code !== otp.trim()) {
            return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 401 });
        }

        // Mark as verified
        await (supabaseServer as any)
            .from('otp_verifications')
            .update({ verified: true })
            .eq('phone', phone);

        // Also mark the user's profile as verified if they have one
        await (supabaseServer as any)
            .from('profiles')
            .update({ is_verified: true })
            .eq('phone', phone);

        return NextResponse.json({ success: true, verified: true });
    } catch (err: any) {
        console.error('[OTP Verify Error]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
