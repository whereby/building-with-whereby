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
cp .env.example .env      # then paste your key into WHEREBY_API_KEY
npm run dev
```

`npm run build` type-checks and produces a static bundle in `dist/`.

> **The API key stays secret.** It lives in `.env` as `WHEREBY_API_KEY` (no
> `VITE_` prefix, so it is never bundled into the browser). The Vite dev server
> proxies `/api/whereby/*` to `https://api.whereby.dev` and attaches the
> `Authorization` header itself — the browser only ever talks to the same-origin
> proxy. `.env` is gitignored; never commit it.

## How it works

- **Dashboard** — a *New group meeting* button creates a Whereby Embedded
  meeting in `group` mode via the REST API. The last 10 meetings are kept in
  `localStorage` (most recent first); each shows a **host link** (joins
  immediately, can admit others) and a **participant link**, each with copy and
  Join buttons, plus a remove button. See
  [`src/lib/whereby.ts`](src/lib/whereby.ts) and
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

## Deploy (GitHub Pages)

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds and publishes to GitHub Pages. Because project sites are served
from a subpath (`https://<user>.github.io/<repo>/`), the workflow passes that
path to Vite via the `GITHUB_PAGES_BASE` env var, which
[`vite.config.ts`](vite.config.ts) reads as `base`.

**One-time setup:** in the repository's **Settings → Pages**, set **Source** to
**GitHub Actions**.

> **Note:** the deployed static site renders the UI but **cannot generate
> meetings** — there is no dev-server proxy in production to hold the API key.
> To create meetings from a deployed site you'd add a small serverless function
> (e.g. Netlify/Vercel/Cloudflare) that performs the same proxied, authenticated
> `POST /v1/meetings` call. Joining a meeting link works fine on the static site.
