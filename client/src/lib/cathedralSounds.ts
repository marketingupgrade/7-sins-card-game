/**
 * CathedralSounds — Synthesized cathedral audio cues using Web Audio API
 *
 * Generates atmospheric sounds that reinforce the brand identity:
 * - Bell tolls for round transitions
 * - Ethereal whispers for narrator quotes
 * - Deep resonance for resolution/reckoning
 * - Choir pad for game start
 *
 * All sounds are procedurally generated — no external audio files needed.
 * Respects the existing SFX volume/mute settings.
 */

const STORAGE_KEY = "7sins_sfx_settings";

interface SfxSettings {
  enabled: boolean;
  volume: number;
}

function getSettings(): SfxSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { enabled: true, volume: 0.5 };
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const settings = getSettings();
  if (!settings.enabled) return null;

  if (!audioCtx || audioCtx.state === "closed") {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Bell Toll — Deep cathedral bell for round transitions
 * Uses a sine wave with harmonic overtones and slow decay
 */
export function playBellToll(intensity: "soft" | "normal" | "deep" = "normal") {
  const ctx = getAudioContext();
  if (!ctx) return;

  const settings = getSettings();
  const vol = settings.volume * 0.3; // Keep bells subtle

  const now = ctx.currentTime;

  // Fundamental frequency based on intensity
  const freq = intensity === "deep" ? 110 : intensity === "soft" ? 220 : 165;
  const duration = intensity === "deep" ? 4 : intensity === "soft" ? 2 : 3;

  // Create bell harmonics
  const harmonics = [1, 2.0, 3.0, 4.2, 5.4];
  const amplitudes = [1, 0.6, 0.4, 0.25, 0.15];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(vol, now);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  masterGain.connect(ctx.destination);

  harmonics.forEach((h, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * h, now);
    // Slight detuning for richness
    osc.detune.setValueAtTime((Math.random() - 0.5) * 10, now);

    gain.gain.setValueAtTime(amplitudes[i] * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration * (1 - i * 0.1));

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration);
  });

  // Add a subtle metallic ring using a high-frequency component
  const ring = ctx.createOscillator();
  const ringGain = ctx.createGain();
  ring.type = "sine";
  ring.frequency.setValueAtTime(freq * 8.5, now);
  ringGain.gain.setValueAtTime(vol * 0.08, now);
  ringGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.5);
  ring.connect(ringGain);
  ringGain.connect(masterGain);
  ring.start(now);
  ring.stop(now + duration * 0.5);
}

/**
 * Ethereal Whisper — Breathy noise burst for narrator moments
 * Uses filtered noise with a quick attack and slow decay
 */
export function playWhisper() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const settings = getSettings();
  const vol = settings.volume * 0.15; // Very subtle

  const now = ctx.currentTime;
  const duration = 1.5;

  // Create noise buffer
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass filter for breathy quality
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(2, now);

  // Envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.1);
  gain.gain.linearRampToValueAtTime(vol * 0.6, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);
}

/**
 * Deep Resonance — Low rumble for the Reckoning / major events
 * Uses a sub-bass sine with slow attack
 */
export function playDeepResonance() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const settings = getSettings();
  const vol = settings.volume * 0.25;

  const now = ctx.currentTime;
  const duration = 5;

  // Sub-bass drone
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(55, now); // Low A
  osc.frequency.linearRampToValueAtTime(40, now + duration);

  // Second harmonic
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(82.5, now); // Fifth above
  osc2.frequency.linearRampToValueAtTime(60, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 1);
  gain.gain.linearRampToValueAtTime(vol * 0.7, now + 3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(vol * 0.4, now + 1.5);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  osc2.connect(gain2);
  gain.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
  osc2.start(now);
  osc2.stop(now + duration);
}

/**
 * Choir Pad — Ethereal chord for game start / major transitions
 * Uses detuned sine waves to create a choir-like pad
 */
export function playChoirPad() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const settings = getSettings();
  const vol = settings.volume * 0.12;

  const now = ctx.currentTime;
  const duration = 4;

  // Minor chord: A2, C3, E3 with octave doublings
  const freqs = [110, 130.81, 164.81, 220, 261.63];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(vol, now + 1.5);
  masterGain.gain.linearRampToValueAtTime(vol * 0.5, now + 3);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  masterGain.connect(ctx.destination);

  freqs.forEach((freq) => {
    // Each "voice" is 3 slightly detuned oscillators
    for (let d = -1; d <= 1; d++) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(d * 8 + (Math.random() - 0.5) * 4, now);

      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(0.15, now);

      osc.connect(voiceGain);
      voiceGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration);
    }
  });
}

/**
 * Resolution Chime — Bright ascending tones for round resolution
 * Three quick ascending notes
 */
export function playResolutionChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const settings = getSettings();
  const vol = settings.volume * 0.15;

  const now = ctx.currentTime;

  // Ascending minor triad
  const notes = [220, 261.63, 329.63];
  const delays = [0, 0.12, 0.24];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + delays[i]);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + delays[i]);
    gain.gain.linearRampToValueAtTime(vol, now + delays[i] + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delays[i] + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delays[i]);
    osc.stop(now + delays[i] + 0.8);
  });
}

/**
 * Elimination Toll — Two slow, mournful bell strikes
 */
export function playEliminationToll() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const settings = getSettings();
  const vol = settings.volume * 0.25;

  const now = ctx.currentTime;

  // Two bell strikes with a pause
  [0, 0.8].forEach((delay) => {
    const freq = 130;
    const duration = 3;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + delay);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2.0, now + delay);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(vol * 0.3, now + delay);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + duration * 0.6);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + duration);
    osc2.start(now + delay);
    osc2.stop(now + delay + duration * 0.6);
  });
}
