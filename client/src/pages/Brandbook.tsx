/**
 * Brandbook Page — AAA Premium Brandbook for 7 Deadly Sins Card Game
 *
 * A comprehensive, interactive brand guide showcasing:
 * - Brand Essence & X Statement
 * - Brand Positioning Pyramid
 * - Competitive Positioning
 * - Visual Identity System (color swatches)
 * - Faction Color System (interactive palette)
 * - Typography & Mathematical Scales (golden ratio)
 * - Golden Ratio Design System
 * - Brand Voice & Copywriting Guidelines
 * - Behavioral Design Framework (Octalysis)
 * - Dopamine Architecture
 * - Faction Identity Profiles
 * - Library Do's and Don'ts
 * - Brand Application Examples
 *
 * Gothic cathedral aesthetic applied throughout.
 * All images served from CDN.
 */

import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

// ─── CDN Asset URLs ───────────────────────────────────────────────
const CDN = {
  factionPalette: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/01_faction_palette_c2080b3f.png",
  brandColors: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/02_brand_colors_8ec21b7b.png",
  typographyScale: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/03_typography_scale_60fc7e25.png",
  goldenRatio: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/04_golden_ratio_e45228d3.png",
  octalysisRadar: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/05_octalysis_radar_bbe36671.png",
  brandPyramid: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/06_brand_pyramid_6d27d83a.png",
  voiceSpectrum: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/07_voice_spectrum_7bd0d4a9.png",
};

// ─── Data Constants ───────────────────────────────────────────────

const BRAND_DNA = [
  { strand: "Forbidden Power", definition: "The thrill of wielding forces that society condemns", manifestation: "Each faction represents a sin that is simultaneously a superpower" },
  { strand: "Compound Escalation", definition: "Small choices snowball into catastrophic consequences", manifestation: "Fibonacci and exponential tick patterns make every card a ticking bomb" },
  { strand: "Gothic Grandeur", definition: "A cathedral of darkness, beautiful in its severity", manifestation: "Dark stone, candlelight, stained glass, and iron-gate UI elements" },
  { strand: "Strategic Honesty", definition: "No hidden paywalls, no luck-based dominance", manifestation: "Simultaneous lock-in, no pay-to-win, skill-based faction mastery" },
];

const BRAND_COLORS = [
  { name: "Cathedral Stone", hex: "#141210", role: "Primary background", desc: "The darkness of the nave" },
  { name: "Parchment", hex: "#e8e0d0", role: "Primary text", desc: "Aged manuscript paper" },
  { name: "Obsidian Panel", hex: "#1e1a16", role: "Card backgrounds", desc: "Elevated surfaces" },
  { name: "Iron Gate", hex: "#332a22", role: "Borders & dividers", desc: "Structural lines" },
  { name: "Candlelight", hex: "#d4a854", role: "Accent highlights", desc: "Gold trim, interactive elements" },
  { name: "Dried Blood", hex: "#8b1a1a", role: "Brand accent", desc: "Danger states, CTA buttons" },
  { name: "Bone White", hex: "#e0d8c8", role: "Secondary text", desc: "Subtle highlights" },
  { name: "Incense Smoke", hex: "#8b7355", role: "Muted text", desc: "Metadata, timestamps" },
];

const FACTION_COLORS = [
  { name: "Wrath", hex: "#ef4444", emotion: "Rage, aggression, hellfire", title: "Hellfire Crimson" },
  { name: "Sloth", hex: "#a855f7", emotion: "Lethargy, patience, endurance", title: "Twilight Indigo" },
  { name: "Greed", hex: "#eab308", emotion: "Avarice, wealth, accumulation", title: "Tarnished Gold" },
  { name: "Envy", hex: "#10b981", emotion: "Jealousy, covetousness, poison", title: "Poison Emerald" },
  { name: "Pride", hex: "#f0f0f0", emotion: "Hubris, supremacy, divine light", title: "Divine Silver-White" },
  { name: "Lust", hex: "#ec4899", emotion: "Desire, temptation, forbidden pleasure", title: "Forbidden Rose" },
  { name: "Gluttony", hex: "#b45309", emotion: "Excess, consumption, decay", title: "Amber Decay" },
];

const TYPOGRAPHY_SCALE = [
  { level: "Body", size: "16.0px", calc: "Base", use: "Card descriptions, UI text, chat" },
  { level: "Large Body", size: "20.3px", calc: "16 x phi^0.5", use: "Emphasized body text, tooltips" },
  { level: "H6", size: "25.9px", calc: "16 x phi^1.0", use: "Section labels, minor headings" },
  { level: "H5", size: "32.9px", calc: "16 x phi^1.5", use: "Card names, stat labels" },
  { level: "H4", size: "41.9px", calc: "16 x phi^2.0", use: "Page section titles" },
  { level: "H3", size: "53.2px", calc: "16 x phi^2.5", use: "Feature headlines" },
  { level: "H2", size: "67.8px", calc: "16 x phi^3.0", use: "Page titles" },
  { level: "H1", size: "86.2px", calc: "16 x phi^3.5", use: "Hero headlines" },
  { level: "Display", size: "109.7px", calc: "16 x phi^4.0", use: "Splash screens, game title" },
];

const COMPETITORS = [
  { game: "Hearthstone", tone: "Light/Warm", depth: "Medium", monetization: "Aggressive (packs)", platform: "Client", advantage: "Darker tone, no pay-to-win" },
  { game: "MTG Arena", tone: "Neutral", depth: "Deep", monetization: "Aggressive (packs)", platform: "Client", advantage: "Browser-based, free access to all cards" },
  { game: "Legends of Runeterra", tone: "Neutral/Epic", depth: "Deep", monetization: "Fair (wildcards)", platform: "Client", advantage: "Unique compound mechanics, sin identity" },
  { game: "Slay the Spire", tone: "Dark", depth: "Deep", monetization: "One-time purchase", platform: "Client", advantage: "Multiplayer, faction identity" },
  { game: "Balatro", tone: "Quirky", depth: "Medium", monetization: "One-time purchase", platform: "Client", advantage: "Narrative depth, multiplayer" },
  { game: "7 Deadly Sins", tone: "Dark/Gothic", depth: "Deep", monetization: "Free, no pay-to-win", platform: "Browser", advantage: "The only dark-fantasy compound-escalation card game", highlight: true },
];

const VOICE_ATTRIBUTES = [
  { attr: "Formality", position: 35, left: "Formal", right: "Casual" },
  { attr: "Humor", position: 72, left: "Serious", right: "Humorous" },
  { attr: "Technicality", position: 45, left: "Simple", right: "Technical" },
  { attr: "Enthusiasm", position: 60, left: "Reserved", right: "Enthusiastic" },
  { attr: "Darkness", position: 85, left: "Light", right: "Dark" },
  { attr: "Irreverence", position: 78, left: "Respectful", right: "Irreverent" },
];

const COPY_EXAMPLES = [
  { context: "Login prompt", wrong: "Welcome back!", right: "The cathedral remembers you." },
  { context: "Card play", wrong: "Card played successfully", right: "Your corruption spreads." },
  { context: "Victory", wrong: "You win!", right: "Their sins were lesser than yours." },
  { context: "Defeat", wrong: "You lose", right: "Even the damned must rest." },
  { context: "Idle timeout", wrong: "You've been inactive", right: "Sloth claims another soul." },
  { context: "New faction", wrong: "New faction available!", right: "A new vice calls to you." },
  { context: "Tutorial start", wrong: "Let's learn the basics", right: "Every sinner starts somewhere." },
  { context: "Error state", wrong: "Something went wrong", right: "Even hell has its bureaucracy." },
];

