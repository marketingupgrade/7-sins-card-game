/**
 * MusicEngine — Ambient background music system
 * Separate from SoundEngine (SFX). Handles looping tracks,
 * crossfade between scenes, and independent volume control.
 *
 * Music tracks from OpenGameArt.org (CC-BY 3.0):
 * - "Dark City" by Muncheybobo — Menu/Lobby cyberpunk ambient
 * - "Dark Ambient" by Alexandr Zhelanov — Arena battle tension
 * - "Dark Ambient Loop 13" by MundoSound/Lucas Calvo — Arena drone layer
 */

// CDN URLs for music tracks
const MUSIC_TRACKS = {
  menu: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028555243/iFOwhCbBFjzOipqw.mp3?Expires=1804709851&Signature=rBBQh0MKPTVgJPAehJMhZbXXczdPKSX6HosRa~SgvKzABoYylDAm96lMGyLLgWpNbKAv3XUpolPw2aNWzxKoiGCMa22jn5s6WPUZlOf6Yu2rs8pfdPMyhJYGfXRO-e4I3HT18~8ikDCHgNIQjaYR9cxdf0FiXnlSfStTHGg3vCmFhLblB9oYvV-Wq9oVCj7DtK~7GNuzE5SOAPmvMd89evnoJCzH9LWkpFe1S-vK46z~P0jh74xKQiTwGV5Am0hFXLHdCopcRRlbyegaZnHsrT1unCKe23CaEOLQjhvcAMU4TD2GQNPuPk4f-CIDha4FtdxZg8NR5NVAQM7JlF6REQ__&Key-Pair-Id=K2HSFNDJXOU9YS",
  arena: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028555243/yVcHDIacNpbUIsOQ.mp3?Expires=1804709851&Signature=Ue3taOqMt561ddax3sbsTi~uoE90x0iWllv0vE0C0Qx0yRuOykvTJioz8eWPreGbIHb39cD0Zo6w2r1zarYjeA7wyeg3PpNyOJH7~zkgh-z4pEzS25Ep0irWrmHARblcsgZ7YdfzZ8ebMy0MvajF1ZoxyNTch4WMIoNDMF6nvMAg06j2nN11c-gyykJ4I~o0rr7MMdrX9F5ZshXe4Cpcm2sbCDyhPaq8ZOmtjBaIWiR5D3Ym0cxKdnCVlLWPahZpk~59xlmWYKoQ9Q4GskR6VxURbdRtgnPkJ0OMS1iW5BMdCCwuqL7DgU9bTioC~eYsepJRa4YhfVkhEan8bnsraw__&Key-Pair-Id=K2HSFNDJXOU9YS",
  arenaDrone: "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663028555243/VYcHJdJoVmVTJcVE.mp3?Expires=1804709851&Signature=bw6TVcsceXaIdvlAbFYi3hUtHXqhd87Nk~DC7bTDw3J5XZ0srcIylOuVNqpPj26-OlaBo15k8NapFrWWnRt3vK0uJTf5xboZBHADfiwZmGtsaa1Z0aR7DLoRmgBprstKTwGNliau2yWG4XlrAAiZMTBMdw5i1tydTekR30OqAhIk90hr-H87Ea2SNMoQjlYaOOVqezhV8RIXCZm8asyxYOh4iyhA9lHmzDfmDitlHO4kCQECLknd4wz1whDurpC1F-flCfvuTjCskhcMeHzbBa4RHZyn-fSL3o0rjg6HwmYrYIV5ktPm4L1HHqsrMpMrRivr95X--uuxGCVAM1w~xQ__&Key-Pair-Id=K2HSFNDJXOU9YS",
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
      // Fade all active tracks to 0
      for (const trackKey of this.getActiveTracksForScene(this.currentScene)) {
        this.fadeOut(trackKey);
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
}

// Singleton
export const musicEngine = new MusicEngine();
