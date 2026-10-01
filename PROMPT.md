Build a custom video calling web app on top of Whereby Embedded, using
the `@whereby.com/browser-sdk` React hooks (`useLocalMedia`,
`useRoomConnection`, `VideoView`) instead of the default prebuilt web
component.

**Stack**: Vite, React, TypeScript, Tailwind CSS v4 (via
`@tailwindcss/vite`), dark UI by default. There is no application backend —
the only server-side piece is a thin proxy that holds the Whereby API key (the
Vite dev server locally, a Netlify function in production; see below). The
Whereby Embedded docs are at https://docs.whereby.com/, use them as the
reference for the `browser-sdk` hooks, the REST API, and any Whereby-specific
behavior below.

**Creating rooms**: the home screen is a dashboard, not a URL paste box. A
"Create room" button creates a Whereby Embedded room (a meeting in group mode)
via the REST API (`POST https://api.whereby.dev/v1/meetings` with
`roomMode: "group"`, `isLocked: true`, and `fields: ["hostRoomUrl"]`, plus an
`endDate`). Rooms are created locked so participants always knock and the host
admits them; without `isLocked` Whereby defaults to unlocked and nobody knocks.
Keep the last 10 created rooms in a list (most recent first, persisted in
localStorage), each with a remove button. Add a no-referrer meta tag, since the
links contain a `roomKey` that works like a password.

Each room can be shared two ways, toggled per card (keep the card height steady
across the toggle):

- **Custom UI** — a clean, name-based invite link into this app (`/#<roomName>`,
  with no escaped characters), plus a "Join as host" button for the person
  running the room. The invite is participant-only — it deep-links straight into
  this app's pre-join lobby and knocks — because the host key can't ride in a
  clean link. On load *and* on `hashchange`, read the fragment and rebuild the
  room URL as `https://<subdomain>.whereby.com/<roomName>`, where the subdomain
  comes from a public `VITE_WHEREBY_SUBDOMAIN` build-time env var (it's in every
  room URL, so it's not secret). Joining needs no API key (only the room's own
  key), so invited visitors never need one — only the person creating rooms does.
- **Whereby pre-built** — the raw host and participant room links (`hostRoomUrl`
  joins immediately and can admit others; `roomUrl` is the participant link),
  each with a copy button and an open-in-new-tab button, for Whereby's own
  prebuilt experience.

**API key / keeping it secret**: creating rooms needs a secret Whereby
REST API key. It must never end up in the browser bundle or in git. Put it
in a `.env` file as `WHEREBY_API_KEY` (no `VITE_` prefix), gitignore `.env`,
and ship a `.env.example`. Configure the Vite dev server to proxy
`/api/whereby/*` to `https://api.whereby.dev`, injecting the
`Authorization: Bearer <key>` header. The browser only ever calls the
same-origin proxy path, so the key stays in the dev-server process and CORS
(this is a server-to-server API) is a non-issue. Because a static build has
no proxy, room generation only works while running the dev server or behind
the equivalent serverless function in production (see Deployment). Handle a
missing/invalid key with a clear message telling the user to set
`WHEREBY_API_KEY` and restart.

**Pre-join lobby**: after picking a link to join, show a live camera
preview, mute/camera toggles, camera/mic/speaker device pickers, a button
that plays a short test tone through the speaker, and a name field
remembered across visits. The primary button reads "Knock" for a guest
(a keyless participant link) and "Join call" for the host (a link with a
`roomKey`). Show real device names in the pickers as soon as access is granted,
not only after a refresh: browsers blank out device labels until permission is
granted, so re-enumerate devices when the local stream first goes live (and on
`devicechange`) rather than relying on the one-time list. The mute and camera toggles must reflect their real on/off state
and flip reliably in both directions — a camera you turn off must turn back on
again. Note that `useLocalMedia` exposes no "enabled" flag and toggling only
mutates the track (or stops and re-acquires it) without changing the stream
reference, so track the on/off intent yourself rather than reading it back off
`localStream`. Keep `useLocalMedia` mounted through the call itself so these
choices carry over. Only mirror the camera preview for front-facing cameras,
not a rear camera on a phone. Also handle this iOS quirk: `getUserMedia` can
silently fail to get a microphone while the camera still works fine, no error,
no prompt, just no audio. It can't be re-requested from the page, so detect it
(video present, no live audio track) and show a banner telling the user how to
re-enable microphone access in iOS Settings.

**Knock flow**: the host link joins immediately; the participant link waits
for the host to let them in when the room is locked. Using
`useRoomConnection`, when `connectionStatus` is `'room_locked'`, call
`knock()` and show a waiting screen with a cancel button. When it becomes
`'connected'`, drop into the call automatically. Handle `'knock_rejected'`
as its own screen. On the host's side, show a small toast for anyone in
`waitingParticipants`, with Admit/Deny buttons.

**In-call UI**: don't show the raw room name (a UUID) in the header — show a
generic label like "Whereby-powered room", a participant count, and an
"Invite" button that copies the participant invite link (the name-only link, so
it's correct whether the host or a participant joined).

**Video grid**: lay out video tiles differently depending on orientation,
updating live as the window resizes or a phone rotates. Portrait: 1-2 people
in a single column, 3+ in two columns. Landscape: 1 person full-size, 2-4 in
two columns, 5-9 in three, more than that in four.

**Controls and icons**: use Material Design icons (via `react-icons`, outlined
variants) throughout, rendered as inline SVGs styled with `currentColor` — no
icon web font or runtime CDN. Style the mute/camera "off" states with a soft
red (subtle shadow and inset ring, a small press animation) instead of a harsh
flat fill. In the call, give the hang-up button a distinct, wider pill shape
with a soft red glow and Material's end-call icon, so it reads clearly apart
from the round mute/camera toggles. Also give the app a simple favicon and a
descriptive page title.

**Deployment**: deploy to Netlify (a static host can't create rooms — the
Whereby REST API blocks browser calls with CORS, so a server-side hop is
required). Ship a `netlify.toml` (build `npm run build`, publish `dist`) and a
Functions-v2 serverless function at `/api/whereby/*` that mirrors the dev
proxy: it reads `WHEREBY_API_KEY` from Netlify's server-side environment
variables and forwards the request to `https://api.whereby.dev` with the auth
header attached. The frontend keeps calling the same `/api/whereby/...` path in
both dev and prod. Set `WHEREBY_API_KEY` (secret) and `VITE_WHEREBY_SUBDOMAIN`
(public) in Netlify's environment, never in the repo or the bundle.
