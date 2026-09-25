// Helpers for working with Whereby room URLs and our own deep links.

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

function roomParts(roomUrl: string): { subdomain: string; roomName: string } | null {
  try {
    const u = new URL(roomUrl);
    const subdomain = u.hostname.split(".")[0];
    const roomName = u.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!subdomain || !roomName) return null;
    return { subdomain, roomName };
  } catch {
    return null;
  }
}

/**
 * The fragment form of a room: `#<subdomain>/<roomName>` — clean, with no
 * percent-escapes. It carries no roomKey, so a link built from it is
 * participant-only (the reader knocks); the host key can't ride in a clean link.
 */
export function toRoomFragment(roomUrl: string): string {
  const parts = roomParts(roomUrl);
  return parts ? `#${parts.subdomain}/${parts.roomName}` : "";
}

/**
 * Build a shareable link that opens THIS app's custom UI for a given room, as a
 * participant. The room rides in the fragment as `<subdomain>/<roomName>`, never
 * a query string, so it isn't sent to a server or written to a log (the
 * no-referrer meta tag in index.html backs that up).
 */
export function appInviteLink(roomUrl: string): string {
  const base = window.location.origin + window.location.pathname;
  const fragment = toRoomFragment(roomUrl);
  return fragment ? `${base}${fragment}` : base;
}

/**
 * Rebuild a participant room URL from a `#<subdomain>/<roomName>` fragment.
 * Returns null if the fragment isn't in that shape.
 */
export function readRoomFromFragment(hash: string): string | null {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!fragment) return null;

  const slash = fragment.indexOf("/");
  if (slash <= 0) return null;

  const subdomain = fragment.slice(0, slash);
  const roomName = decodeURIComponent(fragment.slice(slash + 1)).replace(/\/+$/, "");
  if (!/^[a-zA-Z0-9-]+$/.test(subdomain) || !roomName || /\s/.test(roomName)) return null;

  return `https://${subdomain}.whereby.com/${roomName}`;
}
