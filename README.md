# Whereby Call

A custom video-calling web app built directly on the
[`@whereby.com/browser-sdk`](https://docs.whereby.com/) React hooks
(`useLocalMedia`, `useRoomConnection`, `VideoView`) rather than the default
embedded iframe. You generate Whereby group meetings from a dashboard and drop
straight into a custom call UI.

**Stack:** Vite · React · TypeScript · Tailwind CSS v4 (`@tailwindcss/vite`) · dark UI.

## Setup

Meeting generation calls the Whereby REST API, which needs a secret API key.
Create one under **Embedded → API keys** at [whereby.com](https://whereby.com),
then:

```bash
npm install
cp .env.example .env      # set WHEREBY_API_KEY and VITE_WHEREBY_SUBDOMAIN
npm run dev
```

`npm run build` type-checks and produces a static bundle in `dist/`.

> **The API key stays secret.** It lives in `.env` as `WHEREBY_API_KEY` (no
> `VITE_` prefix, so it is never bundled into the browser). The Vite dev server
> proxies `/api/whereby/*` to `https://api.whereby.dev` and attaches the
> `Authorization` header itself — the browser only ever talks to the same-origin
> proxy. `.env` is gitignored; never commit it. In production a Netlify function
> does the same job (see below).

## How it works

- **Dashboard** — a *New group meeting* button creates a Whereby Embedded
  meeting in `group` mode (locked) via the REST API. The last 10 meetings are
  kept in `localStorage` (most recent first). Each meeting can be shared two
  ways, toggled per card:
  - **Custom UI** — a clean, name-based invite link into this app
    (`/#<roomName>`, no escaped characters) that deep-links a visitor straight
    into the pre-join lobby as a participant (they knock). You enter via *Join as
    host*. Joining needs no API key — only the room's own key — so invited
    visitors never need one. Rebuilding the room URL from the name needs the
    account subdomain, set via the public `VITE_WHEREBY_SUBDOMAIN` env var.
  - **Whereby pre-built** — the raw host and participant room links that open
    Whereby's own experience, with copy + open.

  See [`src/lib/whereby.ts`](src/lib/whereby.ts),
  [`src/lib/roomUrl.ts`](src/lib/roomUrl.ts), and
  [`src/components/MeetingsDashboard.tsx`](src/components/MeetingsDashboard.tsx).
- **Lobby** keeps a single `useLocalMedia` mounted through the call so device
  choices carry over. It previews the camera (mirrored only for front-facing
  cameras), exposes camera/mic/speaker pickers and a speaker test tone, tracks
  toggle state as intent (the SDK exposes no enabled flag), and detects the iOS
  quirk where the mic silently fails — offering an *Enable microphone* button.
- **Knock flow** — on `room_locked` it calls `knock()` and shows a waiting
  screen; `connected` drops into the call, `knock_rejected` shows its own
  screen. Hosts see an Admit/Deny toast for anyone waiting.
- **Video grid** re-lays out live by orientation (see `columnsFor` in
  [`src/components/VideoGrid.tsx`](src/components/VideoGrid.tsx)).

## Deploy (Netlify)

A purely static host can't create meetings: the Whereby REST API blocks
browser calls with CORS, so the request must go through a server. Netlify
handles both halves — the static build and a serverless function that holds the
key.

- [`netlify.toml`](netlify.toml) sets the build (`npm run build` → `dist`) and
  the functions directory.
- [`netlify/functions/whereby.mts`](netlify/functions/whereby.mts) is the
  production twin of the dev proxy: it serves `/api/whereby/*`, attaches the
  `Authorization` header from a server-side env var, and forwards to
  `https://api.whereby.dev`. The frontend calls the same `/api/whereby/...` path
  in dev and prod, so nothing in the app changes.

**One-time setup:**

1. Connect the GitHub repo in Netlify (build settings come from `netlify.toml`).
2. In **Site settings → Environment variables**, add `WHEREBY_API_KEY` (secret,
   stays on the server) and `VITE_WHEREBY_SUBDOMAIN` (public, e.g. `funtimes`,
   baked into the build so invite links can rebuild room URLs).

The repo can still live on GitHub; Netlify just builds and hosts it. Every push
to the connected branch triggers a deploy.
