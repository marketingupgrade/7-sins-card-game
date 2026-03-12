/**
 * MusicEngine — Ambient background music system
 * Separate from SoundEngine (SFX). Handles looping tracks,
 * crossfade between scenes, and independent volume control.
 *
 * Music tracks from OpenGameArt.org (CC-BY-SA 3.0) by Zefz:
 * - "DarkWinds" — Menu/Lobby epic dark fantasy orchestral
 * - "TheLoomingBattle" — Arena battle epic orchestral
 * - "FoxieEpic" — Arena drone layer epic fantasy
 */

// CDN URLs for music tracks (epic dark fantasy orchestral — Witcher-style)
const MUSIC_TRACKS = {
  menu: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/dark-winds-menu_0c68078a.ogg",
  arena: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/dark-battle-arena_2953e88a.ogg",
  arenaDrone: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/foxie-epic-lobby_7f20fd83.ogg",
} as const;

export type MusicScene = "menu" | "arena" | "silent";

const STORAGE_KEY_MUSIC_VOL = "7sins-music-volume";
const STORAGE_KEY_MUSIC_MUTED = "7sins-music-muted";
const CROSSFADE_MS = 2000;

class MusicEngine {
  private tracks: Map<string, HTMLAudioElement> = new Map();
  private currentScene: MusicScene = "silent";
  private volume: number;
  private muted: boolean;
  private fadeIntervals: Map<string, number> = new Map();
  private initialized = false;

  constructor() {
    this.volume = this.loadFloat(STORAGE_KEY_MUSIC_VOL, 0.3);
    this.muted = this.loadBool(STORAGE_KEY_MUSIC_MUTED, false);
  }

  private loadFloat(key: string, fallback: number): number {
    try {
      const v = localStorage.getItem(key);
      if (v !== null) return Math.max(0, Math.min(1, parseFloat(v)));
    } catch {}
    return fallback;
  }

  private loadBool(key: string, fallback: boolean): boolean {
    try {
      const v = localStorage.getItem(key);
      if (v !== null) return v === "true";
    } catch {}
    return fallback;
  }

