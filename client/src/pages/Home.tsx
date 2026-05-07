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
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTutorial } from "@/contexts/TutorialContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import { Users, Bot, GraduationCap, ChevronLeft, ChevronRight, BookOpen, LogIn, Swords } from "lucide-react";
import { useSupabaseAuth } from "@/contexts/AuthContext";
import { ICON_URLS } from "@/lib/assetUrls";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import GlitchTitle from "@/components/GlitchTitle";
import type { SinType } from "@shared/gameTypes";
// HeroBabylonScene removed from homepage for performance (Babylon.js = 3MB+ bundle)
// The EmberField CSS particle system provides the atmospheric background instead
import EmberField from "@/components/EmberField";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";
import CampaignContinueTile from "@/components/CampaignContinueTile";
import { usePlayerId } from "@/hooks/usePlayerId";
import { useFactionUnlocks } from "@/hooks/useFactionUnlocks";
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
    desc: "Vengeance: Strike me and feel the wound twice.",
    color: "wrath",
    heroImg: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/hero-wrath-opt_37c4a2c3.webp",
  },
  {
    key: "sloth", name: "SLOTH", latin: "ACEDIA", subtitle: "The Enduring",
    tagline: "Why rush? Everything dies eventually.",
    desc: "Endurance: Patience is armor. Stillness is strength.",
    color: "sloth",
    heroImg: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/hero-sloth-opt_ace8da83.webp",
  },
  {
    key: "greed", name: "GREED", latin: "AVARITIA", subtitle: "The Collector",
    tagline: "Everything has a price. Yours is higher.",
    desc: "Tax: Every wound you deal fills my coffers.",
    color: "greed",
    heroImg: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/hero-greed-opt_1340cd4c.webp",
  },
  {
    key: "envy", name: "ENVY", latin: "INVIDIA", subtitle: "The Mimic",
    tagline: "If I can't have it, neither can you.",
    desc: "Jealousy: Your suffering looks so good on you. Let me make it worse.",
    color: "envy",
    heroImg: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/hero-envy-opt_37a0b39f.webp",
  },
  {
    key: "pride", name: "PRIDE", latin: "SUPERBIA", subtitle: "The Exalted",
    tagline: "Kneel. Or be made to.",
    desc: "Hubris: Assert dominance. Punish everyone beneath you.",
    color: "pride",
    heroImg: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/hero-pride-opt_7b43ac54.webp",
  },
  {
    key: "lust", name: "LUST", latin: "LUXURIA", subtitle: "The Temptress",
    tagline: "Come closer. It only hurts at first.",
    desc: "Temptation: Your pain is my pleasure. Literally.",
    color: "lust",
    heroImg: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/hero-lust-opt_cdcc85ed.webp",
  },
  {
    key: "gluttony", name: "GLUTTONY", latin: "GULA", subtitle: "The Devourer",
    tagline: "More. Always more. Never enough.",
    desc: "Devourer: Consume their arsenal. Grow stronger with every bite.",
    color: "gluttony",
    heroImg: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/hero-gluttony-opt_d349da8c.webp",
  },
];

/* ─── Component ──────────────────────────────────────────────── */

