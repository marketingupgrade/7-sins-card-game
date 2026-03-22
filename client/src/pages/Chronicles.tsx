/**
 * Chronicles Feed — The Social Proof Engine
 *
 * Public feed of AI-generated alternate histories created by player matches.
 * Each card shows: cover art thumbnail, rarity badge, title, open-loop excerpt,
 * civilization type, player names with factions, view count, and date.
 *
 * Design principles (from v3 execution prompt):
 * - Show the humans, not just the stories (player names + factions)
 * - Highlight rarity (glow borders for Epic/Legendary)
 * - Show view counts (Bandwagon Effect)
 * - Civilization type filters as identity badges
 * - "Chronicle of the Week" featured banner
 * - Cover art thumbnails for visual appeal
 *
 * Behavioral hooks:
 * - Social Proof (Cialdini): real people played this
 * - Scarcity: rare chronicles get special treatment
 * - Bandwagon: view counts signal value
 * - Epic Meaning (CD1): "my chronicle could be featured"
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Eye,
  Crown,
  Sword,
  Sparkles,
  Scale,
  Filter,
  ChevronRight,
  Scroll,
  ImageIcon,
} from "lucide-react";

// ---- Rarity Config ----
const RARITY_CONFIG = {
  common: {
    label: "Common",
    color: "text-zinc-400",
    bg: "bg-zinc-800/50",
    border: "border-zinc-700/50",
    glow: "",
  },
  rare: {
    label: "Rare",
    color: "text-blue-400",
    bg: "bg-blue-950/30",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
  },
  epic: {
    label: "Epic",
    color: "text-purple-400",
    bg: "bg-purple-950/30",
    border: "border-purple-500/40",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
  },
  legendary: {
    label: "Legendary",
    color: "text-amber-400",
    bg: "bg-amber-950/20",
    border: "border-amber-500/50",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.25)]",
  },
} as const;

const CIV_CONFIG = {
  warrior_empire: {
    label: "Warrior Empire",
    icon: Sword,
    color: "text-red-400",
    bg: "bg-red-950/30",
  },
  enlightened_republic: {
    label: "Enlightened Republic",
    icon: Sparkles,
    color: "text-cyan-400",
    bg: "bg-cyan-950/30",
  },
  merchant_federation: {
    label: "Merchant Federation",
    icon: Scale,
    color: "text-amber-400",
    bg: "bg-amber-950/30",
  },
  balanced: {
    label: "Balanced",
    icon: Crown,
    color: "text-zinc-300",
    bg: "bg-zinc-800/30",
  },
} as const;

const SIN_COLORS: Record<string, string> = {
  wrath: "text-red-400",
  sloth: "text-purple-400",
  greed: "text-amber-400",
  envy: "text-emerald-400",
  pride: "text-cyan-400",
  lust: "text-pink-400",
  gluttony: "text-orange-400",
};

type RarityFilter = "common" | "rare" | "epic" | "legendary" | undefined;
type CivFilter = "warrior_empire" | "enlightened_republic" | "merchant_federation" | "balanced" | undefined;

export default function Chronicles() {
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>(undefined);
  const [civFilter, setCivFilter] = useState<CivFilter>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const { data: chroniclesData, isLoading } = trpc.game.getPublishedChronicles.useQuery({
    limit: 50,
    offset: 0,
    rarityTier: rarityFilter,
    civilizationType: civFilter,
  });

  const chronicles = chroniclesData?.chronicles || [];

  // Find "Chronicle of the Week" — most viewed
  const chronicleOfTheWeek = useMemo(() => {
    if (chronicles.length === 0) return null;
    return chronicles.reduce((best: any, c: any) =>
      (c.view_count || 0) > (best.view_count || 0) ? c : best
    );
  }, [chronicles]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-zinc-100">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-10">
          <Link href="/" className="text-amber-500/60 hover:text-amber-400 text-sm font-[Cinzel] tracking-wider mb-6 inline-flex items-center gap-1 transition-colors">
            <ChevronRight className="w-3 h-3 rotate-180" /> Back to Cathedral
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Scroll className="w-8 h-8 text-amber-500/80" />
            <h1 className="text-3xl md:text-4xl font-[Cinzel] text-amber-100 tracking-wide">
              The Chronicles
            </h1>
          </div>
          <p className="text-zinc-400 font-['Cormorant_Garamond'] text-lg italic max-w-2xl">
            Every match writes a chapter of alternate history. These are the civilizations
            that rose and fell in the Cathedral of Sins.
          </p>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-6 flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400 transition-colors font-[Cinzel] tracking-wider"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Filter Chronicles"}
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-3">
              {/* Rarity filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-zinc-500 font-[Cinzel] tracking-wider self-center mr-1">
                  RARITY:
                </span>
                {(Object.keys(RARITY_CONFIG) as Array<keyof typeof RARITY_CONFIG>).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setRarityFilter(rarityFilter === tier ? undefined : tier)}
                    className={`px-3 py-1 text-xs font-[Cinzel] tracking-wider rounded-full border transition-all ${
                      rarityFilter === tier
                        ? `${RARITY_CONFIG[tier].bg} ${RARITY_CONFIG[tier].border} ${RARITY_CONFIG[tier].color}`
                        : "border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {RARITY_CONFIG[tier].label}
                  </button>
                ))}
              </div>

              {/* Civilization type filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-zinc-500 font-[Cinzel] tracking-wider self-center mr-1">
                  TYPE:
                </span>
                {(Object.keys(CIV_CONFIG) as Array<keyof typeof CIV_CONFIG>).map((civ) => {
                  const config = CIV_CONFIG[civ];
                  return (
                    <button
                      key={civ}
                      onClick={() => setCivFilter(civFilter === civ ? undefined : civ)}
                      className={`px-3 py-1 text-xs font-[Cinzel] tracking-wider rounded-full border transition-all flex items-center gap-1.5 ${
                        civFilter === civ
                          ? `${config.bg} border-current ${config.color}`
                          : "border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      <config.icon className="w-3 h-3" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-amber-200/60 text-sm font-[Cinzel] tracking-wider">
              THE CHRONICLER GATHERS THE SCROLLS...
            </p>
          </div>
        ) : chronicles.length === 0 ? (
          <div className="text-center py-20">
            <Scroll className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-['Cormorant_Garamond'] text-xl italic">
              No chronicles yet. The Chronicler awaits your first battle.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block px-6 py-2.5 bg-amber-600/20 border border-amber-500/30 text-amber-400 font-[Cinzel] text-sm tracking-wider rounded hover:bg-amber-600/30 transition-all"
            >
              Enter the Cathedral
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chronicle of the Week */}
            {chronicleOfTheWeek && !rarityFilter && !civFilter && (
              <div className="relative mb-10">
                <div className="absolute -top-3 left-4 z-10 px-3 py-1 bg-amber-600/90 text-amber-100 text-xs font-[Cinzel] tracking-widest rounded-sm">
                  CHRONICLE OF THE WEEK
                </div>
                <ChronicleCard chronicle={chronicleOfTheWeek} featured />
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {chronicles
                .filter((c: any) => !(!rarityFilter && !civFilter && c.id === chronicleOfTheWeek?.id))
                .map((chronicle: any) => (
                  <ChronicleCard key={chronicle.id} chronicle={chronicle} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Chronicle Card Component ----

interface ChronicleCardProps {
  chronicle: {
    id: string;
    game_id: string;
    title: string;
    excerpt: string;
    civilization_type: string;
    rarity_tier: string;
    player_factions: Array<{ name: string; faction: string }> | null;
    total_rounds: number;
    view_count: number;
    created_at: string;
    cover_image_url?: string | null;
  };
  featured?: boolean;
}

function ChronicleCard({ chronicle, featured }: ChronicleCardProps) {
  const rarity = RARITY_CONFIG[chronicle.rarity_tier as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common;
  const civ = CIV_CONFIG[chronicle.civilization_type as keyof typeof CIV_CONFIG] || CIV_CONFIG.balanced;
  const CivIcon = civ.icon;

  const playerFactions = Array.isArray(chronicle.player_factions)
    ? chronicle.player_factions
    : [];

  const hasCoverArt = !!chronicle.cover_image_url;

  return (
    <Link href={`/chronicle/${chronicle.game_id}`}>
      <div
        className={`group relative rounded-lg border overflow-hidden transition-all duration-300 cursor-pointer hover:translate-y-[-2px] ${
          featured
            ? `${rarity.border} ${rarity.glow} bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-amber-950/20`
            : `${rarity.border} ${rarity.glow} bg-zinc-900/60 hover:bg-zinc-900/80`
        }`}
      >
        {/* Cover Art Thumbnail */}
        {hasCoverArt && (
          <div className="relative w-full h-36 overflow-hidden">
            <img
              src={chronicle.cover_image_url!}
              alt={`Cover art for ${chronicle.title}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
            {/* Rarity badge on image */}
            {rarity.label !== "Common" && (
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-0.5 text-[10px] font-[Cinzel] tracking-widest rounded-sm backdrop-blur-sm bg-black/40 ${rarity.color}`}>
                  ✦ {rarity.label.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          {/* Top row: rarity + date (only show rarity here if no cover art) */}
          <div className="flex items-center justify-between mb-3">
            {!hasCoverArt ? (
              <span className={`text-xs font-[Cinzel] tracking-widest ${rarity.color}`}>
                {rarity.label === "Common" ? "" : `✦ ${rarity.label.toUpperCase()}`}
              </span>
            ) : (
              <span />
            )}
            <span className="text-xs text-zinc-600">
              {new Date(chronicle.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`font-[Cinzel] text-lg leading-snug mb-3 transition-colors ${
              featured ? "text-amber-200 group-hover:text-amber-100" : "text-zinc-200 group-hover:text-amber-200"
            }`}
          >
            {chronicle.title}
          </h3>

          {/* Excerpt (Open Loop) */}
          {chronicle.excerpt && (
            <p className="text-zinc-400 font-['Cormorant_Garamond'] text-base italic leading-relaxed mb-4 line-clamp-2">
              &ldquo;{chronicle.excerpt}&rdquo;
            </p>
          )}

          {/* Civilization type + rounds + players */}
          <div className="flex items-center gap-3 mb-3 text-xs">
            <span className={`flex items-center gap-1 ${civ.color}`}>
              <CivIcon className="w-3.5 h-3.5" />
              <span className="font-[Cinzel] tracking-wider">{civ.label}</span>
            </span>
            <span className="text-zinc-600">&middot;</span>
            <span className="text-zinc-500">{chronicle.total_rounds} rounds</span>
            <span className="text-zinc-600">&middot;</span>
            <span className="text-zinc-500">{playerFactions.length} players</span>
          </div>

          {/* Player factions */}
          {playerFactions.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-3">
              {playerFactions.map((pf, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className={SIN_COLORS[pf.faction] || "text-zinc-400"}>
                    {pf.faction ? pf.faction.charAt(0).toUpperCase() + pf.faction.slice(1) : "?"}
                  </span>
                  <span className="text-zinc-500">{pf.name}</span>
                </span>
              ))}
            </div>
          )}

          {/* View count */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <Eye className="w-3 h-3" />
            <span>{chronicle.view_count || 0} reads</span>
          </div>
        </div>

        {/* Hover arrow */}
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-hover:text-amber-500/60 transition-all group-hover:translate-x-1 opacity-0 group-hover:opacity-100" />
      </div>
    </Link>
  );
}
