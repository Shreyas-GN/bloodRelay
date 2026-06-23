import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tokens, title, body: msgBody, data } = body;

        if (!tokens || !tokens.length || !title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const serverKey = process.env.FIREBASE_SERVER_KEY;
        if (serverKey) {
            const fcmResp = await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=${serverKey}`,
                },
                body: JSON.stringify({
                    registration_ids: tokens,
                    notification: { title, body: msgBody },
                    data: data || {},
                }),
            });
            const fcmResult = await fcmResp.json();
            console.log(`[FCM] success=${fcmResult.success ?? 0} failure=${fcmResult.failure ?? 0}`);
        } else {
            console.log(`[FCM] FIREBASE_SERVER_KEY not set — skipping push to ${tokens.length} devices`);
        }

        return NextResponse.json({
            success: true,
            message: `Push sent to ${tokens.length} devices`,
        });
    } catch (error: any) {
        console.error('Push alert error:', error);
        return NextResponse.json({ error: 'Failed to send alert' }, { status: 500 });
    }
}
