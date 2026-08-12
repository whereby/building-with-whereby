Build a custom video calling web app on top of Whereby Embedded, using
the `@whereby.com/browser-sdk` React hooks (`useLocalMedia`,
`useRoomConnection`, `VideoView`) instead of the default embedded
iframe.

**Stack**: Vite, React, TypeScript, Tailwind CSS v4 (via
`@tailwindcss/vite`), dark UI by default. No backend of any kind, this
app only ever joins a room URL that was created elsewhere. The Whereby
Embedded docs are at https://docs.whereby.com/, use them as the
reference for the `browser-sdk` hooks and any Whereby-specific behavior
below.

**Accepting a room URL**: Whereby room URLs contain a `roomKey` that
works like a password, anyone with the full URL can join. Accept room
links after a `#` in the address (`yourapp.com/#url=<roomUrl>`), not as
a `?url=` query parameter, since fragments never get sent to a server or
written to a log while query strings do. Add a no-referrer meta tag
too. On load, read the room URL from the fragment and skip straight to
the lobby if one's there.

**Join form**: a single input for pasting a room URL, a Continue button,
and basic validation (it needs to be a real URL with a room name in the
path). Remember the last 10 room URLs joined in localStorage, most
recent first, deduplicated on reuse, and show them as a dropdown under
the input with a small remove button per entry.

**Pre-join lobby**: before joining, show a live camera preview,
mute/camera toggles, camera/mic/speaker device pickers, a button that
plays a short test tone through the speaker, and a name field remembered
across visits. The mute and camera toggles must reflect their real on/off
state and flip reliably in both directions — a camera you turn off must
turn back on again. Note that `useLocalMedia` exposes no "enabled" flag
and toggling only mutates the track (or stops and re-acquires it) without
changing the stream reference, so track the on/off intent yourself rather
than reading it back off `localStream`. Keep `useLocalMedia` mounted
through the call itself so these choices carry over. Only mirror the
camera preview for front-facing cameras, not a rear camera on a phone.
Also handle this iOS quirk: `getUserMedia` can silently fail to get a
microphone while the camera still works fine, no error, no prompt, just
no audio. Detect when there's video but no live audio track, and show a
banner with an "Enable microphone" button that asks for mic access again.

**Knock flow**: Whereby has two kinds of room links, host links join
immediately and visitor links wait for the host to let them in. Using
`useRoomConnection`, when `connectionStatus` is `'room_locked'`, call
`knock()` and show a waiting screen with a cancel button. When it
becomes `'connected'`, drop into the call automatically. Handle
`'knock_rejected'` as its own screen. On the host's side, show a small
toast for anyone in `waitingParticipants`, with Admit/Deny buttons.

**Video grid**: lay out video tiles differently depending on
orientation, updating live as the window resizes or a phone rotates.
Portrait: 1-2 people in a single column, 3+ in two columns. Landscape: 1
person full-size, 2-4 in two columns, 5-9 in three, more than that in
four.

**Controls and icons**: use clean, polished control icons throughout
rather than rough or flat glyphs. Style the mute/camera "off" states
with a soft red (subtle shadow and inset ring, a small press animation)
instead of a harsh flat fill. In the call, give the hang-up button a
distinct, wider pill shape with a soft red glow and a proper end-call
handset icon (a solid handset rotated to the classic hang-up position),
so it reads clearly apart from the round mute/camera toggles.

**Deployment**: add a GitHub Actions workflow that builds this and
deploys it to GitHub Pages on every push to `main`. GitHub Pages serves
project sites from a subpath, not the domain root, so set Vite's `base`
config from an environment variable the workflow provides.