  /** Must be called from a user gesture to unlock audio context */
  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Pre-create audio elements for each track
    for (const [key, url] of Object.entries(MUSIC_TRACKS)) {
      const audio = new Audio();
      audio.src = url;
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0; // Start silent, crossfade in
      this.tracks.set(key, audio);
    }
  }

  /** Switch to a new scene with crossfade */
  setScene(scene: MusicScene) {
    if (!this.initialized) this.init();
    if (scene === this.currentScene) return;

    const prevScene = this.currentScene;
    this.currentScene = scene;

    // Determine which tracks should be active for each scene
    const activeTracksForScene = this.getActiveTracksForScene(scene);
    const prevActiveTracks = this.getActiveTracksForScene(prevScene);

    // Fade out tracks that are no longer needed
    for (const trackKey of prevActiveTracks) {
      if (!activeTracksForScene.includes(trackKey)) {
        this.fadeOut(trackKey);
      }
    }

    // Fade in new tracks
    if (!this.muted) {
      for (const trackKey of activeTracksForScene) {
        if (!prevActiveTracks.includes(trackKey)) {
          this.fadeIn(trackKey);
        }
      }
    }
  }

  private getActiveTracksForScene(scene: MusicScene): string[] {
    switch (scene) {
      case "menu":
        return ["menu"];
      case "arena":
        return ["arena", "arenaDrone"];
      case "silent":
        return [];
    }
  }

  private fadeIn(trackKey: string) {
    const audio = this.tracks.get(trackKey);
    if (!audio) return;

    // Clear any existing fade
    this.clearFade(trackKey);

    const targetVol = this.getTrackTargetVolume(trackKey);
    audio.volume = 0;
    audio.play().catch(() => {});

    const steps = 40;
    const stepMs = CROSSFADE_MS / steps;
    let step = 0;

    const interval = window.setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease-in curve for smooth fade
      const eased = progress * progress;
      audio.volume = Math.min(targetVol, eased * targetVol);

      if (step >= steps) {
        audio.volume = targetVol;
        this.clearFade(trackKey);
      }
    }, stepMs);

    this.fadeIntervals.set(trackKey, interval);
  }

  private fadeOut(trackKey: string) {
    const audio = this.tracks.get(trackKey);
    if (!audio) return;

    this.clearFade(trackKey);

    const startVol = audio.volume;
    const steps = 40;
    const stepMs = CROSSFADE_MS / steps;
    let step = 0;

    const interval = window.setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease-out curve
      const eased = 1 - (1 - progress) * (1 - progress);
      audio.volume = Math.max(0, startVol * (1 - eased));

      if (step >= steps) {
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
        this.clearFade(trackKey);
      }
    }, stepMs);

    this.fadeIntervals.set(trackKey, interval);
  }

  private clearFade(trackKey: string) {
    const existing = this.fadeIntervals.get(trackKey);
    if (existing) {
      clearInterval(existing);
      this.fadeIntervals.delete(trackKey);
    }
  }

  private getTrackTargetVolume(trackKey: string): number {
    // Drone layer is quieter than main track
    if (trackKey === "arenaDrone") return this.volume * 0.5;
    return this.volume;
  }

  /** Set master music volume (0–1) */
  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem(STORAGE_KEY_MUSIC_VOL, String(this.volume));
    } catch {}

    if (!this.muted) {
      this.updateAllVolumes();
    }
  }

  getVolume(): number {
    return this.volume;
  }

  /** Toggle mute state */
  toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem(STORAGE_KEY_MUSIC_MUTED, String(this.muted));
    } catch {}

    if (this.muted) {
      // Immediately stop all tracks — no fade, instant silence
      for (const trackKey of this.getActiveTracksForScene(this.currentScene)) {
        this.clearFade(trackKey);
        const audio = this.tracks.get(trackKey);
        if (audio) {
          audio.volume = 0;
          audio.pause();
        }
      }
    } else {
      // Fade active tracks back in
      for (const trackKey of this.getActiveTracksForScene(this.currentScene)) {
        this.fadeIn(trackKey);
      }
    }

    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private updateAllVolumes() {
    const activeTracks = this.getActiveTracksForScene(this.currentScene);
    for (const trackKey of activeTracks) {
      const audio = this.tracks.get(trackKey);
      if (audio && !audio.paused) {
        audio.volume = this.getTrackTargetVolume(trackKey);
      }
    }
  }

  /** Stop all music immediately */
  stopAll() {
    Array.from(this.tracks.keys()).forEach((key) => {
      this.clearFade(key);
    });
    Array.from(this.tracks.values()).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    });
    this.currentScene = "silent";
  }

  getCurrentScene(): MusicScene {
    return this.currentScene;
  }

  /** Set playback rate (tempo) for all active tracks. 1.0 = normal, 1.35 = 35% faster */
  setTempo(rate: number) {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    const activeTracks = this.getActiveTracksForScene(this.currentScene);
    for (const trackKey of activeTracks) {
      const audio = this.tracks.get(trackKey);
      if (audio) {
        audio.playbackRate = clamped;
      }
    }
  }

  /**
   * Adaptive tension system — adjusts drone layer volume and tempo based on game tension.
   * tension: 0 (calm early game) to 1 (critical late game, low HP, many deaths)
   *
   * At low tension: drone is quiet (30%), tempo normal
   * At high tension: drone is loud (90%), tempo 1.25x, main track slightly quieter
   */
  setTension(tension: number) {
    if (this.muted || this.currentScene !== "arena") return;
    const t = Math.max(0, Math.min(1, tension));

    // Drone layer scales from 30% to 90% of master volume with tension
    const droneAudio = this.tracks.get("arenaDrone");
    if (droneAudio && !droneAudio.paused) {
      droneAudio.volume = this.volume * (0.3 + t * 0.6);
    }

    // Main arena track gets slightly quieter at high tension (creates "underwater" pressure feel)
    const arenaAudio = this.tracks.get("arena");
    if (arenaAudio && !arenaAudio.paused) {
      arenaAudio.volume = this.volume * (1.0 - t * 0.15);
    }

    // Tempo ramps with tension: 1.0 at calm, 1.25 at max tension
    this.setTempo(1.0 + t * 0.25);
  }
}

// Singleton
export const musicEngine = new MusicEngine();
