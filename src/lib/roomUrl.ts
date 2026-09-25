// Helpers for working with Whereby room URLs and our own deep links.

// The account's Whereby subdomain (e.g. "funtimes" for funtimes.whereby.com).
// It's public (it appears in every room URL), so it's fine to expose to the
// client. Invite links carry only the room name; this is how a cold visitor's
// app rebuilds the full room URL.
const WHEREBY_SUBDOMAIN = import.meta.env.VITE_WHEREBY_SUBDOMAIN;

/**
 * Whether a room URL carries a roomKey — i.e. a host link, which joins
 * immediately. A guest/participant link has no key and knocks into the (locked)
 * room instead.
 */
export function hasRoomKey(roomUrl: string): boolean {
  try {
    return new URL(roomUrl).searchParams.has("roomKey");
  } catch {
    return false;
  }
}

/** A short human label for a room URL — the room name from the path. */
export function roomLabel(roomUrl: string): string {
  try {
    const { pathname, host } = new URL(roomUrl);
    const name = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    return name || host;
  } catch {
    return roomUrl;
  }
}

function roomNameOf(roomUrl: string): string | null {
  try {
    const name = new URL(roomUrl).pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    return name || null;
  } catch {
    return null;
  }
}

/**
 * The fragment form of a room: `#<roomName>` — clean, no percent-escapes. It
 * carries no roomKey, so a link built from it is participant-only (the reader
 * knocks); the host key can't ride in a clean link.
 */
export function toRoomFragment(roomUrl: string): string {
  const name = roomNameOf(roomUrl);
  return name ? `#${name}` : "";
}

/**
 * Build a shareable link that opens THIS app's custom UI for a given room, as a
 * participant. The room name rides in the fragment, never a query string, so it
 * isn't sent to a server or written to a log (the no-referrer meta tag in
 * index.html backs that up).
 */
export function appInviteLink(roomUrl: string): string {
  const base = window.location.origin + window.location.pathname;
  const fragment = toRoomFragment(roomUrl);
  return fragment ? `${base}${fragment}` : base;
}

/**
 * Rebuild a participant room URL from a `#<roomName>` fragment, using the
 * configured Whereby subdomain. Returns null if the fragment is empty/malformed
 * or no subdomain is configured.
 */
export function readRoomFromFragment(hash: string): string | null {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!fragment) return null;

  const roomName = decodeURIComponent(fragment).replace(/^\/+/, "").replace(/\/+$/, "");
  if (!/^[a-zA-Z0-9._-]+$/.test(roomName)) return null;
  if (!WHEREBY_SUBDOMAIN) return null;

  return `https://${WHEREBY_SUBDOMAIN}.whereby.com/${roomName}`;
}
