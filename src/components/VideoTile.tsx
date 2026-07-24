import { VideoView } from "@whereby.com/browser-sdk/react";
import { MicOffIcon } from "./icons";

export interface TileData {
  id: string;
  displayName: string;
  stream?: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isLocal: boolean;
  mirror: boolean;
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function VideoTile({ tile }: { tile: TileData }) {
  const showVideo = tile.stream && tile.isVideoEnabled;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-neutral-900">
      {showVideo ? (
        <VideoView
          stream={tile.stream!}
          // Never route our own audio back to our speakers.
          muted={tile.isLocal}
          mirror={tile.mirror}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-700 text-xl font-medium text-neutral-200">
            {initials(tile.displayName)}
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        {!tile.isAudioEnabled && <MicOffIcon width={14} height={14} className="text-red-400" />}
        <span className="truncate text-xs font-medium text-white">
          {tile.displayName || "Guest"}
          {tile.isLocal && " (you)"}
        </span>
      </div>
    </div>
  );
}
