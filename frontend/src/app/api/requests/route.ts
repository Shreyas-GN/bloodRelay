import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // 1. Get Clerk token for backend authentication
        let token = 'mock-token-123';
        try {
            const { getToken } = await auth();
            const clerkToken = await getToken();
            if (clerkToken) {
                token = clerkToken;
            }
        } catch (e) {
            console.log("Clerk auth() bypassed in local dev mode:", e);
        }

        const body = await req.json();
        
        // 2. Forward the request to the Django Backend
        // Inside the Docker network, we use the service name 'backend'
        const DJANGO_BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8000';
        
        const response = await fetch(`${DJANGO_BACKEND_URL}/api/requests/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend error:', data);
            return NextResponse.json(
                { error: data.error || 'Backend failed to process request' }, 
                { status: response.status }
            );
        }

        // 3. Return the response from Django (which includes matching engine status)
        return NextResponse.json({ 
            success: true, 
            request: data.request,
            matching: data.matching_triggered 
        });

    } catch (error: any) {
        console.error('Frontend API Route error:', error);
        return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
    }
}
