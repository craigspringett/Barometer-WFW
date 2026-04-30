# Barometer-WFW

Live sales target barometer for the WhoFoundWho team.

The team needs **£20k each** and **£100k together** to unlock the
**Summer Team Trip Away**. The public page shows a giant animated
thermometer and per-person bars; the admin page lets the boss log
placements, pipeline and interviews in seconds.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- File-based JSON store (`data/db.json`)
- HMAC-signed admin cookie (single password)

## Run locally

```bash
npm install
cp .env.example .env.local   # then edit ADMIN_PASSWORD / ADMIN_SECRET
npm run dev
```

Open http://localhost:3000 — admin lives at http://localhost:3000/admin.

## Configure

- **Password** — set `ADMIN_PASSWORD` in `.env.local`.
- **Cookie secret** — set `ADMIN_SECRET` to anything long & random.
- **Targets / prize** — change inline from the admin dashboard, or
  edit `data/db.json` directly.
- **Team photos** — drop replacement images into `public/team/` using
  the same filenames (`luke.svg`, `anja.svg`, …) or update
  `lib/team.ts`. PNG / JPG / WEBP all work.

## Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this).
2. Sign in to https://vercel.com with GitHub and click **Add New → Project**.
3. Import `Barometer-WFW`. Vercel auto-detects Next.js — leave the defaults.
4. Before deploying, expand **Environment Variables** and add:
   - `ADMIN_PASSWORD` — your chosen password
   - `ADMIN_SECRET` — any long random string
5. Click **Deploy**.
6. Once deployed, open the project → **Storage** tab → **Create Database** →
   pick **Upstash for Redis** (Marketplace) → connect it to this project.
   Vercel auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` — the app
   picks them up automatically. Click **Redeploy** once after connecting.

That's it. The barometer is at the root URL, the admin lives at `/admin`.

### Other hosts

The app falls back to a local `data/db.json` file when no Redis env vars are
present, so it also runs on anything with a persistent disk (Railway, Render,
Fly.io, a VPS).

## Entry types

- **Placement** — confirmed billings. Counted toward target.
- **Pipeline** — likely revenue still to close. Shown faded above the
  mercury fill.
- **Interview** — interviews booked / vacancy values. Tally + optional
  fee value, shown at the very top of the bar.
