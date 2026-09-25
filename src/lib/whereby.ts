// Creates Whereby Embedded meetings via the REST API. The request goes to the
// same-origin path `/api/whereby/...`, which the Vite dev server proxies to
// https://api.whereby.dev with the secret API key attached (see vite.config.ts).
// The key is never present in the browser.

export interface Meeting {
  meetingId: string;
  /** Participant join link (no host privileges). */
  roomUrl: string;
  /** Host link — joins immediately and can admit others. */
  hostRoomUrl: string;
  startDate: string;
  endDate: string;
  /** When we created it locally (for ordering the list). */
  createdAt: number;
}

/** How far in the future generated meetings stay valid. */
const MEETING_TTL_DAYS = 30;

export class WherebyApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "WherebyApiError";
    this.status = status;
  }
}

export async function createGroupMeeting(): Promise<Meeting> {
  const endDate = new Date(Date.now() + MEETING_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  let res: Response;
  try {
    res = await fetch("/api/whereby/v1/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endDate,
        roomMode: "group",
        // hostRoomUrl is only returned when explicitly requested.
        fields: ["hostRoomUrl"],
      }),
    });
  } catch {
    // Network error — usually means the dev-server proxy isn't running.
    throw new WherebyApiError(
      0,
      "Couldn't reach the Whereby API. Meeting generation runs through the dev server — make sure you're running `npm run dev`.",
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      throw new WherebyApiError(
        res.status,
        "Whereby rejected the API key. Set WHEREBY_API_KEY in your .env file and restart the dev server.",
      );
    }
    throw new WherebyApiError(res.status, `Whereby API error ${res.status}. ${body}`.trim());
  }

  const data = (await res.json()) as Omit<Meeting, "createdAt">;
  return { ...data, createdAt: Date.now() };
}
