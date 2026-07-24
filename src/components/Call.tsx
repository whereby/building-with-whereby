import { useEffect } from "react";
import { useRoomConnection, type UseLocalMediaResult } from "@whereby.com/browser-sdk/react";
import VideoGrid from "./VideoGrid";
import type { TileData } from "./VideoTile";
import WaitingRoomToast from "./WaitingRoomToast";
import StatusScreen from "./StatusScreen";
import { ControlButton } from "./controls";
import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon, PhoneOffIcon } from "./icons";
import { useOrientation } from "../hooks/useOrientation";
import { shouldMirror } from "../lib/mirror";
import { roomLabel } from "../lib/roomUrl";

interface Props {
  roomUrl: string;
  displayName: string;
  localMedia: UseLocalMediaResult;
  /** Return to the pre-join lobby (keeps local media). */
  onLeave: () => void;
  /** Leave the room entirely, back to the join form. */
  onExit: () => void;
}

export default function Call({ roomUrl, displayName, localMedia, onLeave, onExit }: Props) {
  const { state, actions } = useRoomConnection(roomUrl, { localMedia, displayName });
  const {
    connectionStatus,
    remoteParticipants,
    localParticipant,
    waitingParticipants,
    isCameraEnabled,
    isMicrophoneEnabled,
  } = state;
  const orientation = useOrientation();

  // Initiate the connection once. useRoomConnection wires up leaveRoom on
  // unmount, so we don't tear down here.
  useEffect(() => {
    actions.joinRoom().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Visitor links land on 'room_locked'; knock to ask the host to be let in.
  useEffect(() => {
    if (connectionStatus === "room_locked") {
      actions.knock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStatus]);

  const leaveToLobby = () => {
    actions.leaveRoom();
    onLeave();
  };

  if (connectionStatus === "knock_rejected") {
    return (
      <StatusScreen title="Entry declined" message="The host didn't let you into this room.">
        <button
          type="button"
          onClick={onLeave}
          className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
        >
          Back to lobby
        </button>
      </StatusScreen>
    );
  }

  if (connectionStatus === "room_locked" || connectionStatus === "knocking") {
    return (
      <StatusScreen title="Waiting to be let in" message="The host has been notified you're here." spinner>
        <button
          type="button"
          onClick={() => {
            actions.cancelKnock();
            onLeave();
          }}
          className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
        >
          Cancel
        </button>
      </StatusScreen>
    );
  }

  if (connectionStatus === "kicked") {
    return (
      <StatusScreen title="You were removed" message="The host removed you from this room.">
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
        >
          Leave
        </button>
      </StatusScreen>
    );
  }

  if (connectionStatus === "left" || connectionStatus === "disconnected" || connectionStatus === "leaving") {
    return (
      <StatusScreen title="Call ended">
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
        >
          Done
        </button>
      </StatusScreen>
    );
  }

  if (connectionStatus !== "connected") {
    // ready / connecting / reconnecting
    const label = connectionStatus === "reconnecting" ? "Reconnecting…" : "Connecting…";
    return <StatusScreen title={label} spinner />;
  }

  // Connected — build the tiles (local first), then the remote participants.
  const localStream = localParticipant?.stream ?? localMedia.state.localStream;
  const tiles: TileData[] = [
    {
      id: localParticipant?.id ?? "local",
      displayName: displayName || localParticipant?.displayName || "You",
      stream: localStream,
      isAudioEnabled: localParticipant?.isAudioEnabled ?? isMicrophoneEnabled,
      isVideoEnabled: localParticipant?.isVideoEnabled ?? isCameraEnabled,
      isLocal: true,
      mirror: shouldMirror(localStream),
    },
    ...remoteParticipants.map<TileData>((p) => ({
      id: p.id,
      displayName: p.displayName,
      stream: p.stream,
      isAudioEnabled: p.isAudioEnabled,
      isVideoEnabled: p.isVideoEnabled,
      isLocal: false,
      mirror: false,
    })),
  ];

  return (
    <div className="flex h-screen flex-col">
      <WaitingRoomToast
        participants={waitingParticipants}
        onAdmit={actions.acceptWaitingParticipant}
        onDeny={actions.rejectWaitingParticipant}
      />

      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="truncate text-sm font-medium text-neutral-300">{roomLabel(roomUrl)}</h1>
        <span className="text-xs text-neutral-500">
          {tiles.length} {tiles.length === 1 ? "person" : "people"}
        </span>
      </header>

      <main className="min-h-0 flex-1 px-2">
        <VideoGrid tiles={tiles} orientation={orientation} />
      </main>

      <footer className="flex items-center justify-center gap-3 px-4 py-4">
        <ControlButton
          active={isMicrophoneEnabled}
          onClick={() => actions.toggleMicrophone(!isMicrophoneEnabled)}
          label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
          onIcon={<MicIcon />}
          offIcon={<MicOffIcon />}
        />
        <ControlButton
          active={isCameraEnabled}
          onClick={() => actions.toggleCamera(!isCameraEnabled)}
          label={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
          onIcon={<CameraIcon />}
          offIcon={<CameraOffIcon />}
        />
        <button
          type="button"
          onClick={leaveToLobby}
          aria-label="Leave call"
          title="Leave call"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500"
        >
          <PhoneOffIcon />
        </button>
      </footer>
    </div>
  );
}
