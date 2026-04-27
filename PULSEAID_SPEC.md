# PulseAid: Platform Specification & Design Identity

## 1. Core Vision
PulseAid is a **Human-Centric Emergency Blood Coordination Platform**. Unlike generic medical apps, PulseAid is designed as a "Command Center" for life-saving coordination. It prioritizes speed, psychological trust, and community impact through an intentional, editorial-style interface.

---

## 2. Implemented Features

### 🧩 Command Center (Dashboard)
- **Bento Grid Layout**: A modular, high-density interface that organizes information spatially.
- **Live Activity Pulse**: A real-time feed showing platform events (Requests, Donor Responses, Success Stories).
- **Impact Stats**: A gamified tracker for "Lives Touched" and "Trust Points" to encourage long-term donor retention.

### 🚨 Emergency Response
- **Location-Aware Wizard**: A multi-step request flow with integrated **Photon API** for real-time hospital/location autocomplete.
- **Urgency Engine**: Visual categorization of requests (IMMEDIATE vs. TODAY vs. SCHEDULED).
- **Instant SMS Alerts**: Automated notification system that alerts patients when a donor "Can Help."

### 🩸 Donor Management
- **Availability Engine**: A high-radius toggle allowing donors to go "Invisible" or "Active" instantly.
- **Profile Onboarding**: A curated flow to capture critical blood group and location data.
- **Donor Protection**: Security measures preventing users from "Supporting" their own requests.

---

## 3. Visual Identity (Design System)

### 🎨 Color Palette
The color scheme is designed to be high-contrast and authoritative, using a singular accent to denote life and urgency.
- **Primary Accent**: `Crimson (#c0392b)` — Represents blood, life, and urgent action.
- **Structural Base**: `Zinc Palette` — A range of off-blacks (`#18181b`) and soft whites (`#fafafa`) to avoid sterile pure-black/pure-white.
- **Semantic Colors**:
  - `Emerald (#16a34a)`: Success and Availability.
  - `Amber (#d97706)`: Warnings and Non-Critical Urgency.

### ✍️ Typography Hierarchy
PulseAid uses a "Cockpit" typography approach, mixing modern sans-serifs with technical monospaced fonts.
- **Headings (Geist Sans)**: Bold, tight letter-spacing (`-0.05em`) for an editorial, premium look.
- **Body Content (Geist Sans)**: Clean and readable with increased line height.
- **Data & Technicals (Space Mono / Geist Mono)**: Used for Blood Groups, Units, Distances, and Timestamps to provide a "precise" and "technical" feel.
- **Display Style**: Large lowercase headings for a modern, approachable brand voice.

### 🧊 Materiality: The "Clay" System
Instead of flat design, PulseAid uses the **Clay** system for physical depth:
- **Radii**: Extreme rounding (`24px` for cards, `40px` for sections) for a friendly, organic feel.
- **Shadows**: Custom `shadow-clay` (soft, multi-layered) and `shadow-clay-hard` (sharp, brutalist offset for buttons).
- **Gradients**: Subtle radial overlays on cards to simulate 3D volume.

---

## 4. Interaction Principles
1. **Zero Placeholder Policy**: Every view uses realistic sample data or generated imagery to maintain the "Live" feel.
2. **Micro-Animations**: Layout transitions powered by `Framer Motion` to ensure the Bento Grid reshuffles smoothly.
3. **Grainy Texture**: A subtle 2.5% opacity noise overlay across the app to make digital surfaces feel hand-crafted.