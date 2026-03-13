/**
 * Home Page — AAA Premium Game Landing
 *
 * Full-bleed rotating sin hero showcase with:
 * - Babylon.js reactive 3D background (particles, volumetric light, ritual rings)
 * - Cinematic sin portrait rotation with Latin names and taglines
 * - Premium typography, parallax layers, ambient effects
 * - Game action panel (create / join)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Users, Bot, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { ICON_URLS } from "@/lib/assetUrls";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import GlitchTitle from "@/components/GlitchTitle";
import type { SinType } from "@shared/gameTypes";
// HeroBabylonScene removed from homepage for performance (Babylon.js = 3MB+ bundle)
// The EmberField CSS particle system provides the atmospheric background instead
import EmberField from "@/components/EmberField";
import { usePlayerId } from "@/hooks/usePlayerId";
import { useFactionUnlocks } from "@/hooks/useFactionUnlocks";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
// Dynamic import for code splitting - defers cardData (90KB) + supabase from initial load
const lazyGameEngine = () => import("@/lib/gameEngine");
// Dynamic imports for audio engines - only needed after user interaction
let _soundEngine: any = null;
let _musicEngine: any = null;
const getSoundEngine = async () => {
  if (!_soundEngine) _soundEngine = (await import("@/lib/soundEngine")).soundEngine;
  return _soundEngine;
};
const getMusicEngine = async () => {
  if (!_musicEngine) _musicEngine = (await import("@/lib/musicEngine")).musicEngine;
  return _musicEngine;
};
// Fire-and-forget sound play helper (non-blocking)
const playSound = (name: string) => { getSoundEngine().then(se => se.play(name)).catch(() => {}); };
import { MusicToggle } from "@/components/MusicToggle";

/* ─── Sin Data ───────────────────────────────────────────────── */

interface SinHeroData {
  key: SinType;
  name: string;
  latin: string;
  subtitle: string;
  tagline: string;
  desc: string;
  color: string;
  heroImg: string;
}

const SIN_HEROES: SinHeroData[] = [
  {
    key: "wrath", name: "WRATH", latin: "IRA", subtitle: "The Destroyer",
    tagline: "Burn bright. Burn fast. Burn everything.",
    desc: "Vengeance: Reflect 63% of incoming damage back to the attacker.",
    color: "wrath",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/hero-wrath-opt_37c4a2c3.webp",
  },
  {
    key: "sloth", name: "SLOTH", latin: "ACEDIA", subtitle: "The Enduring",
    tagline: "Why rush? Everything dies eventually.",
    desc: "Endurance: Gain shield each turn based on energy × hand size.",
    color: "sloth",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/hero-sloth-opt_ace8da83.webp",
  },
  {
    key: "greed", name: "GREED", latin: "AVARITIA", subtitle: "The Collector",
    tagline: "Everything has a price. Yours is higher.",
    desc: "Tax: Compound damage ticks generate protective shields.",
    color: "greed",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/hero-greed-opt_1340cd4c.webp",
  },
  {
    key: "envy", name: "ENVY", latin: "INVIDIA", subtitle: "The Mimic",
    tagline: "If I can't have it, neither can you.",
    desc: "Jealousy: Damage amplifies target's worst affliction by 10.6%.",
    color: "envy",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/hero-envy-opt_37a0b39f.webp",
  },
  {
    key: "pride", name: "PRIDE", latin: "SUPERBIA", subtitle: "The Exalted",
    tagline: "Kneel. Or be made to.",
    desc: "Hubris: Highest-cost card gets ×1.32 effect multiplier.",
    color: "pride",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/hero-pride-opt_7b43ac54.webp",
  },
  {
    key: "lust", name: "LUST", latin: "LUXURIA", subtitle: "The Temptress",
    tagline: "Come closer. It only hurts at first.",
    desc: "Temptation: Compound damage ticks heal you for 25% of damage.",
    color: "lust",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/hero-lust-opt_cdcc85ed.webp",
  },
  {
    key: "gluttony", name: "GLUTTONY", latin: "GULA", subtitle: "The Devourer",
    tagline: "More. Always more. Never enough.",
    desc: "Devourer: Each card burned grants 1.6 energy. Hunger feeds itself.",
    color: "gluttony",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/hero-gluttony-opt_d349da8c.webp",
  },
];