const OCTALYSIS_DRIVES = [
  { drive: "Epic Meaning & Calling", score: 9, desc: "Players choose a sin that defines their identity, joining an eternal struggle between the seven deadly sins." },
  { drive: "Development & Accomplishment", score: 7, desc: "Mastery of faction mechanics, compound patterns, and ranked ladders provide strong accomplishment." },
  { drive: "Creativity & Feedback", score: 8, desc: "Deck building with 30 cards from 50+ per faction provides enormous creative latitude." },
  { drive: "Ownership & Possession", score: 7, desc: "Custom decks, faction identity, and psychological investment create strong ownership." },
  { drive: "Social Influence & Relatedness", score: 6, desc: "Multiplayer battles, faction communities, and shared strategies provide social engagement." },
  { drive: "Scarcity & Impatience", score: 8, desc: "Energy system, 30-card deck limit, and round limit create natural scarcity." },
  { drive: "Unpredictability & Curiosity", score: 9, desc: "Card draw, simultaneous lock-in, and escalating compound effects create high unpredictability." },
  { drive: "Loss & Avoidance", score: 8, desc: "HP management, compound damage ticking, and elimination threat create loss avoidance." },
];

const FACTIONS = [
  { name: "Wrath", title: "The Berserker's Flame", hex: "#ef4444", passive: "VENGEANCE: Reflects 62.0% of damage taken back to attacker", archetype: "Aggressive damage dealer, high risk/high reward", compound: "Aggressive (powers of 2)", core: "Strike me and feel the wound twice.", personality: "Impatient, confrontational, thrives on chaos" },
  { name: "Sloth", title: "The Patient Fortress", hex: "#a855f7", passive: "ENDURANCE: Gains shield each turn based on energy and hand size", archetype: "Defensive tank, outlasts opponents", compound: "Slowburn (flat-ish progression)", core: "Patience is armor.", personality: "Methodical, patient, wins through attrition" },
  { name: "Greed", title: "The Tax Collector", hex: "#eab308", passive: "TAX: Gains shield from compound damage dealt on tick-2", archetype: "Hybrid attacker/defender, profits from dealing damage", compound: "Standard (Fibonacci)", core: "Every wound you deal fills my coffers.", personality: "Calculating, opportunistic, maximizes value" },
  { name: "Envy", title: "The Poisoner", hex: "#10b981", passive: "JEALOUSY: Dealing damage amplifies target's worst affliction by 47.6%", archetype: "Debuffer, amplifies enemy weaknesses", compound: "Standard (Fibonacci)", core: "Your suffering looks good on you.", personality: "Vindictive, strategic, exploits weaknesses" },
  { name: "Pride", title: "The Sovereign", hex: "#f0f0f0", passive: "HUBRIS: Playing the highest-cost card amplifies all effects by x1.590", archetype: "Big-spell caster, rewards expensive plays", compound: "Aggressive (powers of 2)", core: "Assert dominance.", personality: "Bold, confident, makes dramatic plays" },
  { name: "Lust", title: "The Seducer", hex: "#ec4899", passive: "TEMPTATION: Heals 1% of compound tick damage dealt as HP", archetype: "Sustain damage dealer, heals through violence", compound: "Standard (Fibonacci)", core: "Your pain is my pleasure.", personality: "Persistent, seductive, wears opponents down" },
  { name: "Gluttony", title: "The Devourer", hex: "#b45309", passive: "DEVOURER: Each card burned via discard_burn grants 1.585 energy", archetype: "Resource denial, destroys enemy cards for energy", compound: "Slowburn (flat-ish progression)", core: "Consume their arsenal.", personality: "Relentless, consuming, denies resources" },
];

const ERROR_EXAMPLES = [
  { type: "Network error", standard: "Connection lost", branded: "The cathedral's walls grow thin. Reconnecting..." },
  { type: "Invalid action", standard: "You can't do that", branded: "Even sin has rules, mortal." },
  { type: "Insufficient energy", standard: "Not enough energy", branded: "Your corruption runs dry. Patience." },
  { type: "Server error", standard: "Internal server error", branded: "The abyss stares back. We're working on it." },
  { type: "Rate limit", standard: "Too many requests", branded: "Gluttony is a sin, even here." },
  { type: "Session expired", standard: "Please log in again", branded: "The cathedral doors have closed. Return to enter." },
];

const CARD_NAMES = [
  { faction: "Wrath", good: ["Hellfire Cascade", "Fury Unchained", "Burning Vengeance"], bad: ["Fire Attack 3", "Damage Spell", "Red Card"] },
  { faction: "Sloth", good: ["Eternal Drowse", "Twilight Barrier", "Patient Decay"], bad: ["Shield Up", "Defense Card", "Purple Heal"] },
  { faction: "Greed", good: ["Golden Tithe", "Miser's Gambit", "Gilded Extraction"], bad: ["Money Attack", "Gold Card", "Steal Energy"] },
  { faction: "Envy", good: ["Covetous Gaze", "Jealous Whisper", "Emerald Spite"], bad: ["Debuff Card", "Green Poison", "Weaken Enemy"] },
  { faction: "Pride", good: ["Divine Mandate", "Crown of Thorns", "Sovereign Decree"], bad: ["Big Spell", "Expensive Card", "White Boost"] },
  { faction: "Lust", good: ["Forbidden Kiss", "Crimson Embrace", "Siren's Call"], bad: ["Heal Attack", "Pink Drain", "Life Steal"] },
  { faction: "Gluttony", good: ["Ravenous Maw", "Feast of Ashes", "Consuming Hunger"], bad: ["Burn Cards", "Eat Deck", "Brown Destroy"] },
];

const LOADING_QUOTES = [
  "Every card game promises you power. We promise you honesty. The power is just a side effect.",
  "They say patience is a virtue. In this cathedral, patience is a weapon.",
  "The compound interest on sin is remarkably similar to the compound interest on a good investment. Both grow whether you're watching or not.",
  "You chose your sin. Or did it choose you? The answer matters less than you think.",
  "Seven sins. Seven factions. Seven ways to lose everything. Choose wisely.",
];

// ─── TOC Sections ─────────────────────────────────────────────────
const TOC_SECTIONS = [
  { id: "brand-essence", num: "01", title: "Brand Essence" },
  { id: "positioning-pyramid", num: "02", title: "Positioning Pyramid" },
  { id: "competitive-positioning", num: "03", title: "Competitive Positioning" },
  { id: "visual-identity", num: "04", title: "Visual Identity & Logo" },
  { id: "faction-colors", num: "05", title: "Faction Colors" },
  { id: "typography", num: "06", title: "Typography" },
  { id: "golden-ratio", num: "07", title: "Golden Ratio" },
  { id: "brand-voice", num: "08", title: "Brand Voice" },
  { id: "octalysis", num: "09", title: "Octalysis Framework" },
  { id: "dopamine", num: "10", title: "Dopamine Architecture" },
  { id: "faction-profiles", num: "11", title: "Faction Profiles" },
  { id: "library-standards", num: "12", title: "Library Standards" },
  { id: "brand-examples", num: "13", title: "Brand Examples" },
  { id: "ux-principles", num: "14", title: "UX Design Principles" },
];

// ─── Reusable Sub-Components ──────────────────────────────────────

