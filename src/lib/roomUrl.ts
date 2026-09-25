// Helpers for working with Whereby room URLs.

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