/* ─── Component ──────────────────────────────────────────────── */

export default function Home() {
  const playerId = usePlayerId();
  const { startTutorial, hasCompleted: tutorialCompleted, isActive: tutorialActive, setCurrentPage } = useTutorial();
  const factionUnlocks = useFactionUnlocks();

  useEffect(() => { setCurrentPage("home"); }, [setCurrentPage]);
  // Defer music init to first user interaction to avoid loading 6.6MB of OGG files on page load
  useEffect(() => {
    const initMusic = async () => {
      const me = await getMusicEngine();
      me.init();
      me.setScene("menu");
      window.removeEventListener("click", initMusic);
      window.removeEventListener("touchstart", initMusic);
    };
    window.addEventListener("click", initMusic, { once: true });
    window.addEventListener("touchstart", initMusic, { once: true });
    return () => {
      window.removeEventListener("click", initMusic);
      window.removeEventListener("touchstart", initMusic);
    };
  }, []);

  const autoTriggeredRef = useState(() => ({ current: false }))[0];
  useEffect(() => {
    if (!tutorialCompleted && !tutorialActive && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      const timer = setTimeout(() => startTutorial("home"), 2000);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [, setLocation] = useLocation();
  const [username, setUsername] = useState(() => localStorage.getItem("7sins_username") || "");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJoinPanel, setShowJoinPanel] = useState(false);

  // ─── Hero rotation state ───
  const [heroIndex, setHeroIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const currentSin = SIN_HEROES[heroIndex];

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % SIN_HEROES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const goNext = useCallback(() => {
    setAutoRotate(false);
    setHeroIndex((prev) => (prev + 1) % SIN_HEROES.length);
    playSound("ui_hover");
  }, []);

  const goPrev = useCallback(() => {
    setAutoRotate(false);
    setHeroIndex((prev) => (prev - 1 + SIN_HEROES.length) % SIN_HEROES.length);
    playSound("ui_hover");
  }, []);

  // Resume auto-rotate after 12s of inactivity
  useEffect(() => {
    if (autoRotate) return;
    const timer = setTimeout(() => setAutoRotate(true), 12000);
    return () => clearTimeout(timer);
  }, [autoRotate, heroIndex]);

  const handleCreate = async () => {
    if (!username.trim()) { setError("A name, sinner. Even the damned have names."); return; }
    setError(null); setIsCreating(true);
    playSound("card_shuffle");
    localStorage.setItem("7sins_username", username.trim());
    try {
      const { createGame } = await lazyGameEngine();
      const result = await createGame(playerId, username.trim());
      setLocation(`/lobby/${result.gameId}`);
    } catch (err: any) {
      setError(err.message || "The cathedral rejects your offering.");
    } finally { setIsCreating(false); }
  };

  const handleJoin = async () => {
    if (!username.trim()) { setError("A name. The confessional requires a name."); return; }
    if (!roomCode.trim()) { setError("The sacred code. Your fellow sinner should have given you one."); return; }
    setError(null); setIsJoining(true);
    playSound("teleport");
    localStorage.setItem("7sins_username", username.trim());
    try {
      const { joinGame } = await lazyGameEngine();
      const result = await joinGame(roomCode.trim().toUpperCase(), playerId, username.trim());
      setLocation(`/lobby/${result.gameId}`);
    } catch (err: any) {
      setError(err.message || "Invalid code. The cathedral doors remain sealed.");
    } finally { setIsJoining(false); }
  };

  // Memoize sin indicator dots to avoid re-render
  const sinDots = useMemo(() => SIN_HEROES.map((s, i) => (
    <button
      key={s.key}
      onClick={() => { setHeroIndex(i); setAutoRotate(false); playSound("ui_hover"); }}
      className={`w-2 h-2 rounded-full transition-all duration-500 ${
        i === heroIndex
          ? `bg-${s.color} scale-125 shadow-[0_0_8px_var(--color-${s.color})]`
          : "bg-white/20 hover:bg-white/40"
      }`}
      aria-label={s.name}
    />
  )), [heroIndex]);

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      {/* ═══ Lightweight Atmospheric Background ═══ */}
      <EmberField count={24} />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" style={{ zIndex: 1 }} />

      {/* Music toggle */}
      <div className="absolute top-4 right-4 z-30">
        <MusicToggle />
      </div>

      {/* ═══ HERO SECTION — Full viewport ═══ */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* ─── Top: Title Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-6 md:pt-10 text-center shrink-0"
        >
          <p
            className="text-[9px] md:text-[10px] tracking-[0.5em] text-white/30 uppercase mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Enter the Cathedral
          </p>
          <GlitchTitle />
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/15" />
            <div className="w-1 h-1 rotate-45 bg-white/20" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/15" />
          </div>
        </motion.div>

        {/* ─── Center: Hero Portrait + Info ─── */}
        <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-8">
          <div className="w-full max-w-6xl flex flex-col md:flex-row items-center gap-6 md:gap-12">

            {/* Portrait side */}
            <div className="relative w-full md:w-1/2 max-w-md aspect-[3/4] shrink-0">
              {/* Navigation arrows */}
              <button
                onClick={goPrev}
                className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Portrait image with sin-colored glow border */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSin.key}
                  initial={{ opacity: 0, scale: 0.95, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -40 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="relative w-full h-full rounded-2xl overflow-hidden"
                >
                  {/* Glow border effect */}
                  <div
                    className="absolute -inset-1 rounded-2xl opacity-40 blur-md"
                    style={{ background: `var(--color-${currentSin.color})` }}
                  />
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src={currentSin.heroImg}
                      alt={currentSin.name}
                      className="w-full h-full object-cover"
                      width={693}
                      height={928}
                      fetchPriority="high"
                      decoding="async"
                    />
                    {/* Bottom gradient overlay for text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Latin name overlay on portrait */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <p
                        className="text-[10px] md:text-xs tracking-[0.4em] uppercase mb-1 opacity-60"
                        style={{
                          fontFamily: "var(--font-heading)",
                          color: `var(--color-${currentSin.color})`,
                        }}
                      >
                        {currentSin.latin}
                      </p>
                      <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-black tracking-wider"
                        style={{
                          fontFamily: "var(--font-heading)",
                          color: `var(--color-${currentSin.color})`,
                          textShadow: `0 0 30px var(--color-${currentSin.color})`,
                        }}
                      >
                        {currentSin.name}
                      </h2>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Sin indicator dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {sinDots}
              </div>
            </div>

            {/* Info + Action side */}
            <div className="w-full md:w-1/2 max-w-md">
              {/* Sin info card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSin.key + "-info"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mb-6 md:mb-8"
                >
                  <p
                    className="text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2 opacity-50"
                    style={{ fontFamily: "var(--font-heading)", color: `var(--color-${currentSin.color})` }}
                  >
                    {currentSin.subtitle}
                  </p>
                  <p
                    className="text-base md:text-lg text-white/80 leading-relaxed mb-3"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {currentSin.tagline}
                  </p>
                  <div
                    className="inline-block rounded-lg px-3 py-1.5 text-[10px] md:text-xs tracking-wider border"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: `var(--color-${currentSin.color})`,
                      borderColor: `color-mix(in oklch, var(--color-${currentSin.color}) 25%, transparent)`,
                      background: `color-mix(in oklch, var(--color-${currentSin.color}) 6%, transparent)`,
                    }}
                  >
                    {currentSin.desc}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* ═══ Game Action Panel ═══ */}
              <div className="rounded-2xl p-6 md:p-7 border border-white/8 bg-black/50 backdrop-blur-md">
                {/* Username */}
                <div className="mb-5">
                  <label
                    className="block text-[10px] tracking-[0.2em] text-white/40 uppercase mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Your Sinful Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="What do they call you, sinner?"
                    maxLength={20}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <motion.button
                    data-tutorial="create-game"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="w-full rounded-xl py-3.5 px-6 text-sm font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    style={{
                      fontFamily: "var(--font-heading)",
                      background: `linear-gradient(135deg, var(--color-${currentSin.color}), color-mix(in oklch, var(--color-${currentSin.color}) 60%, black))`,
                      color: currentSin.key === "pride" ? "#111" : "#fff",
                      boxShadow: `0 0 20px color-mix(in oklch, var(--color-${currentSin.color}) 30%, transparent)`,
                    }}
                  >
                    <img src={SIN_ARCHETYPE_ICONS[currentSin.key]} alt="" className="w-4 h-4" />
                    {isCreating ? "OPENING THE GATES..." : "CREATE GAME"}
                  </motion.button>

                  <motion.button
                    data-tutorial="how-to-play"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startTutorial("home")}
                    className="w-full rounded-xl py-2.5 px-6 text-[11px] border border-white/10 text-white/50 hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    HOW TO PLAY
                  </motion.button>

                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-[9px] tracking-[0.15em] text-white/25 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                      or join another's penance
                    </span>
                    <div className="flex-1 h-px bg-white/8" />
                  </div>

                  <AnimatePresence>
                    {!showJoinPanel ? (
                      <motion.button
                        key="join-toggle"
                        data-tutorial="join-game"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowJoinPanel(true)}
                        className="w-full rounded-xl py-3.5 px-6 text-sm font-bold tracking-wider flex items-center justify-center gap-2 border border-white/10 text-white/70 hover:bg-white/5 transition-all"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        <Users className="w-4 h-4" />
                        JOIN GAME
                      </motion.button>
                    ) : (
                      <motion.div
                        key="join-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <input
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          placeholder="SACRED CODE"
                          maxLength={6}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.4em] uppercase placeholder:text-white/20 placeholder:tracking-normal placeholder:normal-case focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all text-lg font-bold"
                          style={{ fontFamily: "var(--font-heading)" }}
                        />
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleJoin}
                            disabled={isJoining}
                            className="flex-1 rounded-xl py-3 px-4 text-sm font-bold tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 border border-white/15 text-white/80 hover:bg-white/5 transition-all"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {isJoining ? "ENTERING..." : "ENTER THE CATHEDRAL"}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowJoinPanel(false)}
                            className="px-4 py-3 rounded-xl border border-white/8 text-white/30 text-sm hover:border-white/15 transition-colors"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            NAH
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-4 p-3 rounded-xl bg-wrath/10 border border-wrath/20"
                    >
                      <p className="text-sm text-wrath text-center" style={{ fontFamily: "var(--font-body)" }}>
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom info */}
              <div className="flex items-center justify-center gap-4 mt-4 text-[10px] tracking-[0.1em] text-white/30 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 2-4</span>
                <span className="text-white/10">&middot;</span>
                <span className="flex items-center gap-1"><img src={ICON_URLS.energy_generic} alt="" className="w-3 h-3 object-contain" /> Real-time</span>
                <span className="text-white/10">&middot;</span>
                <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> Bots</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom: Scroll indicator ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="pb-6 text-center shrink-0"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/20 text-xs"
          >
            <p className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Scroll to explore
            </p>
            <span>&#x25BE;</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ═══ BELOW THE FOLD — Game Info Sections ═══ */}
      <div className="relative z-10 bg-gradient-to-b from-[#050508] via-[#0a0a12] to-[#050508]">

        {/* ─── All 7 Sins Grid ─── */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                Choose Your Damnation
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-white/90 tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                7 FACTIONS. 350 CARDS.
              </h2>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/15" />
                <div className="w-1 h-1 rotate-45 bg-white/15" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/15" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4" data-tutorial="faction-cards">
              {SIN_HEROES.map((sin) => (
                <motion.div
                  key={sin.key}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className={`glass-panel-${sin.key} rounded-xl p-3 text-center cursor-default relative overflow-hidden group`}
                >
                  {/* Portrait */}
                  {FACTION_PORTRAITS[sin.key] && (
                    <div className="w-full aspect-[3/4] rounded-lg overflow-hidden mb-2 relative">
                      <img
                        src={FACTION_PORTRAITS[sin.key]}
                        alt={sin.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        width={369}
                        height={492}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-2 right-2">
                        <img src={SIN_ARCHETYPE_ICONS[sin.key]} alt="" className="w-5 h-5 drop-shadow-lg" />
                      </div>
                    </div>
                  )}
                  <p
                    className="text-[9px] tracking-[0.3em] uppercase opacity-40 mb-0.5"
                    style={{ fontFamily: "var(--font-heading)", color: `var(--color-${sin.color})` }}
                  >
                    {sin.latin}
                  </p>
                  <h3
                    className="text-sm font-bold tracking-wider mb-1"
                    style={{ fontFamily: "var(--font-heading)", color: `var(--color-${sin.color})` }}
                  >
                    {sin.name}
                  </h3>
                  <p className="text-[10px] text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {sin.tagline}
                  </p>
                  <p
                    className="text-[8px] mt-1.5 uppercase tracking-wider opacity-40"
                    style={{ fontFamily: "var(--font-heading)", color: `var(--color-${sin.color})` }}
                  >
                    {sin.subtitle}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Card Mechanics ─── */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                The Three Patterns of Sin
              </p>
              <h2 className="text-xl md:text-2xl font-black text-white/90 tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                COMPOUND PATTERNS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Standard */}
              <div className="rounded-xl p-5 border border-white/8 bg-white/3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-sloth/10 border border-sloth/20 flex items-center justify-center">
                    <img src={ICON_URLS.shield_generic} alt="" className="w-4 h-4 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-sloth tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>STANDARD</h3>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Steady Growth</p>
                  </div>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  Fibonacci scaling: 1, 1, 2, 3, 5, 8... Reliable growth that accelerates over time.
                </p>
              </div>

              {/* Aggressive */}
              <div className="rounded-xl p-5 border border-wrath/8 bg-wrath/3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-wrath/10 border border-wrath/20 flex items-center justify-center">
                    <img src={ICON_URLS.damage_wrath} alt="" className="w-4 h-4 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-wrath tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>AGGRESSIVE</h3>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Front-loaded</p>
                  </div>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  Exponential scaling: 1, 2, 4, 8, 16... Devastating if left unchecked.
                </p>
              </div>

              {/* Slowburn */}
              <div className="rounded-xl p-5 border border-greed-glow/8 bg-greed-glow/3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-greed-glow/10 border border-greed-glow/20 flex items-center justify-center">
                    <img src={ICON_URLS.buff_generic} alt="" className="w-4 h-4 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-greed-glow tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>SLOWBURN</h3>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Steady Payoff</p>
                  </div>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  Linear scaling: 1, 1, 1, 1, 2, 2, 3... Minimal early, steady late. Patience rewarded.
                </p>
              </div>
            </div>

            {/* Round 16 Warning */}
            <div className="mt-6 rounded-xl p-4 border border-wrath/15 bg-wrath/5 text-center">
              <p className="text-[11px] text-wrath/80 font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                &#x26A0; Round 16: The Reckoning
              </p>
              <p className="text-[10px] text-white/40 mt-1" style={{ fontFamily: "var(--font-body)" }}>
                All afflictions deal double damage from round 16 onward. End it fast, or be consumed.
              </p>
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              The Ritual
            </p>
            <div className="flex gap-4 justify-center">
              {[
                { num: "1", label: "Pick a sin", color: "wrath" },
                { num: "2", label: "Spend corruption", color: "candle" },
                { num: "3", label: "Play compounds", color: "greed-glow" },
                { num: "4", label: "Last sinner wins", color: "sloth" },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className={`w-10 h-10 rounded-full bg-${step.color}/8 border border-${step.color}/15 flex items-center justify-center mx-auto mb-2`}>
                    <span className={`text-sm font-bold text-${step.color}`} style={{ fontFamily: "var(--font-heading)" }}>{step.num}</span>
                  </div>
                  <p className="text-[10px] text-white/50" style={{ fontFamily: "var(--font-body)" }}>{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="py-8 px-4 text-center border-t border-white/5">
          <p className="text-[9px] text-white/20 mb-3" style={{ fontFamily: "var(--font-body)" }}>
            350 cards &middot; 7 factions &middot; 20 rounds &middot; 200 HP &middot; 3 compound patterns &middot; Zero mercy
          </p>
          <div className="text-[8px] text-white/15 space-y-0.5" style={{ fontFamily: "var(--font-body)" }}>
            <p>Music: "Dark City" by Muncheybobo &middot; "Dark Ambient" by Alexandr Zhelanov &middot; "Dark Ambient Loop 13" by MundoSound</p>
            <p>SFX: Card Game Sounds (CC0) &middot; JC Sounds Fantasy SFX Pack (CC-BY 4.0) &middot; Icons: Painterly Spell Icons by J. W. Bjerk (CC-BY 3.0)</p>
            <p>All assets from <a href="https://opengameart.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/25 transition-colors">OpenGameArt.org</a></p>
          </div>
        </footer>
      </div>
    </div>
  );
}
