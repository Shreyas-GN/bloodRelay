import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('[Clerk Webhook] CLERK_WEBHOOK_SECRET is not set');
        return new Response('Webhook secret not configured', { status: 500 });
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Missing svix headers', { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('[Clerk Webhook] Verification failed:', err);
        return new Response('Invalid signature', { status: 400 });
    }

    const eventType = evt.type;

    // user.created → create Supabase profile
    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;
        const email = email_addresses?.[0]?.email_address || null;
        const phone = phone_numbers?.[0]?.phone_number || null;
        const full_name = [first_name, last_name].filter(Boolean).join(' ') || null;

        const { error } = await (supabaseServer as any)
            .from('profiles')
            .upsert({
                id,
                full_name,
                email,
                phone,
                is_donor: false,
                is_available_donor: false,
                is_verified: false,
            }, { onConflict: 'id' });

        if (error) {
            console.error('[Clerk Webhook] Failed to create profile:', error);
            return new Response('Failed to sync user', { status: 500 });
        }

    }

    // user.updated → sync name, email, phone
    if (eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;
        const email = email_addresses?.[0]?.email_address || null;
        const phone = phone_numbers?.[0]?.phone_number || null;
        const full_name = [first_name, last_name].filter(Boolean).join(' ') || null;

        const { error } = await (supabaseServer as any)
            .from('profiles')
            .update({ full_name, email, phone })
            .eq('id', id);

        if (error) {
            console.error('[Clerk Webhook] Failed to update profile:', error);
        }

    }

    // user.deleted → cascade delete profile
    if (eventType === 'user.deleted') {
        const { id } = evt.data;
        if (!id) return new Response('', { status: 200 });

        const { error } = await (supabaseServer as any)
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[Clerk Webhook] Failed to delete profile:', error);
        }

    }

    return new Response('', { status: 200 });
}
