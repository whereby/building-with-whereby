import { useState } from "react";
import { VideoView, type UseLocalMediaResult } from "@whereby.com/browser-sdk/react";
import { ControlButton, DeviceSelect } from "./controls";
import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon, SpeakerIcon } from "./icons";
import { shouldMirror } from "../lib/mirror";
import { useMissingAudio } from "../hooks/useMissingAudio";
import { playTestTone } from "../lib/testTone";
import { roomLabel } from "../lib/roomUrl";

interface Props {
  roomUrl: string;
  localMedia: UseLocalMediaResult;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onRemountMedia: () => void;
}

export default function Lobby({
  roomUrl,
  localMedia,
  displayName,
  onDisplayNameChange,
  onContinue,
  onBack,
  onRemountMedia,
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

  const [enablingMic, setEnablingMic] = useState(false);
  const missingAudio = useMissingAudio(localStream);

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

  const enableMicrophone = async () => {
    setEnablingMic(true);
    try {
      // Trigger a fresh permission prompt for audio, then let the media client
      // restart cleanly so useLocalMedia picks up the new microphone track.
      const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
      probe.getTracks().forEach((t) => t.stop());
      onRemountMedia();
    } catch {
      setEnablingMic(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 p-5">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{roomLabel(roomUrl)}</h1>
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

      {/* iOS silent-mic-failure recovery */}
      {missingAudio && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-200">
            Your camera is on but no microphone was detected. This can happen on iOS.
          </p>
          <button
            type="button"
            onClick={enableMicrophone}
            disabled={enablingMic}
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-60"
          >
            {enablingMic ? "Requesting…" : "Enable microphone"}
          </button>
        </div>
      )}

      {/* Device pickers */}
      <div className="grid gap-3">
        <DeviceSelect
          label="Camera"
          icon={<CameraIcon />}
          devices={cameraDevices}
          value={currentCameraDeviceId}
          onChange={actions.setCameraDevice}
          fallbackLabel={(i) => `Camera ${i + 1}`}
        />
        <DeviceSelect
          label="Microphone"
          icon={<MicIcon />}
          devices={microphoneDevices}
          value={currentMicrophoneDeviceId}
          onChange={actions.setMicrophoneDevice}
          fallbackLabel={(i) => `Microphone ${i + 1}`}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <DeviceSelect
              label="Speaker"
              icon={<SpeakerIcon />}
              devices={speakerDevices}
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
          Join call
        </button>
      </div>
    </div>
  );
}