/** Section header with number, title, and decorative line */
function SectionHeader({ num, title, id }: { num: string; title: string; id: string }) {
  return (
    <div id={id} className="scroll-mt-24 pt-20 pb-8">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-[#d4a854] font-[Cinzel] text-sm tracking-[0.3em] opacity-60">{num}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-[#d4a854]/40 to-transparent" />
      </div>
      <h2 className="font-[Cinzel] text-3xl md:text-4xl lg:text-5xl text-[#e8e0d0] tracking-wide">
        {title}
      </h2>
    </div>
  );
}

/** Blockquote styled as the narrator's voice */
function NarratorQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="relative my-8 px-8 py-6 border-l-2 border-[#8b1a1a] bg-[#1e1a16]/60 rounded-r-lg">
      <div className="absolute top-3 left-3 text-[#8b1a1a]/30 text-4xl font-serif leading-none">"</div>
      <p className="font-['Uncial_Antiqua'] text-[#d4a854] text-lg md:text-xl italic leading-relaxed pl-4">
        {children}
      </p>
    </blockquote>
  );
}

/** Paragraph styled for the brandbook body text */
function BodyText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-['Cormorant_Garamond'] text-[#c8c0b0] text-lg md:text-xl leading-relaxed mb-6 ${className}`}>
      {children}
    </p>
  );
}

/** Styled table component */
function BrandTable({ headers, rows, highlightLast = false }: { headers: string[]; rows: (string | React.ReactNode)[][]; highlightLast?: boolean }) {
  return (
    <div className="overflow-x-auto my-8 rounded-lg border border-[#332a22]">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#1e1a16] border-b border-[#332a22]">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-[Cinzel] text-[#d4a854] text-xs tracking-[0.15em] uppercase whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={`border-b border-[#332a22]/50 transition-colors hover:bg-[#1e1a16]/40 ${
                highlightLast && ri === rows.length - 1 ? "bg-[#8b1a1a]/10 border-[#8b1a1a]/30" : ""
              }`}
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 font-['Cormorant_Garamond'] text-[#c8c0b0] text-base">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Color swatch with hex value and label */
function ColorSwatch({ name, hex, role, desc }: { name: string; hex: string; role: string; desc: string }) {
  const [copied, setCopied] = useState(false);
  const isLight = hex === "#e8e0d0" || hex === "#e0d8c8" || hex === "#f0f0f0";

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="group text-left rounded-lg overflow-hidden border border-[#332a22] hover:border-[#d4a854]/40 transition-all duration-300 hover:scale-[1.02]"
    >
      <div
        className="h-24 relative flex items-end p-3"
        style={{ backgroundColor: hex }}
      >
        <span className={`font-mono text-xs ${isLight ? "text-[#141210]" : "text-white/80"}`}>
          {copied ? "Copied!" : hex}
        </span>
      </div>
      <div className="p-3 bg-[#1e1a16]">
        <div className="font-[Cinzel] text-[#e8e0d0] text-sm">{name}</div>
        <div className="text-[#8b7355] text-xs mt-1 font-['Cormorant_Garamond']">{role} — {desc}</div>
      </div>
    </button>
  );
}

/** Faction color card with glow effect */
function FactionColorCard({ name, hex, emotion, title }: { name: string; hex: string; emotion: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const isLight = name === "Pride";

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="group text-left rounded-xl overflow-hidden border border-[#332a22] hover:border-opacity-60 transition-all duration-500 hover:scale-[1.03]"
      style={{ borderColor: `${hex}33` }}
    >
      <div
        className="h-32 relative flex flex-col items-center justify-center p-4"
        style={{
          backgroundColor: hex,
          boxShadow: `inset 0 0 40px ${hex}40, 0 0 20px ${hex}20`,
        }}
      >
        <span className={`font-[Cinzel] text-lg tracking-[0.2em] font-bold ${isLight ? "text-[#141210]" : "text-white"}`}>
          {name.toUpperCase()}
        </span>
        <span className={`font-['Cormorant_Garamond'] text-sm mt-1 italic ${isLight ? "text-[#141210]/70" : "text-white/70"}`}>
          {title}
        </span>
      </div>
      <div className="p-3 bg-[#1e1a16]">
        <div className="font-mono text-xs text-[#d4a854]">{copied ? "Copied!" : hex}</div>
        <div className="text-[#8b7355] text-xs mt-1 font-['Cormorant_Garamond'] italic">{emotion}</div>
      </div>
    </button>
  );
}

/** Voice spectrum slider (read-only visual) */
function VoiceSlider({ attr, position, left, right }: { attr: string; position: number; left: string; right: string }) {
  return (
    <div className="mb-6">
      <div className="font-[Cinzel] text-[#d4a854] text-sm mb-2">{attr}</div>
      <div className="flex items-center gap-3">
        <span className="text-[#8b7355] text-xs w-20 text-right font-['Cormorant_Garamond']">{left}</span>
        <div className="flex-1 relative h-3 bg-[#1e1a16] rounded-full border border-[#332a22]">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#8b1a1a] border-2 border-[#d4a854] shadow-lg shadow-[#8b1a1a]/40 transition-all"
            style={{ left: `calc(${position}% - 10px)` }}
          />
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#8b1a1a]/30 to-[#8b1a1a]/10"
            style={{ width: `${position}%` }}
          />
        </div>
        <span className="text-[#8b7355] text-xs w-20 font-['Cormorant_Garamond']">{right}</span>
      </div>
    </div>
  );
}

/** Octalysis drive bar */
function OctalysisDrive({ drive, score, desc }: { drive: string; score: number; desc: string }) {
  const [expanded, setExpanded] = useState(false);
  const barColor = score >= 9 ? "#8b1a1a" : score >= 8 ? "#d4a854" : "#8b7355";

  return (
    <div className="mb-4">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left group">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-[Cinzel] text-[#e8e0d0] text-sm flex-1">{drive}</span>
          <span className="font-mono text-[#d4a854] text-sm font-bold">{score}/10</span>
        </div>
        <div className="h-2 bg-[#1e1a16] rounded-full border border-[#332a22] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score * 10}%`, backgroundColor: barColor }}
          />
        </div>
      </button>
      {expanded && (
        <p className="mt-2 text-[#8b7355] text-sm font-['Cormorant_Garamond'] leading-relaxed pl-2 border-l border-[#332a22]">
          {desc}
        </p>
      )}
    </div>
  );
}

