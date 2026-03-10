/**
 * SoundEngine - Lightweight audio manager for the 7 Deadly Sins card game
 * Preloads sounds, manages volume, and maps game events to appropriate SFX.
 * 
 * Assets from OpenGameArt.org:
 * - Card Game Sounds: CC0 by HaelDB
 * - Fantasy SFX Pack Vol 1: CC-BY 4.0 by JC Sounds
 */

import { SFX_URLS, type SfxName } from "./assetUrls";

type GameSoundEvent =
  | "card_play"
  | "card_draw"
  | "card_shuffle"
  | "turn_pass"
  | "turn_start"
  | "damage_fire"
  | "damage_ice"
  | "damage_electric"
  | "damage_generic"
  | "heal"
  | "shield"
  | "steal"
  | "dark_magic"
  | "energy_drain"
  | "error"
  | "ui_hover"
  | "ui_click"
  | "game_start"
  | "teleport";

// Map game events to SFX file names
const EVENT_TO_SFX: Record<GameSoundEvent, SfxName> = {
  card_play: "playcard",
  card_draw: "draw",
  card_shuffle: "shuffle",
  turn_pass: "passturn",
  turn_start: "tap",
  damage_fire: "fire_impact",
  damage_ice: "ice_impact",
  damage_electric: "electric_hit",
  damage_generic: "sword_swing",
  heal: "heal_chime",
  shield: "shield_activate",
  steal: "dark_magic",
  dark_magic: "dark_magic",
  energy_drain: "energy_drain",
  error: "error",
  ui_hover: "tap",
  ui_click: "playcard",
  game_start: "shuffle",
  teleport: "teleport_in",
};

const STORAGE_KEY = "7sins_sfx_settings";

interface SfxSettings {
  enabled: boolean;
  volume: number; // 0-1
}

function loadSettings(): SfxSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { enabled: true, volume: 0.5 };
}

function saveSettings(s: SfxSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

class SoundEngine {
  private audioCache = new Map<string, HTMLAudioElement>();
  private settings: SfxSettings;
  private preloaded = false;

  constructor() {
    this.settings = loadSettings();
  }

  /** Preload priority sounds (card play, draw, damage) */
  preload() {
    if (this.preloaded) return;
    this.preloaded = true;

    const prioritySounds: SfxName[] = [
      "playcard",
      "draw",
      "shuffle",
      "fire_impact",
      "ice_impact",
      "heal_chime",
      "shield_activate",
      "tap",
      "passturn",
    ];

    for (const name of prioritySounds) {
      const url = SFX_URLS[name];
      if (url) {
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;
        audio.volume = this.settings.volume;
        this.audioCache.set(name, audio);
      }
    }
  }

  /** Play a game sound event */
  play(event: GameSoundEvent) {
    if (!this.settings.enabled) return;

    const sfxName = EVENT_TO_SFX[event];
    if (!sfxName) return;

    const url = SFX_URLS[sfxName];
    if (!url) return;

    // Try cached audio first
    let audio = this.audioCache.get(sfxName);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = this.settings.volume;
      audio.play().catch(() => {
        /* user hasn't interacted yet */
      });
      return;
    }

    // Create new audio element for non-cached sounds
    audio = new Audio(url);
    audio.volume = this.settings.volume;
    audio.play().catch(() => {
      /* user hasn't interacted yet */
    });
    this.audioCache.set(sfxName, audio);
  }

  /** Play a raw SFX by name */
  playSfx(name: SfxName) {
    if (!this.settings.enabled) return;
    const url = SFX_URLS[name];
    if (!url) return;

    let audio = this.audioCache.get(name);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = this.settings.volume;
      audio.play().catch(() => {});
      return;
    }

    audio = new Audio(url);
    audio.volume = this.settings.volume;
    audio.play().catch(() => {});
    this.audioCache.set(name, audio);
  }

  get enabled() {
    return this.settings.enabled;
  }

  get volume() {
    return this.settings.volume;
  }

  setEnabled(enabled: boolean) {
    this.settings.enabled = enabled;
    saveSettings(this.settings);
  }

  setVolume(volume: number) {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    saveSettings(this.settings);
    // Update all cached audio volumes
    this.audioCache.forEach((audio) => {
      audio.volume = this.settings.volume;
    });
  }

  toggle() {
    this.setEnabled(!this.settings.enabled);
    return this.settings.enabled;
  }
}

// Singleton
export const soundEngine = new SoundEngine();
export type { GameSoundEvent, SfxSettings };
