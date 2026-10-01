import { useEffect, useState } from "react";

export interface DeviceList {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}

const EMPTY: DeviceList = { cameras: [], microphones: [], speakers: [] };

/**
 * Enumerates media devices, re-running whenever the local stream changes.
 *
 * Browsers return empty device `label`s until permission is granted, so the
 * very first time access is granted the initial enumeration has no names (and
 * the UI falls back to "Camera 1" etc.). Re-enumerating the moment `localStream`
 * becomes available — i.e. right after the grant — picks up the real labels
 * without needing a refresh. Also refreshes on `devicechange` (hotplug).
 */
export function useMediaDevices(localStream?: MediaStream | null): DeviceList {
  const [devices, setDevices] = useState<DeviceList>(EMPTY);

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    let cancelled = false;
    const enumerate = async () => {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        setDevices({
          cameras: all.filter((d) => d.kind === "videoinput"),
          microphones: all.filter((d) => d.kind === "audioinput"),
          speakers: all.filter((d) => d.kind === "audiooutput"),
        });
      } catch {
        // ignore — callers fall back to the SDK's device list
      }
    };

    void enumerate();
    navigator.mediaDevices.addEventListener("devicechange", enumerate);
    return () => {
      cancelled = true;
      navigator.mediaDevices.removeEventListener("devicechange", enumerate);
    };
    // Re-enumerate when the stream (and thus permission / selected device) changes.
  }, [localStream]);

  return devices;
}
