// Waiter-call chime — synthesized via Web Audio API so no audio asset needs
// to be bundled/downloaded. A singleton AudioContext is reused across calls
// (browsers cap how many contexts a page may create).
let audioCtx = null;

// All tones route through this compressor rather than straight to the
// speakers — it lets us push the per-tone gain up for a louder chime
// without the louder signal clipping/distorting when tones overlap.
let masterOut = null;

// Nodes from the currently-ringing chime. Kept so a new call can silence
// them before starting fresh — without this, rapid repeated calls stack
// overlapping copies of the chime on top of each other, and the combined
// signal gets clipped/limited by the browser's audio output until it's
// crushed down to near-silence.
let activeNodes = [];

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (!masterOut) {
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 24;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.15;
    compressor.connect(audioCtx.destination);
    masterOut = compressor;
  }
  return audioCtx;
}

function stopActiveNodes(ctx) {
  activeNodes.forEach(({ osc, gainNode }) => {
    try { osc.stop(ctx.currentTime); } catch { /* already stopped */ }
    try { osc.disconnect(); gainNode.disconnect(); } catch { /* already disconnected */ }
  });
  activeNodes = [];
}

function tone(ctx, { freq, start, duration, gain = 0.85 }) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
  gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  osc.connect(gainNode);
  gainNode.connect(masterOut);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);

  const entry = { osc, gainNode };
  activeNodes.push(entry);
  osc.onended = () => {
    activeNodes = activeNodes.filter(n => n !== entry);
    try { osc.disconnect(); gainNode.disconnect(); } catch { /* already disconnected */ }
  };
}

// Plays the "ding-dong" chime immediately, every time it's called. Always
// stops whatever's still ringing from a previous call first, so repeated
// calls never overlap/stack and the volume stays consistent.
export function playWaiterCallSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  try {
    stopActiveNodes(ctx);
    tone(ctx, { freq: 987.77, start: 0,    duration: 0.28 }); // B5
    tone(ctx, { freq: 783.99, start: 0.22, duration: 0.34 }); // G5
    tone(ctx, { freq: 987.77, start: 0.75, duration: 0.28 });
    tone(ctx, { freq: 783.99, start: 0.97, duration: 0.34 });
  } catch (err) {
    console.warn('Notification sound failed to play:', err);
  }
}

export default playWaiterCallSound;
