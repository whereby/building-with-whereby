import { useCallback, useState } from "react";
import { useLocalMedia } from "@whereby.com/browser-sdk/react";
import Lobby from "./Lobby";
import Call from "./Call";
import { getDisplayName, setDisplayName as persistDisplayName } from "../lib/storage";
import { hasRoomKey } from "../lib/roomUrl";

interface Props {
  roomUrl: string;
  onLeave: () => void;
}

/**
 * Owns the single `useLocalMedia` instance that stays mounted across both the
 * lobby and the call, so camera/mic/device choices carry straight into the
 * meeting. Local phase toggles between the pre-join lobby and the live call
 * without ever tearing down local media.
 */
export default function MediaSession({ roomUrl, onLeave }: Props) {
  const localMedia = useLocalMedia({ audio: true, video: true });
  const [phase, setPhase] = useState<"lobby" | "call">("lobby");
  const [displayName, setDisplayName] = useState(() => getDisplayName());

  const handleDisplayNameChange = useCallback((name: string) => {
    setDisplayName(name);
    persistDisplayName(name);
  }, []);

  if (phase === "call") {
    return (
      <Call
        roomUrl={roomUrl}
        displayName={displayName}
        localMedia={localMedia}
        onLeave={() => setPhase("lobby")}
        onExit={onLeave}
      />
    );
  }

  return (
    <Lobby
      isGuest={!hasRoomKey(roomUrl)}
      localMedia={localMedia}
      displayName={displayName}
      onDisplayNameChange={handleDisplayNameChange}
      onContinue={() => setPhase("call")}
      onBack={onLeave}
    />
  );
}