/** Faction profile card */
function FactionProfile({ faction }: { faction: typeof FACTIONS[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{ borderColor: `${faction.hex}30` }}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${faction.hex}15, transparent)` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h4 className="font-[Cinzel] text-lg" style={{ color: faction.hex }}>
            {faction.name}
          </h4>
          <p className="font-['Cormorant_Garamond'] text-[#8b7355] text-sm italic">{faction.title}</p>
        </div>
        <span className="text-[#8b7355] text-xl transition-transform" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>
          &#9662;
        </span>
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 bg-[#1e1a16]/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[#d4a854] font-[Cinzel] text-xs tracking-wider">PASSIVE</span>
              <p className="text-[#c8c0b0] font-['Cormorant_Garamond'] mt-1">{faction.passive}</p>
            </div>
            <div>
              <span className="text-[#d4a854] font-[Cinzel] text-xs tracking-wider">ARCHETYPE</span>
              <p className="text-[#c8c0b0] font-['Cormorant_Garamond'] mt-1">{faction.archetype}</p>
            </div>
            <div>
              <span className="text-[#d4a854] font-[Cinzel] text-xs tracking-wider">COMPOUND</span>
              <p className="text-[#c8c0b0] font-['Cormorant_Garamond'] mt-1">{faction.compound}</p>
            </div>
            <div>
              <span className="text-[#d4a854] font-[Cinzel] text-xs tracking-wider">PLAYER TYPE</span>
              <p className="text-[#c8c0b0] font-['Cormorant_Garamond'] mt-1">{faction.personality}</p>
            </div>
          </div>
          <NarratorQuote>{faction.core}</NarratorQuote>
        </div>
      )}
    </div>
  );
}

// ─── Sticky TOC Sidebar ───────────────────────────────────────────

function TableOfContents({ activeSection }: { activeSection: string }) {
  return (
    <nav className="hidden xl:block fixed left-0 top-1/2 -translate-y-1/2 z-30 pl-4">
      <div className="flex flex-col gap-1">
        {TOC_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`group flex items-center gap-2 py-1 px-2 rounded-r-lg transition-all duration-300 ${
              activeSection === s.id
                ? "bg-[#8b1a1a]/20 border-l-2 border-[#8b1a1a]"
                : "border-l-2 border-transparent hover:border-[#d4a854]/30"
            }`}
          >
            <span className={`font-mono text-[10px] ${activeSection === s.id ? "text-[#d4a854]" : "text-[#8b7355]/60"}`}>
              {s.num}
            </span>
            <span className={`font-[Cinzel] text-[10px] tracking-wider transition-colors ${
              activeSection === s.id ? "text-[#e8e0d0]" : "text-[#8b7355]/60 group-hover:text-[#8b7355]"
            }`}>
              {s.title}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─── Main Brandbook Page ──────────────────────────────────────────

export default function Brandbook() {
  usePageMeta({
    title: "Brand Book — Visual Identity Guide",
    description: "The official brand book for the 7 Deadly Sins Card Game. Typography, color palette, iconography, and design principles for the gothic cathedral aesthetic.",
    canonicalPath: "/brandbook",
  });

  const [activeSection, setActiveSection] = useState("brand-essence");
  const mainRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    TOC_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-[#141210] text-[#e8e0d0] relative">
      {/* Subtle background texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a854' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />

      {/* Sticky TOC */}
      <TableOfContents activeSection={activeSection} />

      {/* ═══════════════════════════════════════════════════════════
          HERO HEADER
          ═══════════════════════════════════════════════════════════ */}
      <header className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#8b1a1a10_0%,_transparent_70%)]" />
        {/* Top fade line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4a854]/20 to-transparent" />

        <div className="relative z-10">
          <img
            src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-logo-v3-3chkwhz9LsB5kZ8AaXhdvw.webp"
            alt="7S"
            className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 opacity-80"
          />
          <p className="font-[Cinzel] text-[#d4a854]/60 text-xs tracking-[0.5em] uppercase mb-6">
            AAA Premium Brandbook
          </p>
          <h1 className="font-[Cinzel] text-5xl md:text-7xl lg:text-8xl text-[#e8e0d0] tracking-wider leading-tight mb-4">
            7 DEADLY
            <br />
            <span className="text-[#8b1a1a]">SINS</span>
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#d4a854] to-transparent mx-auto my-6" />
          <p className="font-['Cormorant_Garamond'] text-[#8b7355] text-lg md:text-xl italic max-w-xl mx-auto">
            Embrace Your Darkest Nature
          </p>
          <p className="font-['Cormorant_Garamond'] text-[#8b7355]/60 text-sm mt-4">
            Version 1.0 | March 2026
          </p>
          <p className="font-['Cormorant_Garamond'] text-[#8b7355]/40 text-xs mt-2 max-w-md mx-auto">
            Prepared using Behavioral Sciences (Octalysis Framework), Copywriting (Contrarian Positioning), and Mathematics (Golden Ratio Systems)
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[#8b7355]/40 text-xs font-[Cinzel] tracking-widest">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#d4a854]/40 to-transparent" />
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          CONTENT SECTIONS
          ═══════════════════════════════════════════════════════════ */}
      <main className="max-w-4xl mx-auto px-6 md:px-8 pb-32">

        {/* ── 01. Brand Essence ─────────────────────────────────── */}
        <SectionHeader num="01" title="Brand Essence & X Statement" id="brand-essence" />

        <div className="my-8 p-8 rounded-xl border border-[#8b1a1a]/30 bg-[#8b1a1a]/5 text-center">
          <p className="font-[Cinzel] text-[#d4a854]/60 text-xs tracking-[0.3em] uppercase mb-3">The Core Promise</p>
          <p className="font-['Uncial_Antiqua'] text-3xl md:text-4xl text-[#e8e0d0]">
            "Embrace Your Darkest Nature"
          </p>
        </div>

        <BodyText>
          Every brand that endures in the AAA gaming space is built on a single, irreducible truth.
          For <em>7 Deadly Sins</em>, that truth is this: strategy games have always asked players to be heroes,
          to build civilizations, to save the world. We ask something far more honest. We ask players to confront
          the parts of themselves that polite society pretends do not exist, and to weaponize those impulses in a
          game where the most dangerous player is the one who knows their own weaknesses best.
        </BodyText>

        <BodyText>
          The X Statement is not a tagline. It is the razor against which every design decision, every piece of copy,
          every visual asset, and every mechanical choice must be tested. If a feature does not serve the fantasy of
          embracing one's darkest nature, it does not belong in the game.
        </BodyText>

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mt-12 mb-4">Brand DNA</h3>
        <BrandTable
          headers={["DNA Strand", "Definition", "Manifestation"]}
          rows={BRAND_DNA.map(d => [
            <span className="font-[Cinzel] text-[#e8e0d0] font-bold">{d.strand}</span>,
            d.definition,
            d.manifestation,
          ])}
        />

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mt-12 mb-4">The Contrarian Position</h3>
        <BodyText>
          Most card games position themselves as heroic fantasies. <em>Magic: The Gathering</em> sells the power
          fantasy of being a planeswalker. <em>Hearthstone</em> sells the warmth of a tavern gathering.
          <em> Legends of Runeterra</em> sells the lore of a shared universe. These are all fundamentally optimistic propositions.
        </BodyText>
        <BodyText>
          <em>7 Deadly Sins</em> occupies the contrarian position: <strong className="text-[#e8e0d0]">the anti-hero card game</strong>.
          Where other games ask "What kind of hero are you?", we ask "What kind of sinner are you?" This is not nihilism.
          It is a deeper form of self-knowledge. The game's thesis is that understanding your own vices, and learning to
          channel them strategically, is a more honest and more interesting form of mastery than pretending to be virtuous.
        </BodyText>

        {/* ── 02. Positioning Pyramid ──────────────────────────── */}
        <SectionHeader num="02" title="Brand Positioning Pyramid" id="positioning-pyramid" />

        <div className="my-8 rounded-xl overflow-hidden border border-[#332a22]">
          <img src={CDN.brandPyramid} alt="Brand Positioning Pyramid" className="w-full" loading="lazy" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {[
            { label: "X Statement", value: "\"Embrace Your Darkest Nature\"", color: "#8b1a1a" },
            { label: "Personality", value: "Sassy, cynical narrator | Darkly humorous | Irreverent but strategic | Cathedral aesthetic", color: "#8b7355" },
            { label: "Pillars", value: "Compound Escalation | 7 Faction Identities | Simultaneous Lock-In | No Pay-to-Win", color: "#d4a854" },
            { label: "Foundation", value: "Free-to-play multiplayer browser card game | Gothic dark fantasy with 7 deadly sins mythology", color: "#332a22" },
          ].map((tier) => (
            <div key={tier.label} className="p-4 rounded-lg border" style={{ borderColor: `${tier.color}40`, background: `${tier.color}08` }}>
              <span className="font-[Cinzel] text-xs tracking-[0.2em] uppercase" style={{ color: tier.color }}>{tier.label}</span>
              <p className="font-['Cormorant_Garamond'] text-[#c8c0b0] text-sm mt-2 leading-relaxed">{tier.value}</p>
            </div>
          ))}
        </div>

        {/* ── 03. Competitive Positioning ──────────────────────── */}
        <SectionHeader num="03" title="Competitive Positioning" id="competitive-positioning" />

        <BodyText>
          Understanding where <em>7 Deadly Sins</em> sits in the competitive landscape is essential for maintaining
          brand coherence. The competitive white space we occupy is the intersection of dark thematic tone, deep
          strategic mechanics, browser accessibility, and ethical monetization.
        </BodyText>

        <BrandTable
          headers={["Game", "Tone", "Depth", "Monetization", "Our Advantage"]}
          rows={COMPETITORS.map(c => [
            <span className={c.highlight ? "font-bold text-[#8b1a1a]" : ""}>{c.game}</span>,
            c.tone,
            c.depth,
            c.monetization,
            <span className={c.highlight ? "text-[#d4a854] font-bold" : ""}>{c.advantage}</span>,
          ])}
          highlightLast
        />

        {/* ── 04. Visual Identity System ───────────────────────── */}
        <SectionHeader num="04" title="Visual Identity System" id="visual-identity" />

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">Brand Logo: The 7S Sigil</h3>
        <BodyText>
          The 7S monogram is the game's primary brand mark. It combines the numeral 7 and the letter S into a unified
          gothic sigil, framed within a cathedral arch. The intertwined letterforms evoke medieval illuminated manuscripts
          and stained glass windows. The gold-on-black palette follows the Candlelight + Cathedral Stone foundation.
        </BodyText>

        <div className="my-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-8">
            {/* Dark background version */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-xl bg-[#0a0908] border border-[#332a22] flex items-center justify-center p-4">
                <img
                  src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-logo-v3-3chkwhz9LsB5kZ8AaXhdvw.webp"
                  alt="7S Logo — Dark"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-[Cinzel]">On Dark</span>
            </div>
            {/* Favicon version */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-xl bg-[#0a0908] border border-[#332a22] flex items-center justify-center">
                <div className="grid grid-cols-2 gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#141210] flex items-center justify-center">
                    <img
                      src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-icon-192x192_8dcc7e63.png"
                      alt="192px"
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#141210] flex items-center justify-center">
                    <img
                      src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-icon-192x192_8dcc7e63.png"
                      alt="32px"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#141210] flex items-center justify-center">
                    <img
                      src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-icon-192x192_8dcc7e63.png"
                      alt="16px"
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#141210] flex items-center justify-center">
                    <img
                      src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-icon-192x192_8dcc7e63.png"
                      alt="48px"
                      className="w-8 h-8"
                    />
                  </div>
                </div>
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-[Cinzel]">Favicon Sizes</span>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-[#d4a854]/20 bg-[#d4a854]/5 max-w-lg">
            <p className="font-[Cinzel] text-[#d4a854] text-sm mb-2">Usage Guidelines</p>
            <p className="font-['Cormorant_Garamond'] text-[#c8c0b0] text-sm leading-relaxed">
              Always use the logo on dark backgrounds (#0a0908 to #1a1520). Minimum clear space: 25% of logo width on all sides.
              Never place on light backgrounds, rotate, stretch, or add effects. The logo should breathe.
            </p>
          </div>
        </div>

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mt-10 mb-4">Design Philosophy: The Gothic Cathedral</h3>
        <BodyText>
          The visual identity of <em>7 Deadly Sins</em> is built on the metaphor of a Gothic cathedral.
          This is not arbitrary. The Gothic cathedral is the single most powerful architectural expression of the
          tension between the sacred and the profane, between aspiration and damnation, between light and shadow.
          Every visual element should feel as though it belongs inside a cathedral that has been corrupted by the
          sins it was built to ward against.
        </BodyText>

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mt-10 mb-4">Brand Color Foundation</h3>
        <div className="my-8 rounded-xl overflow-hidden border border-[#332a22]">
          <img src={CDN.brandColors} alt="Brand Color Foundation" className="w-full" loading="lazy" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
          {BRAND_COLORS.map(c => (
            <ColorSwatch key={c.name} {...c} />
          ))}
        </div>

        <div className="p-4 rounded-lg border border-[#d4a854]/20 bg-[#d4a854]/5 my-8">
          <p className="font-[Cinzel] text-[#d4a854] text-sm mb-2">60-30-10 Rule</p>
          <p className="font-['Cormorant_Garamond'] text-[#c8c0b0] text-sm leading-relaxed">
            60% Cathedral Stone + Obsidian Panel (dark neutrals) | 30% Parchment + Bone White (text & structure) | 10% Candlelight, Dried Blood, and faction colors (accent & identity)
          </p>
        </div>

        {/* ── 05. Faction Color System ─────────────────────────── */}
        <SectionHeader num="05" title="Faction Color System" id="faction-colors" />

        <div className="my-8 rounded-xl overflow-hidden border border-[#332a22]">
          <img src={CDN.factionPalette} alt="Faction Color System" className="w-full" loading="lazy" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 my-8">
          {FACTION_COLORS.map(c => (
            <FactionColorCard key={c.name} {...c} />
          ))}
        </div>

        <BodyText>
          Each color is chosen based on established color psychology and centuries of Western artistic tradition.
          <strong className="text-[#ef4444]"> Wrath</strong> is red because red triggers the strongest physiological arousal.
          <strong className="text-[#a855f7]"> Sloth</strong> is purple, the color of twilight and introspection.
          <strong className="text-[#eab308]"> Greed</strong> is gold, the literal color of wealth.
          <strong className="text-[#10b981]"> Envy</strong> is green, "green with envy" since Shakespeare.
          <strong className="text-[#f0f0f0]"> Pride</strong> is silver-white, containing all colors within it.
          <strong className="text-[#ec4899]"> Lust</strong> is rose-pink, the color of flushed skin.
          <strong className="text-[#b45309]"> Gluttony</strong> is amber-brown, the color of overripe excess.
        </BodyText>

        {/* ── 06. Typography ───────────────────────────────────── */}
        <SectionHeader num="06" title="Typography & Mathematical Scales" id="typography" />

        <div className="my-8 rounded-xl overflow-hidden border border-[#332a22]">
          <img src={CDN.typographyScale} alt="Typography Scale" className="w-full" loading="lazy" />
        </div>

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">The Golden Ratio Typographic Scale</h3>
        <BodyText>
          The typographic scale is derived from the Golden Ratio (phi = 1.618033988749895). Every heading level
          is calculated as a power of phi multiplied by the base font size of 16px. This produces a natural visual
          hierarchy where each step feels proportionally "right" to the human eye.
        </BodyText>

        <BrandTable
          headers={["Level", "Size", "Calculation", "Use Case"]}
          rows={TYPOGRAPHY_SCALE.map(t => [t.level, t.size, t.calc, t.use])}
        />

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mt-10 mb-6">Font Specimens</h3>
        <div className="space-y-6 my-8">
          <div className="p-6 rounded-lg border border-[#332a22] bg-[#1e1a16]/40">
            <p className="text-[#d4a854] text-xs font-mono mb-2">HEADINGS & TITLES</p>
            <p className="font-[Cinzel] text-3xl text-[#e8e0d0]">Cinzel — Authority, permanence, carved-in-stone gravitas</p>
          </div>
          <div className="p-6 rounded-lg border border-[#332a22] bg-[#1e1a16]/40">
            <p className="text-[#d4a854] text-xs font-mono mb-2">BODY TEXT & DESCRIPTIONS</p>
            <p className="font-['Cormorant_Garamond'] text-2xl text-[#e8e0d0]">Cormorant Garamond — Elegance, readability, manuscript tradition</p>
          </div>
          <div className="p-6 rounded-lg border border-[#332a22] bg-[#1e1a16]/40">
            <p className="text-[#d4a854] text-xs font-mono mb-2">NARRATOR VOICE & FLAVOR TEXT</p>
            <p className="font-['Uncial_Antiqua'] text-2xl text-[#e8e0d0]">Uncial Antiqua — Ancient wisdom, mysticism, forbidden knowledge</p>
          </div>
        </div>

        {/* ── 07. Golden Ratio ─────────────────────────────────── */}
        <SectionHeader num="07" title="Golden Ratio Design System" id="golden-ratio" />

        <div className="my-8 rounded-xl overflow-hidden border border-[#332a22]">
          <img src={CDN.goldenRatio} alt="Golden Ratio Layout" className="w-full" loading="lazy" />
        </div>

        <BodyText>
          The Golden Ratio (phi) is defined as the positive solution to x^2 = x + 1, yielding the irrational number
          1.6180339887... The primary layout grid uses the 61.8% / 38.2% split. The spacing system uses the Fibonacci
          sequence (1, 2, 3, 5, 8, 13, 21, 34, 55, 89) as base values in pixels.
        </BodyText>

        <div className="my-8 p-6 rounded-xl border border-[#d4a854]/20 bg-[#d4a854]/5">
          <p className="font-[Cinzel] text-[#d4a854] text-sm mb-3">The Compound Connection</p>
          <p className="font-['Cormorant_Garamond'] text-[#c8c0b0] leading-relaxed">
            The Fibonacci spacing system has a deliberate thematic connection to the game's core mechanic.
            The standard compound pattern uses the Fibonacci sequence [1, 1, 2, 3, 5, 8, 13, 21, 34, 55] to
            determine how card effects escalate over time. The same mathematical sequence that governs the visual
            rhythm of the UI also governs the strategic rhythm of gameplay. The brand is, quite literally, built
            on the same math as the game.
          </p>
        </div>

        <BrandTable
          headers={["Layout Context", "Major Section (61.8%)", "Minor Section (38.2%)"]}
          rows={[
            ["Game Board", "Play area and card resolution zone", "Hand, energy bar, and status panels"],
            ["Lobby Screen", "Faction selection and player list", "Chat and game settings"],
            ["Card Detail View", "Card artwork and effects", "Stats, cost, and compound pattern"],
            ["Home Page", "Hero content and CTA", "Navigation and secondary content"],
          ]}
        />

        {/* ── 08. Brand Voice ──────────────────────────────────── */}
        <SectionHeader num="08" title="Brand Voice & Copywriting" id="brand-voice" />

        <div className="my-8 rounded-xl overflow-hidden border border-[#332a22]">
          <img src={CDN.voiceSpectrum} alt="Brand Voice Spectrum" className="w-full" loading="lazy" />
        </div>

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-6">Voice Attributes</h3>
        <div className="my-8 p-6 rounded-xl border border-[#332a22] bg-[#1e1a16]/40">
          {VOICE_ATTRIBUTES.map(v => (
            <VoiceSlider key={v.attr} {...v} />
          ))}
        </div>

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mt-10 mb-4">The Narrator Voice</h3>
        <BodyText>
          The game's narrator is an omniscient, sardonic entity who has watched humanity sin for millennia and finds
          it more amusing than appalling. The narrator is not evil. The narrator is <em>tired</em>. The narrator has
          seen every form of human weakness and has developed a dry, philosophical humor about it.
        </BodyText>

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mt-10 mb-4">Copy Examples</h3>
        <BrandTable
          headers={["Context", "Wrong", "Right"]}
          rows={COPY_EXAMPLES.map(c => [
            c.context,
            <span className="text-[#8b7355] line-through">{c.wrong}</span>,
            <span className="text-[#d4a854] font-bold">{c.right}</span>,
          ])}
        />

        {/* ── 09. Octalysis Framework ──────────────────────────── */}
        <SectionHeader num="09" title="Behavioral Design (Octalysis)" id="octalysis" />

        <div className="my-8 rounded-xl overflow-hidden border border-[#332a22]">
          <img src={CDN.octalysisRadar} alt="Octalysis Engagement Profile" className="w-full" loading="lazy" />
        </div>

        <BodyText>
          The Octalysis Framework identifies eight core drives that motivate all human behavior. Every successful
          game leverages multiple core drives simultaneously. Click each drive below to expand its analysis.
        </BodyText>

        <div className="my-8 p-6 rounded-xl border border-[#332a22] bg-[#1e1a16]/40">
          {OCTALYSIS_DRIVES.map(d => (
            <OctalysisDrive key={d.drive} {...d} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
          <div className="p-4 rounded-lg border border-[#d4a854]/20 bg-[#d4a854]/5">
            <p className="font-[Cinzel] text-[#d4a854] text-sm mb-2">White Hat Motivators</p>
            <p className="font-['Cormorant_Garamond'] text-[#c8c0b0] text-sm">
              Epic Meaning, Accomplishment, Creativity — make players feel good about themselves.
              These drive long-term engagement and brand loyalty.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-[#8b1a1a]/20 bg-[#8b1a1a]/5">
            <p className="font-[Cinzel] text-[#8b1a1a] text-sm mb-2">Black Hat Motivators</p>
            <p className="font-['Cormorant_Garamond'] text-[#c8c0b0] text-sm">
              Scarcity, Unpredictability, Loss Avoidance — create urgency and obsession.
              Thematically perfect for a game about sin.
            </p>
          </div>
        </div>

        {/* ── 10. Dopamine Architecture ────────────────────────── */}
        <SectionHeader num="10" title="Dopamine Architecture" id="dopamine" />

        <BodyText>
          The dopamine system responds most strongly to variable ratio reinforcement schedules, where rewards are
          delivered after an unpredictable number of actions. In <em>7 Deadly Sins</em>, the variable reinforcement
          is tied to strategic skill rather than pure chance.
        </BodyText>

        <BrandTable
          headers={["Trigger", "Mechanism", "Dopamine Response"]}
          rows={[
            ["Card Draw", "Unknown cards entering hand", "Anticipation spike (pre-reward)"],
            ["Lock-In Reveal", "Opponent's cards revealed simultaneously", "Surprise and validation"],
            ["Compound Tick", "Effects escalating each round", "Escalating anticipation"],
            ["Faction Passive", "Unique passive triggering", "Identity reinforcement"],
            ["Kill Blow", "Eliminating an opponent", "Achievement spike"],
            ["Comeback", "Winning from low HP", "Contrast effect (loss-to-gain amplification)"],
          ]}
        />

        <div className="my-8 p-6 rounded-xl border border-[#8b1a1a]/20 bg-[#8b1a1a]/5">
          <p className="font-[Cinzel] text-[#8b1a1a] text-sm mb-2">The Compound Dopamine Curve</p>
          <p className="font-['Cormorant_Garamond'] text-[#c8c0b0] leading-relaxed">
            The compound escalation mechanic creates a unique dopamine curve. A Fibonacci-pattern card played in
            round 3 produces dopamine spikes in rounds 3, 4, 5, 6, 7, 8, and beyond, with each spike larger than
            the last. This creates a <strong className="text-[#d4a854]">dopamine ramp</strong> — a sustained period of
            escalating reward anticipation that is far more engaging than the single-spike model of traditional card games.
          </p>
        </div>

        {/* ── 11. Faction Profiles ─────────────────────────────── */}
        <SectionHeader num="11" title="Faction Identity Profiles" id="faction-profiles" />

        <BodyText>
          Each faction is a complete brand within the brand, with its own visual identity, mechanical identity,
          narrative identity, and emotional register. Click each faction to expand its full profile.
        </BodyText>

        <div className="space-y-3 my-8">
          {FACTIONS.map(f => (
            <FactionProfile key={f.name} faction={f} />
          ))}
        </div>

        {/* ── 12. Library Standards ────────────────────────────── */}
        <SectionHeader num="12" title="Technical Standards: Library Do's & Don'ts" id="library-standards" />

        <BodyText>
          The project relies on a carefully curated technology stack. Each library was chosen for specific reasons,
          and each has established best practices that must be followed to maintain the AAA quality standard.
          Below are the most critical guidelines organized by library category.
        </BodyText>

        {/* React + TypeScript */}
        <h3 className="font-[Cinzel] text-lg text-[#d4a854] mt-8 mb-3">React 19 + TypeScript 5.9</h3>
        <BrandTable
          headers={["Do", "Don't"]}
          rows={[
            ["Use functional components with hooks exclusively", "Never use class components or legacy lifecycle methods"],
            ["Stabilize references with useState or useMemo for query inputs", "Never create new objects/arrays in render used as query inputs"],
            ["Use useEffect for side effects triggered by renders", "Never call setState or navigation in the render phase"],
            ["Use TypeScript strict mode, avoid any types", "Never disable TypeScript checks with @ts-ignore without documenting why"],
            ["Keep components under 200 lines", "Never create monolithic components handling multiple concerns"],
          ]}
        />

        {/* tRPC */}
        <h3 className="font-[Cinzel] text-lg text-[#d4a854] mt-8 mb-3">tRPC 11 + TanStack React Query 5</h3>
        <BrandTable
          headers={["Do", "Don't"]}
          rows={[
            ["Use trpc.*.useQuery and trpc.*.useMutation for all backend calls", "Never introduce Axios, fetch wrappers, or other HTTP clients"],
            ["Use optimistic updates (onMutate/onError/onSettled) for instant UI feedback", "Never block UI waiting for mutation responses on non-critical operations"],
            ["Use protectedProcedure for authenticated endpoints", "Never check authentication manually inside procedure handlers"],
            ["Use Zod schemas for input validation on every procedure", "Never trust client input without validation"],
          ]}
        />

        {/* Drizzle + Supabase */}
        <h3 className="font-[Cinzel] text-lg text-[#d4a854] mt-8 mb-3">Drizzle ORM + Supabase</h3>
        <BrandTable
          headers={["Do", "Don't"]}
          rows={[
            ["Define all tables in drizzle/schema.ts and run pnpm db:push", "Never modify the database schema directly via SQL"],
            ["Store timestamps as UTC-based Unix timestamps (milliseconds)", "Never store timezone-dependent or string-based timestamps"],
            ["Store file bytes in S3, store only URLs/metadata in the database", "Never store BLOB data directly in database columns"],
            ["Clean up Supabase Realtime subscriptions in useEffect cleanup", "Never leave orphaned subscriptions causing memory leaks"],
          ]}
        />

        {/* Babylon.js */}
        <h3 className="font-[Cinzel] text-lg text-[#d4a854] mt-8 mb-3">Babylon.js 3D Rendering</h3>
        <BrandTable
          headers={["Do", "Don't"]}
          rows={[
            ["Reuse meshes, materials, and textures across similar objects", "Never create new materials for every card instance"],
            ["Use scene.freezeActiveMeshes() for static elements", "Never leave static meshes in the active evaluation loop"],
            ["Dispose of scenes and materials when components unmount", "Never leave Babylon.js resources allocated after navigation"],
            ["Profile with Babylon.js Inspector during development", "Never ship without checking frame time on low-end devices"],
          ]}
        />

        {/* Framer Motion */}
        <h3 className="font-[Cinzel] text-lg text-[#d4a854] mt-8 mb-3">Framer Motion (Animation)</h3>
        <BrandTable
          headers={["Do", "Don't"]}
          rows={[
            ["Animate only transform and opacity for GPU-accelerated performance", "Never animate width, height, top, left, or layout-triggering properties"],
            ["Use AnimatePresence for enter/exit animations", "Never use CSS display:none/block for showing/hiding animated elements"],
            ["Keep animation durations between 200ms and 500ms for UI transitions", "Never use animations longer than 1 second for functional UI"],
            ["Use useReducedMotion to respect accessibility preferences", "Never force animations on users who requested reduced motion"],
          ]}
        />

        {/* Tailwind + shadcn */}
        <h3 className="font-[Cinzel] text-lg text-[#d4a854] mt-8 mb-3">Tailwind CSS 4 + shadcn/ui</h3>
        <BrandTable
          headers={["Do", "Don't"]}
          rows={[
            ["Use OKLCH color format in @theme inline blocks", "Never use HSL, RGB, or hex in Tailwind 4 theme configuration"],
            ["Use semantic color tokens (bg-background, text-foreground)", "Never hardcode color values in component classes"],
            ["Always pair bg-{semantic} with text-{semantic}-foreground", "Never assume text color is inherited correctly from parent"],
            ["Match ThemeProvider's defaultTheme with CSS variables", "Never set defaultTheme=\"dark\" without .dark {} variables"],
          ]}
        />

        {/* Vitest */}
        <h3 className="font-[Cinzel] text-lg text-[#d4a854] mt-8 mb-3">Vitest (Testing)</h3>
        <BrandTable
          headers={["Do", "Don't"]}
          rows={[
            ["Write tests for every tRPC procedure, especially game logic", "Never ship game mechanics without test coverage"],
            ["Test edge cases: zero energy, max rounds, simultaneous elimination", "Never test only the happy path"],
            ["Run pnpm test before every checkpoint", "Never save checkpoints with failing tests"],
          ]}
        />

        {/* ── 13. Brand Application Examples ───────────────────── */}
        <SectionHeader num="13" title="Brand Application Examples" id="brand-examples" />

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">Card Naming Convention</h3>
        <BodyText>
          Card names should follow the pattern: <strong className="text-[#e8e0d0]">[Evocative Noun/Verb] + [Thematic Modifier]</strong>.
          Names should be 2-4 words, memorable, and thematically consistent with the card's sin faction.
        </BodyText>

        <BrandTable
          headers={["Faction", "Good Names", "Bad Names"]}
          rows={CARD_NAMES.map(c => [
            c.faction,
            <span className="text-[#d4a854]">{c.good.join(", ")}</span>,
            <span className="text-[#8b7355] line-through">{c.bad.join(", ")}</span>,
          ])}
        />

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mt-10 mb-4">Error Message Voice</h3>
        <BrandTable
          headers={["Error Type", "Standard", "Branded"]}
          rows={ERROR_EXAMPLES.map(e => [
            e.type,
            <span className="text-[#8b7355] line-through">{e.standard}</span>,
            <span className="text-[#d4a854] font-bold">{e.branded}</span>,
          ])}
        />

        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mt-10 mb-4">Loading Screen Copy</h3>
        <div className="space-y-4 my-8">
          {LOADING_QUOTES.map((q, i) => (
            <NarratorQuote key={i}>{q}</NarratorQuote>
          ))}
        </div>
        {/* ── Section 14: UX Design Principles ──────────────── */}
        <SectionHeader num="14" title="UX Design Principles" id="ux-principles" />

        <p className="font-['Cormorant_Garamond'] text-[#e8e0d0]/80 text-lg leading-relaxed mb-8">
          Every pixel in the cathedral serves a purpose. These principles, drawn from cognitive psychology,
          interaction design research, and mobile-first methodology, govern how the game feels to play.
          A beautiful interface that frustrates the player is a failed interface.
        </p>

        {/* Fitts's Law */}
        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">Fitts's Law: Motor Distance Matters</h3>
        <p className="font-['Cormorant_Garamond'] text-[#e8e0d0]/70 text-base leading-relaxed mb-4">
          The time to acquire a target is a function of the distance to and size of the target.
          In practice: action buttons must be close to where the player's cursor or thumb already rests.
          Cards in the hand hover-lift toward the action bar. Lock-in and Pass buttons sit directly
          above the card fan, not across the screen.
        </p>
        <div className="rounded-lg p-5 mb-8" style={{ background: 'oklch(0.10 0.01 70 / 0.5)', border: '1px solid oklch(0.75 0.12 70 / 0.1)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-[Cinzel] text-sm text-[#d4a854] mb-1">Desktop</p>
              <ul className="font-['Cormorant_Garamond'] text-[#e8e0d0]/60 text-sm space-y-1">
                <li>Card hover lifts -24px toward action buttons</li>
                <li>Selected cards lift -16px with 1.05x scale</li>
                <li>Action buttons positioned directly above card hand</li>
                <li>Player panels expand on hover (280px → 340px)</li>
              </ul>
            </div>
            <div>
              <p className="font-[Cinzel] text-sm text-[#d4a854] mb-1">Mobile</p>
              <ul className="font-['Cormorant_Garamond'] text-[#e8e0d0]/60 text-sm space-y-1">
                <li>Card zoom uses bottom sheet (thumb zone)</li>
                <li>Action buttons minimum 44px touch target</li>
                <li>Player bars 56px min height</li>
                <li>Drag-to-dismiss on card detail sheet</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cognitive Load */}
        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">Miller's Law: Cognitive Load Management</h3>
        <p className="font-['Cormorant_Garamond'] text-[#e8e0d0]/70 text-base leading-relaxed mb-4">
          The average person can hold 7 ± 2 items in working memory. The game board must never
          overwhelm. Information is layered: essential data (HP, energy, turn state) is always visible;
          secondary data (effect details, compound projections) reveals on interaction.
        </p>
        <div className="rounded-lg p-5 mb-8" style={{ background: 'oklch(0.10 0.01 70 / 0.5)', border: '1px solid oklch(0.75 0.12 70 / 0.1)' }}>
          <p className="font-[Cinzel] text-sm text-[#d4a854] mb-2">Information Hierarchy</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-[Cinzel] text-xs text-[#e8e0d0]/90 w-20">Layer 1</span>
              <span className="font-['Cormorant_Garamond'] text-[#e8e0d0]/60 text-sm">HP bar, energy orbs, turn indicator — always visible, no interaction needed</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-[Cinzel] text-xs text-[#e8e0d0]/70 w-20">Layer 2</span>
              <span className="font-['Cormorant_Garamond'] text-[#e8e0d0]/60 text-sm">Effect badges, card costs, action feed — visible but compact</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-[Cinzel] text-xs text-[#e8e0d0]/50 w-20">Layer 3</span>
              <span className="font-['Cormorant_Garamond'] text-[#e8e0d0]/60 text-sm">Compound projections, affliction tables, battle log — revealed on hover/tap</span>
            </div>
          </div>
        </div>

        {/* Hick's Law */}
        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">Hick's Law: Decision Simplification</h3>
        <p className="font-['Cormorant_Garamond'] text-[#e8e0d0]/70 text-base leading-relaxed mb-4">
          Decision time increases logarithmically with the number of choices. The simultaneous lock-in
          mechanic naturally limits decisions to a single moment. Card hand size (5-7 cards) stays within
          comfortable decision range. Unaffordable cards are visually dimmed to reduce the effective
          choice set.
        </p>

        {/* Doherty Threshold */}
        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">Doherty Threshold: 400ms Response Time</h3>
        <p className="font-['Cormorant_Garamond'] text-[#e8e0d0]/70 text-base leading-relaxed mb-4">
          System responses under 400ms feel instantaneous. All UI interactions use spring physics
          (stiffness: 350, damping: 28) to complete within this window. Card hover previews appear
          after a 350ms delay to prevent accidental triggers while staying under the perception threshold.
        </p>

        {/* Mobile-First */}
        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">Mobile-First Design</h3>
        <p className="font-['Cormorant_Garamond'] text-[#e8e0d0]/70 text-base leading-relaxed mb-4">
          The game is designed mobile-first, then enhanced for desktop. Touch targets follow Apple HIG
          (44pt minimum). The bottom sheet pattern replaces modal overlays for card details.
          Thumb-zone analysis places primary actions in the lower third of the screen.
        </p>
        <div className="rounded-lg p-5 mb-8" style={{ background: 'oklch(0.10 0.01 70 / 0.5)', border: '1px solid oklch(0.75 0.12 70 / 0.1)' }}>
          <p className="font-[Cinzel] text-sm text-[#d4a854] mb-2">Touch Target Standards</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { element: "Card Thumbnail", size: "96 × 140px" },
              { element: "Player Bar", size: "56px min-h" },
              { element: "Action Button", size: "48px min-h" },
              { element: "Energy Dot", size: "10px (2.5rem)" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="font-[Cinzel] text-xs text-[#e8e0d0]/80">{item.element}</p>
                <p className="font-['Cormorant_Garamond'] text-sm text-[#d4a854]">{item.size}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">Accessibility Standards</h3>
        <p className="font-['Cormorant_Garamond'] text-[#e8e0d0]/70 text-base leading-relaxed mb-4">
          The gothic aesthetic must not compromise usability. Color is never the sole information channel:
          HP bars show numeric values inside the bar. Effect badges include text labels alongside icons.
          All interactive elements maintain visible focus rings for keyboard navigation.
          The tutorial system supports keyboard navigation (arrow keys, Enter, Escape).
        </p>
        <div className="rounded-lg p-5 mb-8" style={{ background: 'oklch(0.10 0.01 70 / 0.5)', border: '1px solid oklch(0.75 0.12 70 / 0.1)' }}>
          <p className="font-[Cinzel] text-sm text-[#d4a854] mb-2">Accessibility Checklist</p>
          <ul className="font-['Cormorant_Garamond'] text-[#e8e0d0]/60 text-sm space-y-1">
            <li>HP values rendered as text inside bars (not color-only)</li>
            <li>Energy shown as both orbs and numeric count</li>
            <li>Effect badges include text labels, not just emoji</li>
            <li>Focus rings on all interactive elements</li>
            <li>Keyboard-navigable tutorial (arrow keys, Enter, Escape)</li>
            <li>Narrator text uses semantic HTML for screen readers</li>
            <li>Reduced motion: spring animations degrade gracefully</li>
          </ul>
        </div>

        {/* Microinteractions */}
        <h3 className="font-[Cinzel] text-xl text-[#d4a854] mb-4">Microinteraction Design</h3>
        <p className="font-['Cormorant_Garamond'] text-[#e8e0d0]/70 text-base leading-relaxed mb-6">
          Every interaction has a trigger, rule, feedback loop, and mode. Card selection triggers a
          lift animation (feedback) and updates the selection counter (rule). The lock-in button
          pulses when cards are selected (mode change). HP damage triggers a flash + shake on the
          player portrait (feedback). These microinteractions create a sense of weight and consequence
          that reinforces the game's dark thematic tone.
        </p>

        {/* ── Footer ───────────────────────────────────────────── */}  <div className="mt-32 pt-8 border-t border-[#332a22]">
          <div className="text-center">
            <p className="font-[Cinzel] text-[#d4a854]/40 text-xs tracking-[0.3em] uppercase">
              7 Deadly Sins Card Game — AAA Premium Brandbook v2.0
            </p>
            <p className="font-['Cormorant_Garamond'] text-[#8b7355]/40 text-sm mt-2 italic">
              "Every sinner starts somewhere."
            </p>
            <div className="mt-6">
              <Link href="/" className="font-[Cinzel] text-[#8b1a1a] text-sm tracking-wider hover:text-[#d4a854] transition-colors">
                RETURN TO THE CATHEDRAL
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
