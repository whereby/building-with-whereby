import { CheckIcon, XIcon } from "./icons";

interface WaitingParticipant {
  id: string;
  displayName: string | null;
}

interface Props {
  participants: WaitingParticipant[];
  onAdmit: (id: string) => void;
  onDeny: (id: string) => void;
}

/** Host-side toast stack: one card per person knocking, with Admit/Deny. */
export default function WaitingRoomToast({ participants, onAdmit, onDeny }: Props) {
  if (participants.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-20 flex flex-col items-center gap-2 px-4">
      {participants.map((p) => (
        <div
          key={p.id}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800/95 px-4 py-3 shadow-xl backdrop-blur"
        >
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-medium">{p.displayName || "Someone"}</span>
            <span className="text-neutral-400"> wants to join</span>
          </p>
          <button
            type="button"
            onClick={() => onDeny(p.id)}
            aria-label={`Deny ${p.displayName || "guest"}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
          >
            <XIcon width={18} height={18} />
          </button>
          <button
            type="button"
            onClick={() => onAdmit(p.id)}
            aria-label={`Admit ${p.displayName || "guest"}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-500"
          >
            <CheckIcon width={18} height={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
