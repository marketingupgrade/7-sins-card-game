/**
 * Changelog / Patch Notes Page
 *
 * Documents version history, balance changes, new features, and bug fixes.
 * Structured as a reverse-chronological timeline with version badges,
 * categorized entries (balance, feature, fix, breaking), and faction-specific
 * change callouts. Dark gothic branding, mobile responsive.
 *
 * Adding new entries:
 * 1. Add a new object to the CHANGELOG array at the top
 * 2. Each entry has: version, date, title, summary, and an array of changes
 * 3. Changes are categorized as: balance | feature | fix | breaking
 * 4. Optional: add factions array to tag faction-specific changes
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import EmberField from "@/components/EmberField";

// ─── Types ──────────────────────────────────────────────────────────────────

type ChangeCategory = "balance" | "feature" | "fix" | "breaking";

interface ChangeEntry {
  category: ChangeCategory;
  text: string;
  factions?: string[];
}

interface PatchNote {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: ChangeEntry[];
  /** Whether this is a major release (gets special styling) */
  major?: boolean;
}

// ─── Category Config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<ChangeCategory, { label: string; color: string; bgColor: string; borderColor: string }> = {
  balance: {
    label: "BALANCE",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  feature: {
    label: "FEATURE",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  fix: {
    label: "FIX",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
  },
  breaking: {
    label: "BREAKING",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
};

// ─── Faction Colors ─────────────────────────────────────────────────────────

const FACTION_COLORS: Record<string, string> = {
  Wrath: "text-red-400 bg-red-500/10 border-red-500/20",
  Sloth: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Greed: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Envy: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  Pride: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  Lust: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  Gluttony: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

// ─── Changelog Data ─────────────────────────────────────────────────────────
// Add new entries at the TOP of this array (newest first)

const CHANGELOG: PatchNote[] = [
  {
    version: "5.1.0",
    date: "March 2026",
    title: "The Scholar's Update",
    summary: "New reference pages, community discussion system, and comprehensive documentation for competitive play.",
    major: true,
    changes: [
      { category: "feature", text: "Added Balance Analysis page with 10 analytical sections, 8 chart visualizations, and methodology documentation" },
      { category: "feature", text: "Added Matchup Matrix page with 7x7 faction win-rate heatmap, color-coded advantage/disadvantage cells, and faction profiles" },
      { category: "feature", text: "Added Game Rules page covering core rules, energy system, compound patterns, all 16 effect types, 7 faction passives, and skip-queue mechanics" },
      { category: "feature", text: "Added database-backed Discussion system on the Balance Analysis page with threaded replies, upvotes, and guest identity" },
      { category: "feature", text: "Added Changelog page to document version history and balance changes" },
      { category: "feature", text: "Added Terms & Conditions, Privacy Policy, and Cookie Policy pages" },
      { category: "feature", text: "Added themed SigilMenu (hamburger menu) for all non-game navigation, positioned top-right without blocking sound controls" },
      { category: "feature", text: "Added AI-generated artwork disclaimer and IP liability waiver to Terms" },
      { category: "fix", text: "Fixed card images being cut off in collection grid view" },
      { category: "fix", text: "Fixed white backgrounds visible on some card art (scale + inset shadow vignette)" },
      { category: "fix", text: "Improved compound tick value display with clearer per-round damage table" },
      { category: "fix", text: "Fixed collection page filters overwhelming mobile viewport (now collapsible)" },
      { category: "fix", text: "Replaced emoji icons in Game Rules with themed inline SVGs" },
      { category: "fix", text: "Redesigned homepage footer with organized credits and navigation links" },
    ],
  },
  {
    version: "5.0.0",
    date: "February 2026",
    title: "The Cathedral Opens",
    summary: "Full game launch with 7 factions, 378 cards, real-time multiplayer, and bot opponents. The cathedral doors swing wide.",
    major: true,
    changes: [
      { category: "feature", text: "Launched 7 playable factions: Wrath, Sloth, Greed, Envy, Pride, Lust, and Gluttony" },
      { category: "feature", text: "378 unique cards across Common, Rare, and Epic rarities with hand-crafted AI artwork" },
      { category: "feature", text: "Real-time multiplayer for 2-4 players with WebSocket synchronization" },
      { category: "feature", text: "Bot opponents with adaptive difficulty for solo practice" },
      { category: "feature", text: "Card Collection browser with faction filters, rarity sorting, and detailed card inspection" },
      { category: "feature", text: "Tutorial system (20 steps) for new players with contextual guidance" },
      { category: "feature", text: "Compound damage system with Standard, Aggressive, and Slowburn patterns" },
      { category: "feature", text: "16 unique effect types including damage, healing, shields, and status afflictions" },
      { category: "feature", text: "Faction unlock system rewarding wins with new playable factions" },
      { category: "feature", text: "Dark ambient soundtrack with three music tracks and full SFX library" },
      { category: "feature", text: "The Reckoning mechanic at round 16: all compound effects deal double damage" },
      { category: "balance", text: "Initial faction balance pass based on 10,000 simulated games", factions: ["Wrath", "Sloth", "Greed", "Envy", "Pride", "Lust", "Gluttony"] },
    ],
  },
  {
    version: "4.2.0",
    date: "January 2026",
    title: "The Reckoning Patch",
    summary: "Introduced The Reckoning mechanic and rebalanced late-game scaling across all factions.",
    changes: [
      { category: "breaking", text: "Added The Reckoning at round 16: all active compound effects deal double damage for the remainder of the game" },
      { category: "balance", text: "Wrath: Vengeance passive reflection reduced from 100% to 75% of incoming damage", factions: ["Wrath"] },
      { category: "balance", text: "Sloth: Endurance shield generation now scales with stored energy (was flat)", factions: ["Sloth"] },
      { category: "balance", text: "Lust: Temptation lifesteal reduced from 30% to 25% of DoT damage dealt", factions: ["Lust"] },
      { category: "balance", text: "Pride: Hubris bonus now requires playing the single most expensive card (not just any expensive card)", factions: ["Pride"] },
      { category: "fix", text: "Fixed compound effects sometimes ticking twice on the round they were applied" },
      { category: "fix", text: "Fixed energy display not updating after skip-queue card resolution" },
    ],
  },
  {
    version: "4.1.0",
    date: "December 2025",
    title: "The Envy Rework",
    summary: "Major rework of Envy's Jealousy passive and several underperforming Envy cards.",
    changes: [
      { category: "breaking", text: "Envy: Jealousy passive completely reworked. Now deepens the target's worst existing affliction instead of copying effects", factions: ["Envy"] },
      { category: "balance", text: "Envy: Nemesis card base damage increased from 6 to 8", factions: ["Envy"] },
      { category: "balance", text: "Envy: Curse Cascade now applies to all opponents (was single target)", factions: ["Envy"] },
      { category: "balance", text: "Gluttony: Devourer passive energy gain from destroying cards reduced from 2 to 1", factions: ["Gluttony"] },
      { category: "feature", text: "Added card rarity indicators to the in-game hand display" },
      { category: "fix", text: "Fixed Greed's Tax passive not generating shields when dealing 0 damage ticks" },
    ],
  },
  {
    version: "4.0.0",
    date: "November 2025",
    title: "The Seven Sins",
    summary: "Added the final two factions (Pride and Gluttony), completing the seven deadly sins roster.",
    major: true,
    changes: [
      { category: "feature", text: "Added Pride faction with Hubris passive: playing the most expensive card amplifies all effects", factions: ["Pride"] },
      { category: "feature", text: "Added Gluttony faction with Devourer passive: destroying enemy cards feeds your energy", factions: ["Gluttony"] },
      { category: "feature", text: "54 new cards across Pride and Gluttony (27 each)" },
      { category: "balance", text: "Rebalanced all existing factions to accommodate 7-faction meta", factions: ["Wrath", "Sloth", "Greed", "Envy", "Lust"] },
      { category: "feature", text: "Added faction-specific card art for all 378 cards" },
      { category: "fix", text: "Fixed lobby desync when a player disconnects during faction selection" },
    ],
  },
  {
    version: "3.0.0",
    date: "September 2025",
    title: "The Corruption Engine",
    summary: "Complete overhaul of the energy system, now themed as Corruption. Introduced compound patterns.",
    major: true,
    changes: [
      { category: "breaking", text: "Energy system renamed to Corruption. Starting energy changed from 3 to 2, max energy changed from 10 to 7" },
      { category: "feature", text: "Introduced three compound patterns: Standard (Fibonacci), Aggressive (Powers of 2), and Slowburn (flat ramp)" },
      { category: "balance", text: "All card costs rebalanced for the new 0-6 Corruption range" },
      { category: "feature", text: "Added skip-queue mechanic: certain cards resolve before normal priority order" },
      { category: "fix", text: "Fixed turn timer not pausing when a player disconnects" },
    ],
  },
];

// ─── Filter Buttons ─────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: ChangeCategory | "all"; label: string }[] = [
  { value: "all", label: "All Changes" },
  { value: "balance", label: "Balance" },
  { value: "feature", label: "Features" },
  { value: "fix", label: "Fixes" },
  { value: "breaking", label: "Breaking" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function Changelog() {
  const [filter, setFilter] = useState<ChangeCategory | "all">("all");

  const filteredChangelog = useMemo(() => {
    if (filter === "all") return CHANGELOG;
    return CHANGELOG.map((patch) => ({
      ...patch,
      changes: patch.changes.filter((c) => c.category === filter),
    })).filter((patch) => patch.changes.length > 0);
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      <EmberField count={15} />
      <div className="absolute inset-0 noise-overlay pointer-events-none" style={{ zIndex: 1 }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-heading)" }}>Back to Cathedral</span>
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Chronicle of Changes
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white/90 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            PATCH NOTES
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/30" />
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-amber-500/40">
              <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="currentColor" />
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/30" />
          </div>
          <p className="text-sm text-white/40 max-w-xl" style={{ fontFamily: "var(--font-body)" }}>
            Every balance tweak, new feature, and bug fix documented. Because transparency is not a sin.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = filter === opt.value;
            const catConfig = opt.value !== "all" ? CATEGORY_CONFIG[opt.value] : null;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] tracking-wider uppercase transition-all duration-200 border ${
                  isActive
                    ? catConfig
                      ? `${catConfig.bgColor} ${catConfig.color} ${catConfig.borderColor}`
                      : "bg-white/10 text-white/80 border-white/20"
                    : "bg-transparent text-white/30 border-white/5 hover:text-white/50 hover:border-white/10"
                }`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/20 via-white/5 to-transparent" />

          <div className="space-y-12">
            {filteredChangelog.map((patch, patchIdx) => (
              <div key={patch.version} className="relative">
                {/* Timeline dot */}
                <div className={`absolute left-2.5 md:left-3.5 top-1 w-3 h-3 rounded-full border-2 ${
                  patch.major
                    ? "bg-amber-500 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                    : "bg-white/10 border-white/20"
                }`} />

                {/* Content */}
                <div className="ml-12 md:ml-14">
                  {/* Version header */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider ${
                        patch.major
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                          : "bg-white/5 text-white/50 border border-white/10"
                      }`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      v{patch.version}
                    </span>
                    <span className="text-[11px] text-white/25 tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
                      {patch.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-lg md:text-xl font-bold text-white/85 tracking-wide mb-1"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {patch.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-sm text-white/35 mb-4 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {patch.summary}
                  </p>

                  {/* Changes list */}
                  <div
                    className="rounded-xl overflow-hidden border border-white/5"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                    }}
                  >
                    {patch.changes.map((change, changeIdx) => {
                      const cat = CATEGORY_CONFIG[change.category];
                      return (
                        <div
                          key={changeIdx}
                          className={`flex items-start gap-3 px-4 py-3 ${
                            changeIdx < patch.changes.length - 1 ? "border-b border-white/[0.03]" : ""
                          }`}
                        >
                          {/* Category badge */}
                          <span
                            className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border ${cat.bgColor} ${cat.color} ${cat.borderColor}`}
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {cat.label}
                          </span>

                          {/* Change text */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white/55 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                              {change.text}
                            </p>

                            {/* Faction tags */}
                            {change.factions && change.factions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {change.factions.map((faction) => (
                                  <span
                                    key={faction}
                                    className={`px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase border ${
                                      FACTION_COLORS[faction] || "text-white/30 bg-white/5 border-white/10"
                                    }`}
                                    style={{ fontFamily: "var(--font-heading)" }}
                                  >
                                    {faction}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* End of timeline marker */}
        <div className="relative mt-12">
          <div className="absolute left-2.5 md:left-3.5 top-0 w-3 h-3 rounded-full bg-white/5 border border-white/10" />
          <div className="ml-12 md:ml-14">
            <p className="text-[11px] text-white/15 tracking-wider italic" style={{ fontFamily: "var(--font-body)" }}>
              The chronicle begins here. More entries will be added as the game evolves.
            </p>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-4">
          <Link href="/rules" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Game Rules
          </Link>
          <span className="text-white/10">&middot;</span>
          <Link href="/balance" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Balance Analysis
          </Link>
          <span className="text-white/10">&middot;</span>
          <Link href="/matchups" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Matchup Matrix
          </Link>
          <span className="text-white/10">&middot;</span>
          <Link href="/" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
