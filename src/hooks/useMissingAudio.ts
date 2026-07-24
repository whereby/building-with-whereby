import { useEffect, useState } from "react";

/**
 * Detects the iOS quirk where getUserMedia returns a working camera but no
 * microphone at all — no error, no prompt, just a stream with a live video
 * track and zero audio tracks. Re-evaluates as tracks are added/removed/ended.
 */
export function useMissingAudio(stream?: MediaStream | null): boolean {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!stream) {
      setMissing(false);
      return;
    }

    const evaluate = () => {
      const hasLiveVideo = stream.getVideoTracks().some((t) => t.readyState === "live");
      const hasAudioTrack = stream.getAudioTracks().length > 0;
      setMissing(hasLiveVideo && !hasAudioTrack);
    };

    evaluate();

    const tracks = stream.getTracks();
    stream.addEventListener("addtrack", evaluate);
    stream.addEventListener("removetrack", evaluate);
    tracks.forEach((t) => {
      t.addEventListener("ended", evaluate);
      t.addEventListener("mute", evaluate);
      t.addEventListener("unmute", evaluate);
    });

    return () => {
      stream.removeEventListener("addtrack", evaluate);
      stream.removeEventListener("removetrack", evaluate);
      tracks.forEach((t) => {
        t.removeEventListener("ended", evaluate);
        t.removeEventListener("mute", evaluate);
        t.removeEventListener("unmute", evaluate);
      });
    };
  }, [stream]);

  return missing;
}
