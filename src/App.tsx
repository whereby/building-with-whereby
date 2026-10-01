import { useCallback, useEffect, useState } from "react";
import { WherebyProvider } from "@whereby.com/browser-sdk/react";
import MeetingsDashboard from "./components/MeetingsDashboard";
import MediaSession from "./components/MediaSession";
import { readRoomFromFragment } from "./lib/roomUrl";

export default function App() {
  // The room URL to join (host or participant link picked from the dashboard,
  // or read from a shared #room=... invite link on load).
  const [roomUrl, setRoomUrl] = useState<string | null>(() => readRoomFromFragment(window.location.hash));

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

  // Route on fragment changes too, not just the initial load — so opening an
  // invite link in an already-open tab (or via back/forward) still works.
  useEffect(() => {
    const onHashChange = () => setRoomUrl(readRoomFromFragment(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-100">
      {roomUrl === null ? (
        <MeetingsDashboard onJoin={handleJoin} />
      ) : (
        // A single WherebyProvider owns the media client that useLocalMedia and
        // useRoomConnection share; keeping it mounted from lobby through the
        // call is what carries the device choices over.
        <WherebyProvider>
          <MediaSession roomUrl={roomUrl} onLeave={handleLeave} />
        </WherebyProvider>
      )}
    </div>
  );
}
