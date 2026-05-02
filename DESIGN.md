# BloodReach Design System

## 1. Product Context & Philosophy

BloodReach is a **real-time emergency coordination platform** that connects people who urgently need blood with nearby donors. 

Users are often under stress, in a time-sensitive situation, and not thinking clearly. The interface is designed to:
- Reduce cognitive load.
- Prioritize clarity over creativity.
- Feel calm, not overwhelming.
- Feel trustworthy immediately.

It should feel like a reliable healthcare system or an emergency coordination tool, not a startup landing page or a flashy SaaS product.

## 2. Visual Design System

### 2.1 Overall Tone
- Calm
- Minimal
- Professional
- Human-centered
- Editorial (not marketing-heavy)

**Avoid:** Hype, aggressive urgency visuals, loud colors, “startup flashy” style.

### 2.2 Color System

**Primary Accent:**
- Deep red (`#B91C1C`) — Used ONLY for CTAs and key highlights.

**Supporting Palette:**
- Neutral whites (`#FAFAFA` / `#F5F5F5` / `#FFFFFF`)
- Soft grays (`#6B7280` / `#E5E7EB`)
- Dark neutral text (`#111827`)

**Rules:**
- Avoid bright red.
- No gradients.
- No multiple accent colors.

### 2.3 Typography

- **Font Family:** Clean sans-serif (Inter / Geist style).
- **Strong hierarchy:**
  - **H1:** Large (40–56px), tight line height (1.1).
  - **H2:** 28–36px, line height 1.2.
  - **Body:** 16–18px, relaxed spacing (1.6).
- **Rules:**
  - Limit line length (max 65–75 characters) for readability.
  - Avoid dense text blocks.
  - Prioritize readability over style.

### 2.4 Spacing System

- **Section spacing:** 96px–128px vertical padding.
- **Internal spacing:** Consistent 16px / 24px / 32px scale.
- **Max content width:**
  - Text: 640–720px.
  - Full layout: 1100–1200px.
- **Rules:** Whitespace is CRITICAL. Do not compress layout.

### 2.5 Components

- **Buttons:** Rounded (6–10px radius), subtle hover state (color shift), no heavy shadows.
- **Cards:** Minimal borders or very soft shadows (`rgba(0,0,0,0.03)`). Avoid glassmorphism or heavy effects.
- **Icons:** Line icons only. Small, supportive (not decorative).

## 3. Page Structure Rules

### Section 1: Hero
- Centered vertically and horizontally.
- No images required.
- Headline (max 2 lines), Subheadline (max 2 lines).
- Two CTAs side-by-side: "Request Blood" (Primary) and "Become a Donor" (Secondary).
- Micro trust text below.

### Section 2: Context (Problem)
- Left-aligned text block, narrow width (~600px).
- Describe real-world problem with a calm, factual tone.
- No icons, no cards.

### Section 3: How it Works
- Centered heading.
- 3-column grid. Each column: small icon, step title, short description.

### Section 4: Differentiation
- 2-column split.
- Left: strong headline, short intro text.
- Right: vertical feature list (3–4 items).
- Text-led design, avoid heavy visuals.

### Section 5: Human / Trust Layer
- Centered, full-width breathing space.
- Calm explanation of purpose to reduce emotional pressure.
- No icons, no cards.

### Section 6: Donor CTA Block
- Centered container, slightly different background tone (e.g., `#F3F4F6`).
- Donor message and single CTA button.

### Section 7: Final CTA
- Simple, bold, slightly higher contrast background (white if previous was gray).
- Short headline, two CTAs.

### Section 8: Footer
- Include Privacy Policy, Terms of Service, Contact.
- Must include disclaimer: "BloodReach is a coordination platform and does not provide medical services."

## 4. Critical Design Constraints

**STRICTLY AVOID:**
- Loud gradients
- Neon colors
- Excessive animations
- Large illustrations dominating layout
- Overly rounded or playful UI
- Dashboard-style clutter
- AI-generated visual clichés
