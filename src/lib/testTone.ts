// Plays a short, gentle test tone. When a specific speaker (sinkId) is chosen
// and the browser supports HTMLMediaElement.setSinkId, the tone is routed
// through that output device via an <audio> element fed by a MediaStream
// destination; otherwise it falls back to the AudioContext's default output.

export async function playTestTone(speakerDeviceId?: string): Promise<void> {
  const AudioCtx: typeof AudioContext =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  await ctx.resume();

  const now = ctx.currentTime;
  const duration = 0.4;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 440;

  const gain = ctx.createGain();
  // Gentle attack/decay so it doesn't pop.
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
  gain.gain.setValueAtTime(0.15, now + duration - 0.08);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  osc.connect(gain);

  let audioEl: HTMLAudioElement | null = null;
  const canRoute = !!speakerDeviceId && typeof HTMLAudioElement.prototype.setSinkId === "function";

  if (canRoute) {
    const dest = ctx.createMediaStreamDestination();
    gain.connect(dest);
    audioEl = new Audio();
    audioEl.srcObject = dest.stream;
    try {
      await audioEl.setSinkId(speakerDeviceId!);
    } catch {
      // Fall back to default routing if the sink can't be set.
      gain.connect(ctx.destination);
    }
    await audioEl.play().catch(() => {
      gain.connect(ctx.destination);
    });
  } else {
    gain.connect(ctx.destination);
  }

  osc.start(now);
  osc.stop(now + duration);

  osc.onended = () => {
    audioEl?.pause();
    // Give the tail a beat before tearing the context down.
    void ctx.close().catch(() => {});
  };
}
