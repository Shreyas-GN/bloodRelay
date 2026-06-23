import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();

        if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone.replace(/\s/g, ''))) {
            return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.signInWithOtp({ phone });

        if (error) {
            console.error('[OTP Send Error]', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent' });
    } catch (err: any) {
        console.error('[OTP Send Error]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
