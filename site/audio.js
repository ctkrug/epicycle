const MUTE_KEY = 'epicycle:muted';

export function loadMutePreference() {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveMutePreference(muted) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MUTE_KEY, String(muted));
  } catch {
    // Storage unavailable — mute state just won't persist across reloads.
  }
}

// Oscillators/noise only, no audio files: each cue is a short synthesized
// blip with an exponential decay envelope so it reads as a UI tick, not a
// sustained tone.
export function createSoundEngine() {
  let ctx = null;
  let muted = loadMutePreference();

  function ensureContext() {
    if (ctx) return ctx;
    if (typeof AudioContext === 'undefined') return null;
    ctx = new AudioContext();
    return ctx;
  }

  function blip(frequency, duration, type = 'sine', gainValue = 0.08) {
    if (muted) return;
    const audioCtx = ensureContext();
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue;
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    oscillator.connect(gain).connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  }

  return {
    drawStart: () => blip(880, 0.04),
    drawEnd: () => blip(660, 0.05),
    compute: () => blip(1200, 0.12, 'sawtooth', 0.05),
    loop: () => blip(1046, 0.08, 'triangle', 0.04),
    exportComplete: () => blip(784, 0.18, 'square', 0.05),
    isMuted: () => muted,
    setMuted(value) {
      muted = value;
      saveMutePreference(muted);
    },
  };
}
