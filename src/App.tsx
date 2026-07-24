import { useCallback, useState } from "react";
import { WherebyProvider } from "@whereby.com/browser-sdk/react";
import JoinForm from "./components/JoinForm";
import MediaSession from "./components/MediaSession";
import { readRoomUrlFromFragment, toFragment } from "./lib/roomUrl";
import { rememberRoom } from "./lib/storage";

export default function App() {
  const [roomUrl, setRoomUrl] = useState<string | null>(() => readRoomUrlFromFragment(window.location.hash));
  // Bumping this key throws away the WherebyProvider (and its media client) and
  // starts fresh — used to re-acquire the microphone after the iOS silent fail.
  const [mediaKey, setMediaKey] = useState(0);

  const handleJoin = useCallback((url: string) => {
    rememberRoom(url);
    // Keep the room in the fragment so a reload returns to the same lobby, and
    // so the URL stays shareable — without ever putting it in a query string.
    window.location.hash = toFragment(url);
    setRoomUrl(url);
  }, []);

  const handleLeave = useCallback(() => {
    // Drop the fragment without adding a history entry.
    history.replaceState(null, "", window.location.pathname + window.location.search);
    setRoomUrl(null);
  }, []);

  const remountMedia = useCallback(() => setMediaKey((k) => k + 1), []);

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-100">
      {roomUrl === null ? (
        <JoinForm onJoin={handleJoin} />
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
