import { useRef, useState } from "react";
import { validateRoomUrl, roomLabel } from "../lib/roomUrl";
import { getRecentRooms, forgetRoom } from "../lib/storage";
import { ChevronDownIcon, XIcon } from "./icons";

interface Props {
  onJoin: (url: string) => void;
}

export default function JoinForm({ onJoin }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(() => getRecentRooms());
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<number | undefined>(undefined);

  const submit = (raw: string) => {
    const result = validateRoomUrl(raw);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onJoin(result.url);
  };

  const removeRecent = (url: string) => {
    const next = forgetRoom(url);
    setRecent(next);
    if (next.length === 0) setOpen(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Join a call</h1>
        <p className="mb-6 text-sm text-neutral-400">Paste a Whereby room link to get started.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <div className="relative">
            <input
              type="text"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="https://your-team.whereby.com/room"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                // Delay so a click on a dropdown row still registers.
                blurTimer.current = window.setTimeout(() => setOpen(false), 150);
              }}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 pr-10 text-sm outline-none placeholder:text-neutral-600 focus:border-indigo-500"
              aria-invalid={error ? true : undefined}
              aria-label="Room link"
            />
            {recent.length > 0 && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen((o) => !o)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 hover:text-neutral-300"
                aria-label="Show recent rooms"
              >
                <ChevronDownIcon width={18} height={18} />
              </button>
            )}

            {open && recent.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
                {recent.map((url) => (
                  <li key={url} className="group flex items-center">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        // Prevent the input blur from firing before the click.
                        e.preventDefault();
                        window.clearTimeout(blurTimer.current);
                      }}
                      onClick={() => submit(url)}
                      className="flex min-w-0 flex-1 flex-col px-4 py-2.5 text-left hover:bg-neutral-800"
                    >
                      <span className="truncate text-sm text-neutral-100">{roomLabel(url)}</span>
                      <span className="truncate text-xs text-neutral-500">{url}</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => removeRecent(url)}
                      className="mr-2 rounded p-1.5 text-neutral-600 hover:bg-neutral-700 hover:text-neutral-200"
                      aria-label={`Remove ${roomLabel(url)}`}
                    >
                      <XIcon width={16} height={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
