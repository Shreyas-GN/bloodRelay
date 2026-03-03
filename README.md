# PulseAid: Emergency Blood Donation Platform

PulseAid is a high-performance coordination platform designed to bridge the gap between critical blood requirements and volunteer donors in real-time. By implementing an on-demand response model, PulseAid optimizes medical logistics to ensure life-saving resources reach those in need without delay.

---

## 1. Problem Statement
In emergency medical situations, the process of securing blood is often decentralized and inefficient. Patients frequently depend on fragmented social media broadcasts and manual donor lists, leading to:
- **Time Inefficiency**: Critical delays caused by manual verification and coordination.
- **Coordination Gaps**: A lack of real-time visibility into donor availability and location.
- **Communication Barriers**: Difficulties in establishing immediate, secure contact between donors and families.

## 2. The PulseAid Solution
PulseAid transforms blood donation into an active, managed ecosystem. By leveraging real-time matching and automated notification systems, the platform provides:
- **Instantaneous Matching**: Automated identification of compatible donors within the patient's immediate vicinity.
- **On-Demand Acceptance**: A streamlined workflow allowing donors to accept requests with a single interaction.
- **Secure Communication Bridge**: Direct telephonic coordination features enabled immediately upon request acceptance.

---

## 3. Core Functionality

### 3.1 Donor Infrastructure
- **Responsive Dashboard**: Live feed of matching requests filtered by blood group and status.
- **Availability Management**: Granular control over donor status to ensure requests are only routed to active participants.
- **Intelligent Cooldown**: Automated status management to prioritize donor health following a successful contribution.

### 3.2 Requester Framework
- **Emergency Wizard**: A standardized interface for submitting critical patient data, hospital location, and urgency levels.
- **Urgency Classification**: Categorization of requests (e.g., Immediate, Today) to manage responder priorities.
- **Status Lifecycle**: Real-time tracking from initial creation through donor assignment and task completion.

### 3.3 Notification Engine
- **Event-Driven Alerts**: Automated notification delivery to compatible and available donors.
- **Persistent Management**: A centralized notification center for tracking historical and active emergency alerts.

---

## 4. Technical Architecture

PulseAid utilizes a modern, enterprise-grade technology stack optimized for reliability and low latency:

| Layer | Component | Implementation Detail |
|---|---|---|
| Frontend | Next.js 16 | React 19 framework providing server-side rendering and optimized client-side interactions. |
| Styling | Tailwind CSS v4 | Utility-first design system ensuring a consistent and responsive user interface. |
| Backend | Django 5 | Robust RESTful API architecture built on the Django REST Framework. |
| Identity | Clerk | Managed authentication and authorization using secure JWT-based identity tokens. |
| Database | PostgreSQL | Relational data management optimized for complex matching queries. |
| Animation | Framer Motion | Declarative animations to enhance user feedback and interaction clarity. |

### Project Directory Structure
```
PulseAid/
├── frontend/                  # Next.js Application
│   ├── src/app/               # Routing and Page Architecture
│   ├── src/components/        # Reusable UI Design Components
│   ├── src/lib/               # API Integration and Utility Functions
│   └── src/types/             # Centralized TypeScript Type Definitions
└── backend/                   # Django REST API
    ├── blood_requests/        # Request Lifecycle and Assignment Logic
    ├── users/                 # Profile Management and Authentication Hooks
    ├── matching/              # Real-Time Donor Recommendation Algorithms
    └── notifications/         # Automated Alerting and Message Delivery
```

---

## 5. Deployment and Setup

### 5.1 System Requirements
- Node.js 18 or higher
- Python 3.11 or higher
- Clerk Authentication API Credentials

### 5.2 Backend Installation
1. Navigate to the `backend` directory.
2. Initialize a Python virtual environment: `python -m venv venv`.
3. Activate the environment: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows).
4. Install dependencies: `pip install -r requirements.txt`.
5. Configure environmental variables using `.env`.
6. Apply database migrations: `python manage.py migrate --settings=config.settings_local`.
7. Execute the server: `python manage.py runserver --settings=config.settings_local`.

### 5.3 Frontend Installation
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Configure local environment variables in `.env.local`.
4. Execute development server: `npm run dev`.

---

## 6. Strategic Roadmap
The future development of PulseAid focuses on enhancing the precision and reach of the platform:
1. **Predictive Analytics**: Implementing machine learning models to anticipate blood group demand based on regional historical data.
2. **Geospatial Proximity**: Advanced GPS-based matching calculating real-time travel durations.
3. **Medical Facility Integration**: Direct API connections with hospital inventory systems for a hybrid donation model.
4. **Global Interoperability**: Modular architecture allowing for rapid deployment in diverse geographical and regulatory environments.
5. **Resilient Connectivity**: Implementation of Progressive Web App (PWA) features for reliable performance in low-connectivity areas.

---

## 7. License
PulseAid is distributed under the MIT License.
