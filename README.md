# Whereby Call

A custom video-calling web app built directly on the
[`@whereby.com/browser-sdk`](https://docs.whereby.com/) React hooks
(`useLocalMedia`, `useRoomConnection`, `VideoView`) rather than the default
embedded iframe. No backend — it only ever joins a room URL created elsewhere.

**Stack:** Vite · React · TypeScript · Tailwind CSS v4 (`@tailwindcss/vite`) · dark UI.

## Develop

```bash
npm install
npm run dev
```

`npm run build` type-checks and produces a static bundle in `dist/`.

## How it works

- **Room links live in the URL fragment** (`/#url=<roomUrl>`), never a query
  string, so the room key (which acts like a password) is never sent to a
  server or written to a log. A `no-referrer` meta tag backs this up. On load
  the app reads the fragment and jumps straight to the lobby.
- **Join form** validates the link, keeps the last 10 rooms in `localStorage`
  (deduplicated, most-recent-first) and offers them as a dropdown.
- **Lobby** keeps a single `useLocalMedia` mounted through the call so device
  choices carry over. It previews the camera (mirrored only for front-facing
  cameras), exposes camera/mic/speaker pickers and a speaker test tone, and
  detects the iOS quirk where the mic silently fails — offering an *Enable
  microphone* button that re-requests access.
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
