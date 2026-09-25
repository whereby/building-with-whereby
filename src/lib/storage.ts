// Thin, defensive wrappers over localStorage. Everything here degrades quietly
// if storage is unavailable (private mode, disabled, quota).

import type { Meeting } from "./whereby";

const MEETINGS_KEY = "whereby.meetings";
const DISPLAY_NAME_KEY = "whereby.displayName";
const MAX_MEETINGS = 10;

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

function isMeeting(v: unknown): v is Meeting {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Meeting).meetingId === "string" &&
    typeof (v as Meeting).roomUrl === "string"
  );
}

export function getMeetings(): Meeting[] {
  const value = readJson<unknown>(MEETINGS_KEY, []);
  if (!Array.isArray(value)) return [];
  return value.filter(isMeeting).slice(0, MAX_MEETINGS);
}

/** Add a freshly created meeting to the front of the list, capped at 10. */
export function rememberMeeting(meeting: Meeting): Meeting[] {
  const existing = getMeetings().filter((m) => m.meetingId !== meeting.meetingId);
  const next = [meeting, ...existing].slice(0, MAX_MEETINGS);
  writeJson(MEETINGS_KEY, next);
  return next;
}

export function forgetMeeting(meetingId: string): Meeting[] {
  const next = getMeetings().filter((m) => m.meetingId !== meetingId);
  writeJson(MEETINGS_KEY, next);
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
