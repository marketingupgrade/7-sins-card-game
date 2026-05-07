/**
 * Account Management — Profile, Gamertag Editing, Decks, and Data Purge
 *
 * GDPR-compliant account page where authenticated users can:
 * - View their profile (avatar, name, email, provider)
 * - Edit their gamertag (with profanity/racism filter)
 * - See and manage their saved decks
 * - Purge ALL their data (real deletion, not fake)
 * - Sign out
 *
 * Dark gothic cathedral branding. Mobile responsive.
 * Route: /account
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/contexts/AuthContext";
import { getClientSupabase } from "../../../shared/supabaseClient";
import { ALL_CARDS } from "@shared/cardData";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import { trpc } from "@/lib/trpc";
import type { SinType, CardDefinition } from "@shared/gameTypes";
import { usePageMeta } from "@/hooks/usePageMeta";

// ─── Constants ──────────────────────────────────────────────
const SIN_COLORS: Record<SinType, string> = {
  wrath: "#ef4444", sloth: "#a855f7", greed: "#eab308",
  envy: "#10b981", pride: "#f0f0f0", lust: "#ec4899", gluttony: "#b45309",
};

const SIN_LABELS: Record<SinType, string> = {
  wrath: "Wrath", sloth: "Sloth", greed: "Greed",
  envy: "Envy", pride: "Pride", lust: "Lust", gluttony: "Gluttony",
};

interface SavedDeck {
  id: string;
  name: string;
  faction: SinType;
  cardIds: string[];
  createdAt: number;
  updatedAt: number;
}

// ─── LocalStorage Helpers ───────────────────────────────────
const STORAGE_KEY = "7sins_decks";

function loadLocalDecks(): SavedDeck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalDecks(decks: SavedDeck[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

// ─── tRPC Fetch Helpers ─────────────────────────────────────
async function trpcMutate(path: string, input: unknown) {
  const res = await fetch(`/api/trpc/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: input }),
  });
  const data = await res.json();
  if (data?.result?.data?.json) return data.result.data.json;
  throw new Error(data?.error?.message || "Mutation failed");
}

// ─── Gamertag Editor Component ──────────────────────────────
function GamertagEditor({ playerId, currentTag }: { playerId: string; currentTag: string | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(currentTag || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [savedTag, setSavedTag] = useState(currentTag);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateMutation = trpc.community.updateGamertag.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSavedTag(data.gamertag);
        setIsEditing(false);
        setError(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.reason);
      }
    },
    onError: (err) => {
      setError(err.message || "Something went wrong.");
    },
  });

  const handleStartEdit = () => {
    setDraft(savedTag || "");
    setError(null);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setDraft(savedTag || "");
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === savedTag) {
      setIsEditing(false);
      return;
    }
    setError(null);
    updateMutation.mutate({ playerId, newGamertag: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-white/30 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
          Gamertag
        </span>
        {success && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-green-400/70"
          >
            ✓ Updated
          </motion.span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              maxLength={24}
              placeholder="Enter gamertag..."
              className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-amber-500/20 text-amber-200/90 text-sm placeholder-white/15 focus:outline-none focus:border-amber-500/40 transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            />
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || !draft.trim() || draft.trim() === savedTag}
              className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/70 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {updateMutation.isPending ? "..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="px-3 py-2 rounded-lg border border-white/10 text-white/30 text-xs hover:text-white/50 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/15">
              {draft.trim().length}/24 · Letters, numbers, underscores, hyphens, dots, spaces
            </span>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-400/80 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center gap-2 group">
          <span
            className="text-sm font-bold text-amber-200/70"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {savedTag || "Not set"}
          </span>
          <button
            onClick={handleStartEdit}
            className="text-white/20 hover:text-amber-200/60 transition-colors opacity-0 group-hover:opacity-100"
            title="Edit gamertag"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Confirmation Dialog ────────────────────────────────────
function PurgeConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  isPurging,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPurging: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText.toLowerCase() === "delete everything";

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a0a0a 0%, #0f0c14 100%)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(239,68,68,0.1)",
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3
                className="text-lg font-bold text-red-400 tracking-wider"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                PURGE ALL DATA
              </h3>
              <p className="text-[10px] text-red-300/40 uppercase tracking-wider">
                This action is irreversible
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-white/60" style={{ fontFamily: "var(--font-body)" }}>
            <p>This will permanently delete:</p>
            <ul className="space-y-1.5 ml-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                All your saved decks
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                All your discussion comments
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                Your local game statistics
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                Your authentication account
              </li>
            </ul>
            <p className="text-red-300/50 text-xs italic mt-2">
              You will be signed out and your account will cease to exist.
              This complies with GDPR Article 17 (Right to Erasure).
            </p>
          </div>
        </div>

        {/* Confirmation input */}
        <div className="px-6 pb-4">
          <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Type "delete everything" to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete everything"
            className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white/80 text-sm placeholder-white/15 focus:outline-none focus:border-red-500/40 transition-colors"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPurging}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-all disabled:opacity-50"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmed || isPurging}
            className="flex-1 py-2.5 rounded-lg bg-red-600/80 border border-red-500/30 text-white text-sm font-bold tracking-wider hover:bg-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isPurging ? "PURGING..." : "PURGE FOREVER"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function Account() {
  usePageMeta({
    title: "Account Settings",
    description: "Manage your 7 Deadly Sins Card Game account settings, email, and preferences.",
    canonicalPath: "/account",
    noindex: true,
  });

  const { user, session, displayName, avatarUrl, signOut, isLoading } = useSupabaseAuth();
  const [, navigate] = useLocation();
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);

  // Fetch current gamertag from server
  const gamertagQuery = trpc.community.getGamertag.useQuery(
    { playerId: user?.id || "" },
    { enabled: !!user?.id }
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  // Load saved decks
  useEffect(() => {
    setSavedDecks(loadLocalDecks());
  }, []);

  // Group decks by faction
  const decksByFaction = useMemo(() => {
    const grouped: Partial<Record<SinType, SavedDeck[]>> = {};
    for (const deck of savedDecks) {
      if (!grouped[deck.faction]) grouped[deck.faction] = [];
      grouped[deck.faction]!.push(deck);
    }
    return grouped;
  }, [savedDecks]);

  // Delete a single deck
  const handleDeleteDeck = useCallback(async (deckId: string) => {
    setDeletingDeckId(deckId);
    try {
      const updated = savedDecks.filter((d) => d.id !== deckId);
      setSavedDecks(updated);
      saveLocalDecks(updated);
      if (user) {
        try {
          await trpcMutate("deck.delete", { deckId: parseInt(deckId), supabaseUserId: user.id });
        } catch { /* localStorage already updated */ }
      }
    } finally {
      setDeletingDeckId(null);
    }
  }, [savedDecks, user]);

  // Purge ALL data
  const handlePurge = useCallback(async () => {
    if (!user || !session?.access_token) return;
    setIsPurging(true);
    setPurgeResult(null);

    try {
      // 1. Delete server-side data (decks, comments) via tRPC.
      // The access token proves to the server that we're actually this user — without it
      // anyone who knows a Supabase user UUID could wipe another player's data.
      const result = await trpcMutate("user.purge", {
        supabaseUserId: user.id,
        accessToken: session.access_token,
      });

      // 2. Delete Supabase player record and game history
      const sb = getClientSupabase();
      await sb.from("game_players").delete().eq("player_id", user.id);
      await sb.from("players").delete().eq("id", user.id);

      // 3. Clear all localStorage data
      localStorage.removeItem("7sins_decks");
      localStorage.removeItem("7sins_profile_stats");
      localStorage.removeItem("7sins_player_id");
      localStorage.removeItem("7sins_tutorial_completed");
      localStorage.removeItem("7sins_tutorial_dismissed");
      localStorage.removeItem("7sins_games_played");
      localStorage.removeItem("7sins_faction_unlocked");
      localStorage.removeItem("7sins_guest_id");

      // 4. Sign out (this clears the Supabase session)
      await signOut();

      setPurgeResult(
        `Data purged successfully. ${(result as any).decksDeleted || 0} decks and ${(result as any).commentsDeleted || 0} comments deleted.`
      );

      // 5. Redirect to home after a brief delay
      setTimeout(() => navigate("/"), 3000);
    } catch (err: any) {
      console.error("[Purge]", err);
      setPurgeResult("Purge failed. Please try again or contact sinners@7sinscardgame.com.");
    } finally {
      setIsPurging(false);
      setShowPurgeDialog(false);
    }
  }, [user, session, signOut, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) return null;

  const providerLabel = user.app_metadata?.provider === "discord"
    ? "Discord"
    : user.app_metadata?.provider === "google"
    ? "Google"
    : user.email
    ? "Email"
    : user.phone
    ? "Phone"
    : "Unknown";

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/30">
        <div className="container max-w-3xl py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-white/50 hover:text-white/80 transition-colors flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <h1
            className="text-base font-bold tracking-[0.2em] uppercase text-amber-200/80"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Account
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="container max-w-3xl py-8 space-y-6 px-4">
        {/* ── Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="" aria-hidden="true"
                className="w-16 h-16 rounded-full border-2 border-amber-500/20 object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 bg-amber-500/10 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-amber-200/60" style={{ fontFamily: "var(--font-heading)" }}>
                  {(displayName || "S")[0].toUpperCase()}
                </span>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2
                className="text-xl font-bold text-amber-200/90 truncate"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {displayName || "Sinner"}
              </h2>
              {user.email && (
                <p className="text-sm text-white/40 truncate">{user.email}</p>
              )}
              {user.phone && (
                <p className="text-sm text-white/40">{user.phone}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-amber-200/50 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-heading)" }}>
                  {providerLabel}
                </span>
                <span className="text-[10px] text-white/20">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Gamertag Editor */}
          {user.id && (
            <GamertagEditor
              playerId={user.id}
              currentTag={gamertagQuery.data?.gamertag ?? null}
            />
          )}

          {/* Sign out */}
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
            <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="text-xs text-white/30 hover:text-red-400/60 transition-colors uppercase tracking-wider"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* ── Saved Decks ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-xs font-bold tracking-[0.2em] uppercase text-white/40"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Saved Decks ({savedDecks.length})
            </h3>
            <button
              onClick={() => navigate("/deck-builder")}
              className="text-[10px] text-amber-200/50 hover:text-amber-200/80 transition-colors uppercase tracking-wider flex items-center gap-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Deck
            </button>
          </div>

          {savedDecks.length === 0 ? (
            <div className="text-center py-8">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10 mx-auto mb-3">
                <rect x="2" y="4" width="14" height="17" rx="2" />
                <path d="M8 4V2a1 1 0 0 1 1-1h10a2 2 0 0 1 2 2v14a1 1 0 0 1-1 1h-2" />
              </svg>
              <p className="text-sm text-white/25 italic" style={{ fontFamily: "var(--font-body)" }}>
                No decks saved yet. Visit the Deck Builder to forge your arsenal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(decksByFaction).map(([faction, decks]) => (
                <div key={faction}>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={SIN_ARCHETYPE_ICONS[faction as SinType]}
                      alt="" aria-hidden="true"
                      className="w-4 h-4 object-contain"
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: SIN_COLORS[faction as SinType], fontFamily: "var(--font-heading)" }}
                    >
                      {SIN_LABELS[faction as SinType]}
                    </span>
                    <span className="text-[10px] text-white/20">({decks!.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {decks!.map((deck) => {
                      const avgCost = deck.cardIds.length > 0
                        ? (deck.cardIds.reduce((sum, id) => {
                            const card = ALL_CARDS.find(c => c.id === id);
                            return sum + (card?.cost || 0);
                          }, 0) / deck.cardIds.length).toFixed(1)
                        : "0";

                      return (
                        <div
                          key={deck.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${SIN_COLORS[deck.faction]}10`, border: `1px solid ${SIN_COLORS[deck.faction]}20` }}
                          >
                            <span className="text-xs font-bold" style={{ color: SIN_COLORS[deck.faction] }}>
                              {deck.cardIds.length}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white/70 truncate" style={{ fontFamily: "var(--font-heading)" }}>
                              {deck.name}
                            </p>
                            <p className="text-[10px] text-white/25">
                              {deck.cardIds.length} cards · Avg cost {avgCost} · Updated {new Date(deck.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => navigate("/deck-builder")}
                              className="text-[10px] text-white/20 hover:text-amber-200/60 transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit deck"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteDeck(deck.id)}
                              disabled={deletingDeckId === deck.id}
                              className="text-[10px] text-white/20 hover:text-red-400/60 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              title="Delete deck"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Data & Privacy ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-red-500/10 bg-gradient-to-br from-red-500/[0.02] to-transparent p-6"
        >
          <h3
            className="text-xs font-bold tracking-[0.2em] uppercase text-red-400/50 mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Data & Privacy
          </h3>
          <p className="text-sm text-white/40 mb-4" style={{ fontFamily: "var(--font-body)" }}>
            We respect your right to privacy. Under GDPR Article 17, you have the right to erasure
            of all personal data we hold. This action is permanent and cannot be undone.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => setShowPurgeDialog(true)}
              className="px-4 py-2.5 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400/80 text-xs font-bold tracking-wider uppercase hover:bg-red-600/20 hover:border-red-500/30 transition-all"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Delete All My Data
            </button>
            <span className="text-[10px] text-white/20 italic">
              Permanently removes all decks, comments, stats, and your account.
            </span>
          </div>

          {/* Purge result message */}
          <AnimatePresence>
            {purgeResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-3 rounded-lg border text-sm ${
                  purgeResult.includes("failed")
                    ? "bg-red-500/10 border-red-500/20 text-red-300/70"
                    : "bg-green-500/10 border-green-500/20 text-green-300/70"
                }`}
              >
                {purgeResult}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Privacy Links ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-4 justify-center text-[10px] text-white/20 pb-8"
        >
          <a href="/privacy" className="hover:text-white/40 transition-colors underline underline-offset-2">Privacy Policy</a>
          <a href="/terms" className="hover:text-white/40 transition-colors underline underline-offset-2">Terms & Conditions</a>
          <a href="/cookies" className="hover:text-white/40 transition-colors underline underline-offset-2">Cookie Policy</a>
        </motion.div>
      </div>

      {/* Purge Confirmation Dialog */}
      <AnimatePresence>
        {showPurgeDialog && (
          <PurgeConfirmDialog
            isOpen={showPurgeDialog}
            onConfirm={handlePurge}
            onCancel={() => setShowPurgeDialog(false)}
            isPurging={isPurging}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
