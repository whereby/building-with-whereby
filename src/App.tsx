import { useCallback, useState } from "react";
import { WherebyProvider } from "@whereby.com/browser-sdk/react";
import MeetingsDashboard from "./components/MeetingsDashboard";
import MediaSession from "./components/MediaSession";

export default function App() {
  // The room URL to join (host or participant link picked from the dashboard).
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  // Bumping this key throws away the WherebyProvider (and its media client) and
  // starts fresh — used to re-acquire the microphone after the iOS silent fail.
  const [mediaKey, setMediaKey] = useState(0);

  const handleJoin = useCallback((url: string) => setRoomUrl(url), []);
  const handleLeave = useCallback(() => setRoomUrl(null), []);
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
