// Thin, defensive wrappers over localStorage. Everything here degrades quietly
// if storage is unavailable (private mode, disabled, quota).

const RECENT_ROOMS_KEY = "whereby.recentRooms";
const DISPLAY_NAME_KEY = "whereby.displayName";
const MAX_RECENT = 10;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getRecentRooms(): string[] {
  const value = readJson<unknown>(RECENT_ROOMS_KEY, []);
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string").slice(0, MAX_RECENT);
}

/** Add a room URL to the front of the list, de-duplicated, capped at 10. */
export function rememberRoom(roomUrl: string): string[] {
  const existing = getRecentRooms().filter((u) => u !== roomUrl);
  const next = [roomUrl, ...existing].slice(0, MAX_RECENT);
  writeJson(RECENT_ROOMS_KEY, next);
  return next;
}

export function forgetRoom(roomUrl: string): string[] {
  const next = getRecentRooms().filter((u) => u !== roomUrl);
  writeJson(RECENT_ROOMS_KEY, next);
  return next;
}

export function getDisplayName(): string {
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setDisplayName(name: string): void {
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, name);
  } catch {
    // ignore
  }
}
