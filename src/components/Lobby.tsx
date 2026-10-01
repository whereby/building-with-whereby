import { useEffect, useRef, useState } from "react";
import { VideoView, type UseLocalMediaResult } from "@whereby.com/browser-sdk/react";
import { ControlButton, DeviceSelect } from "./controls";
import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon, SpeakerIcon } from "./icons";
import { shouldMirror } from "../lib/mirror";
import { useMissingAudio } from "../hooks/useMissingAudio";
import { useMediaDevices } from "../hooks/useMediaDevices";
import { playTestTone } from "../lib/testTone";

interface Props {
  isGuest: boolean;
  localMedia: UseLocalMediaResult;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function Lobby({
  isGuest,
  localMedia,
  displayName,
  onDisplayNameChange,
  onContinue,
  onBack,
}: Props) {
  const { state, actions } = localMedia;
  const {
    localStream,
    cameraDevices,
    microphoneDevices,
    speakerDevices,
    currentCameraDeviceId,
    currentMicrophoneDeviceId,
    currentSpeakerDeviceId,
  } = state;

  const missingAudio = useMissingAudio(localStream);

  // Our own enumeration re-runs as soon as the stream goes live, so device
  // names appear on first grant rather than only after a refresh. Fall back to
  // the SDK's lists if enumeration hasn't populated yet.
  const live = useMediaDevices(localStream);
  const cameras = live.cameras.length ? live.cameras : cameraDevices;
  const microphones = live.microphones.length ? live.microphones : microphoneDevices;
  const speakers = live.speakers.length ? live.speakers : speakerDevices;

  // Some browsers leave the active track's deviceId blank on the very first
  // getUserMedia, so the SDK's current device ids come back empty. That makes
  // the pickers match nothing and blocks device switching until a reload. Once
  // the stream is live and real labels are available, seed the SDK's current
  // ids from the active tracks (matching by label when the deviceId is blank).
  const seeded = useRef(false);
  useEffect(() => {
    if (!localStream || seeded.current) return;
    const havePermission = live.cameras.some((d) => d.label) || live.microphones.some((d) => d.label);
    if (!havePermission) return;
    seeded.current = true;

    // Nudge the SDK to re-enumerate its own device list, which it otherwise only
    // does on a real devicechange or a reload.
    try {
      navigator.mediaDevices.dispatchEvent(new Event("devicechange"));
    } catch {
      // ignore
    }

    const resolveId = (track: MediaStreamTrack | undefined, list: MediaDeviceInfo[]): string | undefined =>
      track ? track.getSettings().deviceId || list.find((d) => d.deviceId && d.label === track.label)?.deviceId : undefined;

    if (!currentCameraDeviceId) {
      const id = resolveId(localStream.getVideoTracks()[0], live.cameras);
      if (id) actions.setCameraDevice(id);
    }
    if (!currentMicrophoneDeviceId) {
      const id = resolveId(localStream.getAudioTracks()[0], live.microphones);
      if (id) actions.setMicrophoneDevice(id);
    }
  }, [localStream, live.cameras, live.microphones, currentCameraDeviceId, currentMicrophoneDeviceId, actions]);

  // useLocalMedia's state exposes no camera/mic "enabled" flag, and toggling
  // only flips track.enabled (or stops/re-acquires the track) without changing
  // the localStream reference — so there's nothing reactive to read the on/off
  // state from. Track our own intent here (media starts with both on) and drive
  // the SDK with an explicit boolean.
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const mirror = shouldMirror(localStream);

  const toggleCamera = () => {
    const next = !cameraOn;
    setCameraOn(next);
    actions.toggleCameraEnabled(next);
  };

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    actions.toggleMicrophoneEnabled(next);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 p-5">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">Whereby-powered room</h1>
          <p className="text-xs text-neutral-500">Ready to join</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
        >
          Back
        </button>
      </header>

      {/* Camera preview */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900">
        {localStream && cameraOn ? (
          <VideoView
            stream={localStream}
            muted
            mirror={mirror}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            <CameraOffIcon width={40} height={40} />
          </div>
        )}

        {/* In-preview toggles */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-gradient-to-t from-black/60 to-transparent p-4">
          <ControlButton
            active={micOn}
            onClick={toggleMic}
            label={micOn ? "Mute microphone" : "Unmute microphone"}
            onIcon={<MicIcon />}
            offIcon={<MicOffIcon />}
          />
          <ControlButton
            active={cameraOn}
            onClick={toggleCamera}
            label={cameraOn ? "Turn off camera" : "Turn on camera"}
            onIcon={<CameraIcon />}
            offIcon={<CameraOffIcon />}
          />
        </div>
      </div>

      {/* iOS silent-mic failure: can't be re-requested from the page, so guide
          the user to re-enable microphone access in iOS Settings. */}
      {missingAudio && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <p className="font-medium">Your camera is on but no microphone was detected.</p>
          <p className="mt-2 text-amber-200/90">
            This can happen on iOS, and it can't be fixed from this page. To re-enable the microphone:
          </p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-amber-200/90">
            <li>
              Open the iOS <strong>Settings</strong> app and search for <strong>Safari</strong>.
            </li>
            <li>
              Scroll to <strong>Microphone</strong> and set <strong>Microphone Access on All Websites</strong> to{" "}
              <strong>Ask</strong>.
            </li>
            <li>Return to Safari and reload the page if needed, then accept the microphone prompt.</li>
          </ol>
        </div>
      )}

      {/* Device pickers */}
      <div className="grid gap-3">
        <DeviceSelect
          label="Camera"
          icon={<CameraIcon />}
          devices={cameras}
          value={currentCameraDeviceId}
          onChange={actions.setCameraDevice}
          fallbackLabel={(i) => `Camera ${i + 1}`}
        />
        <DeviceSelect
          label="Microphone"
          icon={<MicIcon />}
          devices={microphones}
          value={currentMicrophoneDeviceId}
          onChange={actions.setMicrophoneDevice}
          fallbackLabel={(i) => `Microphone ${i + 1}`}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <DeviceSelect
              label="Speaker"
              icon={<SpeakerIcon />}
              devices={speakers}
              value={currentSpeakerDeviceId}
              onChange={actions.setSpeakerDevice}
              fallbackLabel={(i) => `Speaker ${i + 1}`}
            />
          </div>
          <button
            type="button"
            onClick={() => void playTestTone(currentSpeakerDeviceId)}
            className="rounded-lg border border-neutral-700 px-3 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Test sound
          </button>
        </div>
      </div>

      {/* Name + join */}
      <div className="mt-auto grid gap-3">
        <input
          type="text"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          placeholder="Your name"
          maxLength={60}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none placeholder:text-neutral-600 focus:border-indigo-500"
          aria-label="Your name"
        />
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {isGuest ? "Knock" : "Join call"}
        </button>
      </div>
    </div>
  );
}
