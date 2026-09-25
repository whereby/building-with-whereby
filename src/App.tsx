import { useCallback, useState } from "react";
import { WherebyProvider } from "@whereby.com/browser-sdk/react";
import MeetingsDashboard from "./components/MeetingsDashboard";
import MediaSession from "./components/MediaSession";
import { readRoomFromFragment } from "./lib/roomUrl";

export default function App() {
  // The room URL to join (host or participant link picked from the dashboard,
  // or read from a shared #room=... invite link on load).
  const [roomUrl, setRoomUrl] = useState<string | null>(() => readRoomFromFragment(window.location.hash));
  // Bumping this key throws away the WherebyProvider (and its media client) and
  // starts fresh — used to re-acquire the microphone after the iOS silent fail.
  const [mediaKey, setMediaKey] = useState(0);

  const handleJoin = useCallback((url: string) => {
    // Don't mirror the room into the address bar: a clean name-based fragment
    // can't carry the host key, so a host join would silently downgrade to
    // participant on reload. Sharing happens via the dashboard's copy button.
    setRoomUrl(url);
  }, []);

  const handleLeave = useCallback(() => {
    // Clear any invite fragment (from a cold-opened link) without adding a
    // history entry, back to the dashboard.
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setRoomUrl(null);
  }, []);

  const remountMedia = useCallback(() => setMediaKey((k) => k + 1), []);

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-100">
      {roomUrl === null ? (
        <MeetingsDashboard onJoin={handleJoin} />
      ) : (
        // A single WherebyProvider owns the media client that useLocalMedia and
        // useRoomConnection share; keeping it mounted from lobby through the
        // call is what carries the device choices over.
        <WherebyProvider key={mediaKey}>
          <MediaSession roomUrl={roomUrl} onLeave={handleLeave} onRemountMedia={remountMedia} />
        </WherebyProvider>
      )}
    </div>
  );
}
