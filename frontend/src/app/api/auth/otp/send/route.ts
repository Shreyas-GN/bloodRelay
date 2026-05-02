import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { TelegramService } from '@/services/telegram.service';

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();

        if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone.replace(/\s/g, ''))) {
            return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min TTL

        // Store OTP in Supabase (upsert per phone)
        const { error } = await (supabaseServer as any)
            .from('otp_verifications')
            .upsert({
                phone,
                otp_code: otp,
                expires_at: expiresAt,
                verified: false
            }, { onConflict: 'phone' });

        if (error) {
            console.error('[OTP Send Error]', error);
            return NextResponse.json({ error: 'Failed to store OTP' }, { status: 500 });
        }

        // Send OTP via Telegram (since it's our free messaging provider)
        await TelegramService.sendMessage(
            `🔐 *BloodReach Verification Code*\n\nYour OTP is: *${otp}*\n\n_Valid for 10 minutes. Do not share this code._`
        );

        // In production: send to user's Telegram DM via their chat_id
        // For now, broadcasts to the admin channel. 
        // When you have per-user Telegram chat IDs, pass them here.
        console.log(`[OTP] ${phone} → ${otp}`);

        return NextResponse.json({ success: true, message: 'OTP sent via Telegram' });
    } catch (err: any) {
        console.error('[OTP Send Error]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
