// Decide whether a camera preview should be mirrored. Front-facing ("user")
// cameras and ordinary desktop webcams (which report no facingMode) read more
// naturally mirrored; a rear ("environment") camera on a phone should not be.
export function shouldMirror(stream?: MediaStream | null): boolean {
  if (!stream) return true;
  const track = stream.getVideoTracks()[0];
  if (!track) return true;
  const facingMode = track.getSettings().facingMode;
  return facingMode === undefined || facingMode === "user";
}
