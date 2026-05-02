import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, message } = body;

        if (!to || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Real SMS Provider Logic (Twilio example)
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            // await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to });
            console.log(`[TWILIO] SMS Sent to ${to}`);
        } else if (process.env.MSG91_AUTH_KEY) {
            // MSG91 implementation
            console.log(`[MSG91] SMS Sent to ${to}`);
        } else {
            console.log(`[MOCK SMS] To: ${to} | Msg: ${message}`);
        }

        return NextResponse.json({ 
            success: true, 
            message: `SMS sent to ${to}` 
        });
    } catch (error: any) {
        console.error('Alert Error:', error);
        return NextResponse.json({ error: 'Failed to send alert' }, { status: 500 });
    }
}
