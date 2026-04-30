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

## Deploy

The data store is a JSON file, so it needs a host with a persistent
filesystem (Railway, Render, Fly.io, a VPS, etc). On Vercel, swap
`lib/db.ts` for a KV/Postgres-backed implementation — the rest of the
app is unchanged.

## Entry types

- **Placement** — confirmed billings. Counted toward target.
- **Pipeline** — likely revenue still to close. Shown faded above the
  mercury fill.
- **Interview** — interviews booked / vacancy values. Tally + optional
  fee value, shown at the very top of the bar.
