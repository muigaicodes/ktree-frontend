# Knowledge Tree — Next.js Frontend

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com, connect your GitHub repo
3. Click "Deploy" — Vercel auto-detects Next.js, no config needed
4. Set your custom domain (ktree.pro) in Vercel dashboard → Settings → Domains

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Design tokens (--kt-green, --kt-dark, etc.)
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Homepage — assembles all sections
├── components/
│   ├── Navbar.tsx           # Sticky nav with smooth scroll links
│   ├── Hero.tsx             # "Extract insights" + YouTube URL input
│   ├── Journeys.tsx         # Ready-made journeys grid + filter tags + waitlist modal
│   ├── HowItWorks.tsx       # 3-step flow + WhatsApp phone mockup
│   ├── Creators.tsx         # YouTube creator pitch section
│   └── Footer.tsx           # Footer
├── lib/
│   ├── api.ts               # API helpers — CONNECT YOUR BACKEND HERE
│   └── journeys.ts          # Journey data (titles, authors, descriptions)
public/
├── logo.png                 # Full logo
├── logo-symbol.png          # Symbol only
└── favicon.png              # Favicon
```

## What the CTO Needs to Do

### 1. Connect the YouTube extraction pipeline

Open src/lib/api.ts → find extractInsights(). Replace the placeholder with a real API call to your pipeline backend.

### 2. Signup form

Currently POSTs to your existing n8n webhook then redirects to WhatsApp. Update endpoints in src/lib/api.ts if backend changes.

### 3. Waitlist notification

Modal POSTs to your existing n8n waitlist webhook. Same as V1.

### 4. Pages still needed

- /signup — "Create your learning stack" form
- /processing — Loading state while YouTube video processes

### 5. Update journeys

Edit src/lib/journeys.ts to add/remove journeys.

## Design Tokens

All in globals.css:
- --kt-green: #0B4A24 (primary)
- --kt-green-soft: #E3F5EC (light bg)
- --kt-dark: #071822 (headings)
- --kt-muted: #6B7B8A (secondary text)
- --kt-border: #E1E6EC (borders)
- --kt-radius-lg: 18px (cards)
- --kt-radius-xl: 24px (large cards)

## Tech Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS
- No external UI libraries — lightweight, fast
