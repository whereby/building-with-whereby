// Helpers for reading, validating, and normalizing Whereby room URLs.

/**
 * A Whereby room URL looks like
 *   https://your-subdomain.whereby.com/room-name?roomKey=eyJhbGc...
 * The room name lives in the path; the roomKey (which acts like a password) is
 * a query parameter. We keep validation general — any https URL with a room
 * name in its path — rather than hard-coding whereby.com, but we do require
 * that path segment so bare origins are rejected.
 */
export function validateRoomUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Enter a room link." };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "Room links must start with https://." };
  }

  // Require an actual room name in the path (not just "/").
  const roomName = parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!roomName) {
    return { ok: false, error: "That link is missing a room name." };
  }

  return { ok: true, url: trimmed };
}

/** Read a room URL out of the location fragment: `#url=<encoded room url>`. */
export function readRoomUrlFromFragment(hash: string): string | null {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!fragment) return null;
  const params = new URLSearchParams(fragment);
  const url = params.get("url");
  if (!url) return null;
  const result = validateRoomUrl(url);
  return result.ok ? result.url : null;
}

/** Build the shareable fragment form of a room URL. */
export function toFragment(roomUrl: string): string {
  return `#url=${encodeURIComponent(roomUrl)}`;
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
