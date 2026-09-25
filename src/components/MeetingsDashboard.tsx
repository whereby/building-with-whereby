import { useState } from "react";
import { createGroupMeeting, WherebyApiError, type Meeting } from "../lib/whereby";
import { getMeetings, rememberMeeting, forgetMeeting } from "../lib/storage";
import { roomLabel } from "../lib/roomUrl";
import { CheckIcon, CopyIcon, PlusIcon, TrashIcon, UsersIcon } from "./icons";

interface Props {
  onJoin: (url: string) => void;
}

export default function MeetingsDashboard({ onJoin }: Props) {
  const [meetings, setMeetings] = useState<Meeting[]>(() => getMeetings());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const create = async () => {
    setCreating(true);
    setError(null);
    try {
      const meeting = await createGroupMeeting();
      setMeetings(rememberMeeting(meeting));
    } catch (e) {
      setError(e instanceof WherebyApiError ? e.message : "Something went wrong creating the meeting.");
    } finally {
      setCreating(false);
    }
  };

  const remove = (meetingId: string) => setMeetings(forgetMeeting(meetingId));

  const copy = async (key: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore silently.
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-5">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meetings</h1>
          <p className="text-sm text-neutral-400">Generate a Whereby group room and share the links.</p>
        </div>
        <button
          type="button"
          onClick={create}
          disabled={creating}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
        >
          {creating ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <PlusIcon width={18} height={18} />
          )}
          {creating ? "Creating…" : "New group meeting"}
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-800 py-16 text-center">
          <UsersIcon width={32} height={32} className="text-neutral-600" />
          <p className="text-sm text-neutral-500">No meetings yet.</p>
          <p className="text-xs text-neutral-600">Click “New group meeting” to create one.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {meetings.map((meeting) => (
            <li key={meeting.meetingId} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium text-neutral-100">{roomLabel(meeting.roomUrl)}</h2>
                  <p className="text-xs text-neutral-500">
                    Created {new Date(meeting.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(meeting.meetingId)}
                  aria-label="Remove meeting from list"
                  className="shrink-0 rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-800 hover:text-neutral-300"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <LinkRow
                  role="Host"
                  primary
                  url={meeting.hostRoomUrl}
                  copied={copiedKey === `${meeting.meetingId}:host`}
                  onCopy={() => copy(`${meeting.meetingId}:host`, meeting.hostRoomUrl)}
                  onJoin={() => onJoin(meeting.hostRoomUrl)}
                />
                <LinkRow
                  role="Participant"
                  url={meeting.roomUrl}
                  copied={copiedKey === `${meeting.meetingId}:participant`}
                  onCopy={() => copy(`${meeting.meetingId}:participant`, meeting.roomUrl)}
                  onJoin={() => onJoin(meeting.roomUrl)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface LinkRowProps {
  role: string;
  url: string;
  primary?: boolean;
  copied: boolean;
  onCopy: () => void;
  onJoin: () => void;
}

function LinkRow({ role, url, primary, copied, onCopy, onJoin }: LinkRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2">
      <span
        className={
          "shrink-0 rounded px-2 py-0.5 text-xs font-medium " +
          (primary ? "bg-indigo-500/15 text-indigo-300" : "bg-neutral-800 text-neutral-400")
        }
      >
        {role}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-500">{url}</span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${role.toLowerCase()} link`}
        title="Copy link"
        className="shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
      >
        {copied ? <CheckIcon width={16} height={16} className="text-green-400" /> : <CopyIcon width={16} height={16} />}
      </button>
      <button
        type="button"
        onClick={onJoin}
        className={
          "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition " +
          (primary
            ? "bg-indigo-600 text-white hover:bg-indigo-500"
            : "bg-neutral-800 text-neutral-100 hover:bg-neutral-700")
        }
      >
        Join
      </button>
    </div>
  );
}
