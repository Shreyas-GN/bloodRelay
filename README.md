# 🩸 PulseAid

PulseAid is an open-source platform built to solve a problem that shouldn't exist: people panicking to find blood during medical emergencies. 

Instead of relying on scattered WhatsApp forwards and social media posts, PulseAid connects families directly with willing, matching blood donors nearby. It's designed to be fast, calm, and incredibly direct because in an emergency, every minute counts.

---

## Why we built this

If you've ever had a family member in the ICU needing blood, you know the drill: you create a frantic poster, blast it across every group chat, and hope for the best. 

It's chaotic, stressful, and highly inefficient. 

PulseAid replaces that chaos with a managed, live network. When you need blood, you post a request. Only donors nearby who match the required blood type get notified. If they accept, you get their phone number instantly. No middlemen. No delays.

---

## How it works

1. **Post the need**: A patient's family posts an emergency request (blood group, hospital, units needed).
2. **Alert nearby donors**: PulseAid pings registered donors within a 20km radius who have that specific blood type and are currently marked as available.
3. **Direct connection**: A donor taps "Accept". Their contact info is revealed to the requester. They call each other and coordinate. Done.

---

## Key Features

- **No Spam**: Donors are only alerted if their specific blood type is needed nearby.
- **Availability Toggle**: Going on vacation? Feeling sick? Donors can toggle their availability off so they don't get pinged when they can't help.
- **Live Command Center**: A clean, "cockpit-style" dashboard that shows what's happening in the network right now.
- **Privacy First**: We don't have built-in chat. Once a match is made, you get a phone number to handle things directly.

---

## Tech Stack

This project is built using tools that let us move fast and keep things reliable:
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Framer Motion for that smooth, premium feel.
- **Backend**: Python, Django 5 (REST Framework), PostgreSQL.
- **Auth**: Clerk (because building auth from scratch in an emergency app is a bad idea).

---

## Running it locally

Want to contribute or run your own instance? Here's how to get it spinning on your machine.

### The Backend (Django)
1. `cd backend`
2. Create your virtual environment: `python -m venv venv` and activate it (e.g., `source venv/bin/activate`).
3. Install the dependencies: `pip install -r requirements.txt`
4. Set up your `.env` file (you'll need your database credentials).
5. Run migrations: `python manage.py migrate --settings=config.settings_local`
6. Start the server: `python manage.py runserver --settings=config.settings_local`

### The Frontend (Next.js)
1. `cd frontend`
2. Install the packages: `npm install`
3. Set up your `.env.local` file (you'll need your Clerk keys here).
4. Start the dev server: `npm run dev`

---

## What's next?

We're constantly trying to make this better. Our current roadmap includes:
- Building out proper SMS alerts so donors don't even need the app open.
- Better map integrations so donors can see exactly how far the hospital is before accepting.
- A smart cooldown system to automatically pause a donor's availability for a few months after they donate.

## License
MIT License. Free forever. Feel free to use this code to save lives in your own community.