export default function Home() {
  const playerId = usePlayerId();
  const { startTutorial, hasCompleted: tutorialCompleted, isActive: tutorialActive, setCurrentPage } = useTutorial();
  const factionUnlocks = useFactionUnlocks(); // kept for tutorial context
  const { user: authUser, isLoading: authLoading } = useSupabaseAuth();

  useEffect(() => { setCurrentPage("home"); }, [setCurrentPage]);

  usePageMeta({
    title: "7 Deadly Sins Card Game \u2014 Free PvP Online Card Game",
    description: "Play the 7 Deadly Sins Card Game free online. A dark fantasy PvP card game inspired by mythology, demonology, and the seven deadly sins. No download required.",
    canonicalPath: "/",
    noSuffix: true,
  });

  // SEO: WebSite + VideoGame schema for rich search results
  useEffect(() => {
    const baseUrl = "https://www.7sinscardgame.com";

    let scriptTag = document.querySelector('script[data-home-schema]');
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "application/ld+json");
      scriptTag.setAttribute("data-home-schema", "true");
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "7 Deadly Sins Card Game",
        url: baseUrl,
        description: "A free PvP online card game inspired by mythology, demonology, and the seven deadly sins.",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/blog?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        name: "7 Deadly Sins Card Game",
        description: "A free-to-play dark fantasy PvP card game where players command decks built around the seven deadly sins. Battle online with cards inspired by global mythology, demonology, and folklore.",
        url: baseUrl,
        genre: ["Card Game", "Strategy", "Dark Fantasy", "PvP"],
        gamePlatform: "Web Browser",
        applicationCategory: "Game",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        numberOfPlayers: { "@type": "QuantitativeValue", minValue: 2, maxValue: 4 },
        playMode: ["MultiPlayer", "CoOp"],
        inLanguage: "en",
        isAccessibleForFree: true,
      },
    ]);

    return () => {
      const schema = document.querySelector('script[data-home-schema]');
      if (schema) schema.remove();
    };
  }, []);
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

  // First-time visitors: no longer auto-trigger the tooltip tutorial.
  // Instead, the QuickStart modal in the Lobby and the How to Play page handle onboarding.
  // The old tooltip tutorial is still accessible from the SigilMenu → Game Rules.

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
      console.error("[CreateGame]", err);
      setError("The cathedral rejects your offering. Please try again.");
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
      console.error("[JoinGame]", err);
      const msg = err?.message?.toLowerCase?.() || "";
      if (msg.includes("not found") || msg.includes("invalid")) {
        setError("Invalid code. The cathedral doors remain sealed.");
      } else if (msg.includes("full")) {
        setError("This penance is full. Seek another congregation.");
      } else {
        setError("The cathedral doors remain sealed. Please try again.");
      }
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
    <div className="min-h-screen bg-[var(--color-page-bg-deep)] relative overflow-hidden">
      {/* ═══ Lightweight Atmospheric Background ═══ */}
      <EmberField count={24} />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" style={{ zIndex: 1 }} />


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
            className="text-[11px] md:text-xs tracking-[0.5em] text-white/30 uppercase mb-2"
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
                aria-label="Previous faction"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
                aria-label="Next faction"
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
                        className="text-xs md:text-sm tracking-[0.4em] uppercase mb-1 opacity-60"
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
                    className="text-xs md:text-sm tracking-[0.3em] uppercase mb-2 opacity-50"
                    style={{ fontFamily: "var(--font-heading)", color: `var(--color-${currentSin.color})` }}
                  >
                    {currentSin.subtitle}
                  </p>
                  <p
                    className="text-lg md:text-xl text-white/80 leading-relaxed mb-3"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {currentSin.tagline}
                  </p>
                  <div
                    className="inline-block rounded-lg px-3 py-1.5 text-xs md:text-sm tracking-wider border"
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
                    className="block text-xs tracking-[0.2em] text-white/40 uppercase mb-2"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  {/* ─── Primary CTA: Create Game ─── */}
                  <motion.button
                    data-tutorial="create-game"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="w-full rounded-xl py-3.5 px-6 text-base font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    style={{
                      fontFamily: "var(--font-heading)",
                      background: `linear-gradient(135deg, var(--color-${currentSin.color}), color-mix(in oklch, var(--color-${currentSin.color}) 60%, black))`,
                      color: currentSin.key === "pride" ? "#111" : "#fff",
                      boxShadow: `0 0 20px color-mix(in oklch, var(--color-${currentSin.color}) 30%, transparent)`,
                    }}
                  >
                    <img src={SIN_ARCHETYPE_ICONS[currentSin.key]} alt="" aria-hidden="true" className="w-4 h-4" />
                    {isCreating ? "OPENING THE GATES..." : "CREATE GAME"}
                  </motion.button>

                  {/* ─── Secondary CTAs: Sign In + Deck Builder side by side ─── */}
                  <div className="grid grid-cols-2 gap-3">
                    {!authLoading && !authUser ? (
                      <Link href="/login">
                        <motion.div
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full rounded-xl py-3 px-4 text-sm font-bold tracking-wider border border-amber-500/30 text-amber-200/70 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          <LogIn className="w-4 h-4" />
                          SIGN IN
                        </motion.div>
                      </Link>
                    ) : (
                      <Link href="/collection">
                        <motion.div
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full rounded-xl py-3 px-4 text-sm font-bold tracking-wider border border-amber-500/20 text-amber-200/60 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          <BookOpen className="w-4 h-4" />
                          COLLECTION
                        </motion.div>
                      </Link>
                    )}
                    <Link href="/deck-builder">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full rounded-xl py-3 px-4 text-sm font-bold tracking-wider border border-white/15 text-white/70 hover:bg-white/5 hover:border-white/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        <Swords className="w-4 h-4" />
                        DECK BUILDER
                      </motion.div>
                    </Link>
                  </div>

                  {/* ─── Continue Campaign banner (appears only when there's something to resume) ─── */}
                  <CampaignContinueTile />

                  {/* ─── Tertiary: How to Play + Campaign + Practice ─── */}
                  <div className="grid grid-cols-3 gap-2">
                    <Link href="/how-to-play">
                      <motion.div
                        data-tutorial="how-to-play"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full rounded-xl py-2 px-3 text-xs border border-white/8 text-white/40 hover:bg-white/5 hover:border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        HOW TO PLAY
                      </motion.div>
                    </Link>
                    <Link href="/campaign">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full rounded-xl py-2 px-3 text-xs border border-amber-400/25 text-amber-200/70 hover:bg-amber-400/10 hover:border-amber-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        <Swords className="w-3.5 h-3.5" />
                        CAMPAIGN
                      </motion.div>
                    </Link>
                    <Link href="/practice">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full rounded-xl py-2 px-3 text-xs border border-amber-500/15 text-amber-300/50 hover:bg-amber-500/5 hover:border-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        <Bot className="w-3.5 h-3.5" />
                        PRACTICE
                      </motion.div>
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-xs tracking-[0.15em] text-white/25 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
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
                        className="w-full rounded-xl py-3.5 px-6 text-base font-bold tracking-wider flex items-center justify-center gap-2 border border-white/10 text-white/70 hover:bg-white/5 transition-all"
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
                            className="flex-1 rounded-xl py-3 px-4 text-base font-bold tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 border border-white/15 text-white/80 hover:bg-white/5 transition-all"
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
              <div className="flex items-center justify-center gap-4 mt-4 text-xs tracking-[0.1em] text-white/30 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 2-4</span>
                <span className="text-white/10">&middot;</span>
                <span className="flex items-center gap-1"><img src={ICON_URLS.energy_generic} alt="" aria-hidden="true" className="w-3 h-3 object-contain" /> Real-time</span>
                <span className="text-white/10">&middot;</span>
                <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> Bots</span>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* ═══ Footer ═══ */}
      <ScrollReveal direction="up" delay={100} distance={20}>
      <div className="relative z-10">

        {/* ─── Footer ─── */}
        <footer className="py-12 px-4 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {[
                { label: "Home", href: "/" },
                { label: "Balance Analysis", href: "/balance" },
                { label: "Brandbook", href: "/brandbook" },
                { label: "Card Collection", href: "/collection" },
                { label: "Community Decks", href: "/community" },
                { label: "Deck Builder", href: "/deck-builder" },
                { label: "Game Rules", href: "/rules" },
                { label: "How to Play", href: "/how-to-play" },
                { label: "Lore", href: "/blog" },
                { label: "Matchup Matrix", href: "/matchups" },
                { label: "Chronicles", href: "/chronicles" },
                { label: "Patch Notes", href: "/changelog" },
                { label: "Practice Mode", href: "/practice" },
                { label: "Campaign", href: "/campaign" },
                { label: "FAQ", href: "/faq" },
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
                { label: "Cookies", href: "/cookies" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] tracking-[0.15em] uppercase text-white/50 hover:text-white/80 transition-colors"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Logo divider */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/20" />
              <img
                src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-logo-v3-3chkwhz9LsB5kZ8AaXhdvw.webp"
                alt="7S"
                className="w-10 h-10 opacity-40"
              />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/20" />
            </div>

            {/* Game Stats */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6">
              {[
                "424 Cards", "7 Factions", "20 Rounds", "333 HP", "3 Compound Patterns", "Final Reckoning"
              ].map((stat, i) => (
                <span key={i} className="text-[10px] tracking-[0.1em] uppercase text-white/40" style={{ fontFamily: "var(--font-heading)" }}>
                  {stat}
                </span>
              ))}
            </div>

            {/* Credits — organized in a clean grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center">
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/45 mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>Music</p>
                <div className="text-[9px] text-white/30 space-y-0.5" style={{ fontFamily: "var(--font-body)" }}>
                  <p>"Dark City" by Muncheybobo</p>
                  <p>"Dark Ambient" by Alexandr Zhelanov</p>
                  <p>"Dark Ambient Loop 13" by MundoSound</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/45 mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>Sound &amp; Icons</p>
                <div className="text-[9px] text-white/30 space-y-0.5" style={{ fontFamily: "var(--font-body)" }}>
                  <p>Card Game Sounds (CC0)</p>
                  <p>JC Sounds Fantasy SFX (CC-BY 4.0)</p>
                  <p>Painterly Spell Icons by J.W. Bjerk (CC-BY 3.0)</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/45 mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>Assets</p>
                <div className="text-[9px] text-white/30 space-y-0.5" style={{ fontFamily: "var(--font-body)" }}>
                  <p>All assets sourced from</p>
                  <a href="https://opengameart.org" target="_blank" rel="noopener noreferrer" className="text-white/45 hover:text-white/60 underline transition-colors">OpenGameArt.org</a>
                  <p className="mt-1">Card art generated with AI</p>
                </div>
              </div>
            </div>

            {/* Buy Me a Coffee */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/20" />
                <p className="text-[9px] tracking-[0.2em] uppercase text-amber-200/55" style={{ fontFamily: "var(--font-heading)" }}>
                  Fuel the Inferno
                </p>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/20" />
              </div>
              <a
                href="https://www.buymeacoffee.com/jojovh"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col sm:flex-row items-center gap-4 px-5 py-4 rounded-xl border border-amber-500/10 bg-gradient-to-br from-amber-900/10 to-transparent hover:border-amber-500/25 hover:from-amber-900/20 transition-all duration-300"
              >
                {/* QR Code */}
                <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-amber-500/15 group-hover:border-amber-500/30 transition-colors shadow-lg shadow-amber-900/10">
                  <img
                    src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/bmc-qr-gothic-500_fc4d04dd.png"
                    alt="Scan to buy me a coffee"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Text */}
                <div className="text-center sm:text-left">
                  <p className="text-xs text-amber-200/80 group-hover:text-amber-200 transition-colors mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                    Buy Me a Coffee
                  </p>
                  <p className="text-[10px] text-white/40 group-hover:text-white/55 transition-colors leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    If you enjoy the game, consider offering<br className="hidden sm:block" />
                    a sinful tribute to keep the fires burning.
                  </p>
                </div>
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {[
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Cookie Policy", href: "/cookies" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[9px] tracking-[0.1em] uppercase text-white/35 hover:text-white/55 transition-colors"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-[8px] text-white/30 text-center" style={{ fontFamily: "var(--font-body)" }}>
              &copy; {new Date().getFullYear()} 7 Deadly Sins Card Game. Made with unholy devotion.
            </p>
          </div>
        </footer>
      </div>
      </ScrollReveal>
    </div>
  );
}
