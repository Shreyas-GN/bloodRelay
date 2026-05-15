# 🩸 BloodReach - Emergency Blood Coordination Platform

BloodReach is an advanced emergency blood coordination platform designed to instantly connect hospitals, patients, and donors. Built with a modern, microservice-based architecture, it features real-time geospatial tracking, automated multi-tiered notification escalation, and secure API infrastructure.

---

## 🚀 Key Features

*   **Geospatial Matching Engine**: High-performance, asynchronous PostGIS queries to locate the nearest available donors instantly.
*   **Tiered Escalation Protocol**: Automated background tasks that expand the search radius (5km → 15km → 25km) over time if a request remains unfulfilled.
*   **Real-time Coordination**: End-to-end status tracking (Searching, Donor Accepted, Fulfilled).
*   **Secure Authentication**: JWT-based stateless authentication powered by Clerk.

---

## 🏗️ Architecture Overview

The system runs on a highly decoupled microservice architecture:

1.  **Frontend (Next.js)**: Client-side UI built for speed and responsiveness, deployed to Vercel.
2.  **Core Backend (Django + DRF)**: The primary API gateway handling business logic, data validation, and request persistence.
3.  **Matching Engine (FastAPI)**: A dedicated, asynchronous microservice handling raw spatial SQL queries and task orchestration via `BackgroundTasks`.
4.  **Database (Supabase)**: A centralized PostgreSQL database mapped across all services with `managed=False` in Django.

### 🔄 Emergency Flow
`User (Next.js) ➔ API Request (Django) ➔ Persist to DB ➔ Async Trigger (FastAPI) ➔ Geospatial Match (PostGIS) ➔ Notify Donors`

---

## 🐳 Running Locally (Docker Compose)

The entire stack is containerized for seamless local development.

### Prerequisites
*   Docker & Docker Desktop
*   A Supabase project (with PostGIS enabled)
*   A Clerk application

### 1. Environment Setup
Copy the placeholder environment file to set up your secrets safely:
```bash
cp .env.example .env
```
*(Fill out the required API keys and connection strings in your local `.env` files. Ensure you do not commit these!)*

### 2. Start the Stack
From the root directory, simply run:
```bash
docker-compose up --build
```

**Services will be available at:**
*   Frontend: `http://localhost:3000`
*   Django API: `http://localhost:8000`
*   FastAPI Engine: `http://localhost:9000`

---

## 🌍 Production Deployment

The architecture is built for horizontal scalability and safe deployment on standard PaaS providers.

### 1. Database (Supabase)
*   Ensure your Supabase PostgreSQL instance has the PostGIS extension enabled.
*   **Important**: Use the **Connection Pooler URL (Port 6543)** in production to prevent connection exhaustion.

### 2. Matching Engine (FastAPI on Render / Railway)
*   Deploy using the `matching-engine/Dockerfile`.
*   The `CMD` automatically binds to the `$PORT` environment variable.
*   **Required ENV**: `DATABASE_URL`, `CORS_ORIGINS`.

### 3. Core Backend (Django on Render / Railway)
*   Deploy using the `backend/Dockerfile` (Uses Gunicorn).
*   **Required ENV**: `DATABASE_URL`, `DJANGO_SECRET_KEY`, `CLERK_SECRET_KEY`, `MATCHING_ENGINE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.

### 4. Frontend (Next.js on Vercel)
*   Deploy standard Next.js build.
*   **Required ENV**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `BACKEND_URL`.

---

## 🛡️ Security Posture

*   **Zero Exposed Secrets**: All sensitive tokens and connection strings are securely injected via CI/CD environment variables.
*   **Cross-Origin Protection**: Strict, environment-driven CORS policies for Django and FastAPI.
*   **No Direct DB Access**: The frontend routes all mutations through the secured Django API gateway, preventing direct Supabase exposure.

---

*BloodReach is built to save lives through code.*

