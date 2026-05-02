# BloodReach

BloodReach is a real-time emergency coordination platform designed to connect families in urgent need of blood with compatible donors in their immediate vicinity.

The platform exists to solve the critical inefficiency of medical emergencies where time is lost manually broadcasting requests across social networks. By providing a structured, direct coordination system, BloodReach eliminates communication noise and reduces the time required to secure a donor during life-critical situations.

## Core Features

*   **Natural Language Emergency Parsing**: Users can input raw, unstructured text describing their emergency. The system utilizes Llama-3 to instantly extract critical parameters (blood group, urgency level, location, and required units), automatically structuring the data without requiring the user to navigate complex forms during a crisis.
*   **Precision Geo-Alerting**: The notification engine evaluates donor proximity and blood group compatibility. Alerts are only dispatched to eligible donors within a defined radius of the hospital, preventing alert fatigue and ensuring high relevance.
*   **Donor Integrity and Cooldown System**: To protect donor health, the platform enforces medical-grade recovery cooldowns. Donors can also manually toggle their availability to prevent notifications when they are unable to assist.
*   **Real-Time Dashboard**: A centralized interface that tracks active emergency requests, donor responses, and network activity through live database subscriptions.

## Architecture

BloodReach is architected for speed, reliability, and real-time data synchronization.

*   **Frontend**: Next.js (App Router) combined with Tailwind CSS. The design system prioritizes minimal cognitive load, utilizing high-contrast typography and a neutral palette to ensure critical information is immediately accessible.
*   **Backend & Data Layer**: Supabase provides the primary PostgreSQL database and Realtime engine. Database webhooks and edge functions handle the asynchronous processing of donor matching and notification dispatch.
*   **AI Service**: Groq API integrated with Llama-3 handles the low-latency natural language processing required for the emergency entry flow.
*   **Authentication**: Clerk is utilized for secure, session-based identity management across the platform.

## Technical Decisions

*   **Supabase Realtime over Polling**: To ensure users see donor responses immediately, the dashboard subscribes directly to PostgreSQL row-level changes via Supabase Realtime, eliminating the overhead and latency of HTTP polling.
*   **Server-Side AI Parsing**: The natural language parsing is executed on a secure Next.js API route rather than the client. This protects the Groq API keys and ensures consistent performance regardless of the user's device capabilities.
*   **CSS Variables for Theming**: The design system relies strictly on CSS variables rather than hardcoded Tailwind utility values. This ensures absolute consistency across the application and prevents design regression.

## Local Development Setup

### Prerequisites
*   Node.js (v18 or higher)
*   A Supabase project (for PostgreSQL and Realtime)
*   A Clerk application (for Authentication)
*   A Groq API key (for AI parsing)

### Installation Steps

1.  Clone the repository and navigate to the frontend directory:
    ```bash
    git clone https://github.com/Shreyas-GN/BloodReach.git
    cd BloodReach/frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Create a `.env.local` file in the `frontend` directory and provide the necessary keys:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    
    GROQ_API_KEY=your_groq_api_key
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Disclaimer

BloodReach is an open-source coordination utility. It does not provide medical services, advice, or diagnostics. All medical procedures and transfusions must be handled by certified professionals in clinical environments.
