/**
 * CommunityDecks — Browse & Share Player-Built Decks
 *
 * v5.8.1 Features:
 * - Browse published decks from the community
 * - Filter by faction, sort by newest/most liked
 * - Publish your own decks with gamertag (not real name)
 * - Import community decks into the deck builder
 * - Toggle-like with per-player rate-limiting (one like per deck)
 * - Animated heart fill for liked state (microinteraction)
 * - Threaded comments with nested replies (CD5 Social Influence)
 * - Reply button on each comment to start a conversation thread
 * - Win-rate tracking: log match results and see aggregate win rates
 * - Match result logging modal with opponent faction selection
 * - Win-rate badge on each deck card (shown when >= 3 matches logged)
 * - Comment count badges for social proof
 * - Gamertag setup prompt for first-time publishers
 *
 * UX: Follows Saffer's microinteraction model (Trigger → Rules → Feedback → Loops)
 * Behavioral: Octalysis CD5 (Social Influence) + CD2 (Accomplishment via likes/win rates)
 */
import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_CARDS, getCardById } from "@shared/cardData";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import { SinType, PASSIVE_INFO } from "@shared/gameTypes";
import { useSupabaseAuth } from "@/contexts/AuthContext";
import { encodeDeck } from "@/lib/deckCodes";

// ─── Constants ──────────────────────────────────────────────
const SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
const SIN_COLORS: Record<SinType, string> = {
  wrath: "#ef4444", sloth: "#a855f7", greed: "#eab308",
  envy: "#22c55e", pride: "#e2e2e2", lust: "#ec4899", gluttony: "#f97316",
};
const SIN_LABELS: Record<SinType, string> = {
  wrath: "Wrath", sloth: "Sloth", greed: "Greed",
  envy: "Envy", pride: "Pride", lust: "Lust", gluttony: "Gluttony",
};

// ─── tRPC Fetch Helpers ─────────────────────────────────────
async function trpcQuery(path: string, input?: unknown) {
  const params = input !== undefined
    ? `?input=${encodeURIComponent(JSON.stringify({ json: input }))}`
    : "";
  const res = await fetch(`/api/trpc/${path}${params}`);
  const data = await res.json();
  if (data?.result?.data?.json) return data.result.data.json;
  throw new Error(data?.error?.message || "Query failed");
}

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

// ─── Types ──────────────────────────────────────────────────
interface CommunityDeck {
  id: number;
  playerId: string;
  gamertag: string;
  deckName: string;
  faction: string;
  cardIds: string;
  strategy: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: number;
  deckId: number;
  playerId: string;
  gamertag: string;
  content: string;
  parentId: number | null;
  createdAt: string;
  replies?: Comment[];
}

interface WinRateData {
  wins: number;
  losses: number;
  total: number;
  winRate: number;
}

// ─── Animated Heart Icon ────────────────────────────────────
function HeartIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      initial={false}
      animate={filled ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </motion.svg>
  );
}

// ─── Comment Bubble Icon ────────────────────────────────────
function CommentIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ─── Trophy / Win-Rate Icon ─────────────────────────────────
function TrophyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

// ─── Reply Arrow Icon ───────────────────────────────────────
function ReplyIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

// ─── Win Rate Badge ─────────────────────────────────────────
function WinRateBadge({ data }: { data: WinRateData }) {
  if (data.total < 3) return null; // Only show after 3+ matches for statistical relevance

  const color =
    data.winRate >= 60 ? "#22c55e" :
    data.winRate >= 45 ? "#eab308" :
    "#ef4444";

  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
      title={`${data.wins}W / ${data.losses}L (${data.total} matches)`}
    >
      <TrophyIcon size={10} />
      <span>{data.winRate}%</span>
      <span className="opacity-60 font-normal">({data.total})</span>
    </div>
  );
}

// ─── Log Match Result Modal ─────────────────────────────────
function LogMatchModal({
  deck,
  onLog,
  onClose,
}: {
  deck: CommunityDeck;
  onLog: (result: "win" | "loss", opponentFaction: string) => void;
  onClose: () => void;
}) {
  const [result, setResult] = useState<"win" | "loss">("win");
  const [opponentFaction, setOpponentFaction] = useState<SinType>("wrath");

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="font-[Cinzel] text-lg text-amber-400 mb-1">Log Match Result</h3>
        <p className="text-zinc-400 text-xs mb-4">
          Record a match played with <span className="text-white font-medium">{deck.deckName}</span>
        </p>

        {/* Result selection */}
        <div className="mb-4">
          <label className="text-zinc-400 text-xs font-medium mb-2 block">Result</label>
          <div className="flex gap-2">
            <button
              onClick={() => setResult("win")}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all
                ${result === "win"
                  ? "border-green-500/50 bg-green-500/15 text-green-400"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}
            >
              Victory
            </button>
            <button
              onClick={() => setResult("loss")}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all
                ${result === "loss"
                  ? "border-red-500/50 bg-red-500/15 text-red-400"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}
            >
              Defeat
            </button>
          </div>
        </div>

        {/* Opponent faction */}
        <div className="mb-5">
          <label className="text-zinc-400 text-xs font-medium mb-2 block">Opponent Faction</label>
          <div className="grid grid-cols-4 gap-1.5">
            {SINS.map((sin) => (
              <button
                key={sin}
                onClick={() => setOpponentFaction(sin)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] transition-all
                  ${opponentFaction === sin
                    ? "bg-opacity-15"
                    : "border-zinc-700/50 text-zinc-500 hover:border-zinc-500"
                  }`}
                style={
                  opponentFaction === sin
                    ? { borderColor: `${SIN_COLORS[sin]}50`, backgroundColor: `${SIN_COLORS[sin]}12`, color: SIN_COLORS[sin] }
                    : {}
                }
              >
                <img src={SIN_ARCHETYPE_ICONS[sin]} alt="" className="w-5 h-5" />
                <span className="capitalize font-medium">{sin}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-600 text-zinc-300
                       hover:bg-zinc-800 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onLog(result, opponentFaction)}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors
              ${result === "win"
                ? "bg-green-600 text-white hover:bg-green-500"
                : "bg-red-600 text-white hover:bg-red-500"
              }`}
          >
            Log {result === "win" ? "Victory" : "Defeat"}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ─── Gamertag Setup Modal ───────────────────────────────────
function GamertagModal({
  currentTag,
  onSave,
  onClose,
}: {
  currentTag: string;
  onSave: (tag: string) => void;
  onClose: () => void;
}) {
  const [tag, setTag] = useState(currentTag);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const isValid = /^[a-zA-Z0-9_-]{3,30}$/.test(tag);

  const checkAvailability = useCallback(async () => {
    if (!isValid) return;
    setChecking(true);
    try {
      const result = await trpcQuery("community.checkGamertag", { gamertag: tag });
      setAvailable(result.available);
      if (!result.available) setError("This gamertag is already taken");
      else setError("");
    } catch {
      setError("Failed to check availability");
    }
    setChecking(false);
  }, [tag, isValid]);

  useEffect(() => {
    if (tag.length >= 3) {
      const timer = setTimeout(checkAvailability, 500);
      return () => clearTimeout(timer);
    }
    setAvailable(null);
    setError("");
  }, [tag, checkAvailability]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <h3 className="font-[Cinzel] text-xl text-amber-400 mb-2">Choose Your Gamertag</h3>
        <p className="text-zinc-400 text-sm mb-4">
          This name will be displayed on your published decks and comments. It must be unique and 3-30 characters
          (letters, numbers, underscores, hyphens).
        </p>

        <div className="relative mb-3">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
            placeholder="Enter gamertag..."
            maxLength={30}
            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white
                       placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50
                       font-mono text-lg"
          />
          {checking && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
              Checking...
            </span>
          )}
          {!checking && available === true && isValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">
              Available
            </span>
          )}
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {!isValid && tag.length > 0 && (
          <p className="text-amber-400/70 text-sm mb-3">
            Must be 3-30 characters: letters, numbers, _ or -
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-600 text-zinc-300
                       hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(tag)}
            disabled={!isValid || !available || checking}
            className="flex-1 px-4 py-2.5 rounded-lg bg-amber-600 text-white font-semibold
                       hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Gamertag
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ─── Publish Deck Modal ─────────────────────────────────────
function PublishModal({
  gamertag,
  onPublish,
  onClose,
}: {
  gamertag: string;
  onPublish: (data: { deckName: string; faction: SinType; cardIds: string[]; strategy: string }) => void;
  onClose: () => void;
}) {
  const [deckName, setDeckName] = useState("");
  const [faction, setFaction] = useState<SinType>("wrath");
  const [strategy, setStrategy] = useState("");
  const [savedDecks, setSavedDecks] = useState<any[]>([]);
  const [selectedDeckIdx, setSelectedDeckIdx] = useState(-1);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  // Load user's saved decks
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    trpcQuery("deck.list", { supabaseUserId: user.id })
      .then((decks: any[]) => {
        setSavedDecks(decks.filter((d: any) => {
          try {
            const ids = JSON.parse(d.cardIds);
            return Array.isArray(ids) && ids.length === 30;
          } catch { return false; }
        }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleSelectDeck = (idx: number) => {
    setSelectedDeckIdx(idx);
    if (idx >= 0 && savedDecks[idx]) {
      setDeckName(savedDecks[idx].name || "");
      setFaction(savedDecks[idx].faction as SinType);
    }
  };

  const handlePublish = () => {
    if (selectedDeckIdx < 0 || !savedDecks[selectedDeckIdx]) return;
    const deck = savedDecks[selectedDeckIdx];
    let cardIds: string[];
    try {
      cardIds = JSON.parse(deck.cardIds);
    } catch { return; }
    onPublish({
      deckName: deckName || deck.name,
      faction: deck.faction as SinType,
      cardIds,
      strategy,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        <h3 className="font-[Cinzel] text-xl text-amber-400 mb-1">Publish to Community</h3>
        <p className="text-zinc-400 text-sm mb-4">
          Share your deck as <span className="text-amber-400 font-mono">{gamertag}</span>
        </p>

        {/* Deck selection */}
        <div className="mb-4">
          <label className="text-zinc-400 text-xs font-medium mb-2 block">Select a Saved Deck</label>
          {loading ? (
            <div className="text-zinc-500 text-sm py-4 text-center">Loading your decks...</div>
          ) : savedDecks.length === 0 ? (
            <div className="text-zinc-500 text-sm py-4 text-center">
              No complete decks found. Build a 30-card deck in the{" "}
              <Link href="/deck-builder" className="text-amber-400 hover:underline">Deck Builder</Link> first.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {savedDecks.map((deck, idx) => (
                <button
                  key={deck.id}
                  onClick={() => handleSelectDeck(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all
                    ${selectedDeckIdx === idx
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-zinc-700/50 hover:border-zinc-500"
                    }`}
                >
                  <img
                    src={SIN_ARCHETYPE_ICONS[deck.faction as SinType]}
                    alt=""
                    className="w-5 h-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{deck.name}</div>
                    <div className="text-zinc-500 text-xs capitalize">{deck.faction}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedDeckIdx >= 0 && (
          <>
            {/* Deck name */}
            <div className="mb-3">
              <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Deck Name</label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Give your deck a name..."
                maxLength={60}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm
                           placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Strategy description */}
            <div className="mb-4">
              <label className="text-zinc-400 text-xs font-medium mb-1.5 block">
                Strategy Notes <span className="text-zinc-600">(optional)</span>
              </label>
              <textarea
                value={strategy}
                onChange={(e) => setStrategy(e.target.value.slice(0, 300))}
                placeholder="Describe your deck's strategy, key combos, or playstyle..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm
                           placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none"
              />
              {strategy.length > 0 && (
                <div className="text-right mt-1">
                  <span className={`text-[10px] ${strategy.length > 250 ? "text-amber-400" : "text-zinc-600"}`}>
                    {strategy.length}/300
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-600 text-zinc-300
                       hover:bg-zinc-800 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={selectedDeckIdx < 0 || !deckName.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-amber-600 text-white font-semibold
                       hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Publish Deck
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ─── Single Comment Row (used for both top-level and replies) ──
function CommentRow({
  comment,
  currentUserId,
  isReply,
  onReply,
  onDelete,
}: {
  comment: Comment;
  currentUserId: string | null;
  isReply?: boolean;
  onReply: (commentId: number, gamertag: string) => void;
  onDelete: (commentId: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div className={`flex items-start gap-2 ${isReply ? "ml-8" : ""}`}>
        {/* Avatar */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
          style={{
            backgroundColor: `${SIN_COLORS[SINS[comment.gamertag.charCodeAt(0) % 7]]}25`,
            color: SIN_COLORS[SINS[comment.gamertag.charCodeAt(0) % 7]],
          }}
        >
          {comment.gamertag[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a href={`/player/${encodeURIComponent(comment.gamertag)}`} className="text-amber-400/80 font-mono text-[11px] font-medium hover:text-amber-300 hover:underline transition-colors">
              {comment.gamertag}
            </a>
            <span className="text-zinc-600 text-[10px]">
              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            {/* Reply button */}
            {!isReply && currentUserId && (
              <button
                onClick={() => onReply(comment.id, comment.gamertag)}
                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-amber-400
                           transition-all text-[10px] flex items-center gap-0.5"
                title="Reply to this comment"
              >
                <ReplyIcon size={10} />
                Reply
              </button>
            )}
            {currentUserId === comment.playerId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400
                           transition-all text-[10px] ml-auto"
                title="Delete comment"
              >
                Delete
              </button>
            )}
          </div>
          <p className="text-zinc-300 text-xs leading-relaxed mt-0.5">{comment.content}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Comment Section (expandable per deck, with threading) ──
function CommentSection({
  deckId,
  currentUserId,
  gamertag,
  onRequireGamertag,
  showToast,
}: {
  deckId: number;
  currentUserId: string | null;
  gamertag: string | null;
  onRequireGamertag: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number; gamertag: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load threaded comments
  useEffect(() => {
    trpcQuery("community.comments", { deckId })
      .then((data: Comment[]) => {
        setComments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [deckId]);

  const handleReply = useCallback((commentId: number, commentGamertag: string) => {
    setReplyTo({ id: commentId, gamertag: commentGamertag });
    setNewComment(`@${commentGamertag} `);
    inputRef.current?.focus();
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
    setNewComment("");
  }, []);

  const handleSubmit = async () => {
    if (!currentUserId) {
      showToast("Sign in to comment", "error");
      return;
    }
    if (!gamertag) {
      onRequireGamertag();
      return;
    }
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await trpcMutate("community.addComment", {
        deckId,
        playerId: currentUserId,
        gamertag,
        content: newComment.trim(),
        parentId: replyTo?.id ?? null,
      });
      if (comment) {
        if (replyTo) {
          // Add reply to the parent comment's replies array
          setComments((prev) =>
            prev.map((c) =>
              c.id === replyTo.id
                ? { ...c, replies: [...(c.replies || []), comment] }
                : c
            )
          );
        } else {
          // Add as new top-level comment (newest first)
          setComments((prev) => [{ ...comment, replies: [] }, ...prev]);
        }
        setNewComment("");
        setReplyTo(null);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to post comment", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: number) => {
    if (!currentUserId) return;
    try {
      await trpcMutate("community.deleteComment", {
        commentId,
        playerId: currentUserId,
      });
      // Remove from top-level or from replies
      setComments((prev) => {
        // Check if it's a top-level comment
        const isTopLevel = prev.some((c) => c.id === commentId);
        if (isTopLevel) {
          return prev.filter((c) => c.id !== commentId);
        }
        // It's a reply — remove from parent's replies
        return prev.map((c) => ({
          ...c,
          replies: (c.replies || []).filter((r) => r.id !== commentId),
        }));
      });
    } catch {
      showToast("Failed to delete comment", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && replyTo) {
      handleCancelReply();
    }
  };

  return (
    <div className="border-t border-zinc-800/60 px-4 pb-4 pt-3">
      {/* Reply indicator */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-2 text-xs"
          >
            <ReplyIcon size={12} />
            <span className="text-zinc-400">
              Replying to <span className="text-amber-400 font-mono">{replyTo.gamertag}</span>
            </span>
            <button
              onClick={handleCancelReply}
              className="text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment input */}
      <div className="flex gap-2 mb-3">
        <textarea
          ref={inputRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          placeholder={
            !currentUserId
              ? "Sign in to comment"
              : replyTo
              ? `Reply to ${replyTo.gamertag}...`
              : "Share your thoughts..."
          }
          disabled={!currentUserId || submitting}
          rows={1}
          className="flex-1 bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-white text-xs
                     placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/40
                     disabled:opacity-40 resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!currentUserId || !newComment.trim() || submitting}
          className="px-3 py-2 rounded-lg bg-amber-600/20 border border-amber-600/30
                     text-amber-400 hover:bg-amber-600/30 transition-colors text-xs font-medium
                     disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {submitting ? "..." : replyTo ? "Reply" : "Post"}
        </button>
      </div>

      {/* Character count */}
      {newComment.length > 0 && (
        <div className="text-right -mt-2 mb-2">
          <span className={`text-[10px] ${newComment.length > 450 ? "text-amber-400" : "text-zinc-600"}`}>
            {newComment.length}/500
          </span>
        </div>
      )}

      {/* Threaded comments list */}
      {loading ? (
        <div className="text-zinc-500 text-xs py-2">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-zinc-600 text-xs py-1 text-center italic">
          No comments yet — be the first to share your thoughts
        </div>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <div key={comment.id}>
                <CommentRow
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onDelete={handleDelete}
                />
                {/* Nested replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-1.5 space-y-1.5 border-l-2 border-zinc-800/60">
                    {comment.replies.map((reply) => (
                      <CommentRow
                        key={reply.id}
                        comment={reply}
                        currentUserId={currentUserId}
                        isReply
                        onReply={handleReply}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Deck Card (Community Deck Display) ─────────────────────
const DeckCard = memo(function DeckCard({
  deck,
  currentUserId,
  isLiked,
  commentCount,
  winRate,
  gamertag,
  onImport,
  onToggleLike,
  onUnpublish,
  onLogMatch,
  onRequireGamertag,
  showToast,
}: {
  deck: CommunityDeck;
  currentUserId: string | null;
  isLiked: boolean;
  commentCount: number;
  winRate: WinRateData | null;
  gamertag: string | null;
  onImport: (deck: CommunityDeck) => void;
  onToggleLike: (deckId: number) => void;
  onUnpublish: (deckId: number) => void;
  onLogMatch: (deck: CommunityDeck) => void;
  onRequireGamertag: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const faction = deck.faction as SinType;
  const sinColor = SIN_COLORS[faction] || "#888";
  const isOwner = currentUserId === deck.playerId;
  const [showComments, setShowComments] = useState(false);

  // Parse card IDs for preview
  let cardIds: string[] = [];
  try {
    cardIds = JSON.parse(deck.cardIds);
  } catch { /* ignore */ }

  // Get first 5 card art for preview strip
  const previewCards = cardIds.slice(0, 5);
  const createdDate = new Date(deck.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/80 border border-zinc-700/60 rounded-xl overflow-hidden hover:border-zinc-500/60 transition-colors group/card flex flex-col"
    >
      {/* Card art preview strip */}
      <div className="relative h-24 overflow-hidden">
        <div className="flex h-full">
          {previewCards.map((id, i) => (
            <div key={id} className="flex-1 relative" style={{ zIndex: 5 - i }}>
              <img
                src={CARD_ART_URLS[id] || ""}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
        {/* Faction badge */}
        <div
          className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-md"
          style={{ backgroundColor: `${sinColor}20`, border: `1px solid ${sinColor}40` }}
        >
          <img src={SIN_ARCHETYPE_ICONS[faction]} alt="" className="w-4 h-4" />
          <span className="text-xs font-semibold capitalize" style={{ color: sinColor }}>
            {SIN_LABELS[faction]}
          </span>
        </div>
        {/* Win rate badge (top right) */}
        {winRate && winRate.total >= 3 && (
          <div className="absolute top-2 right-2">
            <WinRateBadge data={winRate} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{deck.deckName}</h3>
            <p className="text-zinc-400 text-xs mt-0.5">
              by <a href={`/player/${encodeURIComponent(deck.gamertag)}`} className="text-amber-400/80 font-mono hover:text-amber-300 hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>{deck.gamertag}</a>
              <span className="mx-1.5 text-zinc-600">&middot;</span>
              {createdDate}
            </p>
          </div>
        </div>

        {deck.strategy && (
          <p className="text-zinc-400 text-xs leading-relaxed mb-3 line-clamp-2">{deck.strategy}</p>
        )}

        {/* Actions — Microinteraction: immediate visual feedback on every tap */}
        <div className="flex items-center gap-1.5 mt-auto flex-wrap">
          {/* Like toggle button */}
          <button
            onClick={() => onToggleLike(deck.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs
              ${isLiked
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : "border-zinc-700 text-zinc-300 hover:border-red-500/40 hover:text-red-400"
              }`}
            title={isLiked ? "Unlike this deck" : "Like this deck"}
            aria-label={isLiked ? `Unlike deck, ${deck.likes} likes` : `Like deck, ${deck.likes} likes`}
          >
            <HeartIcon filled={isLiked} />
            <span className="tabular-nums">{deck.likes}</span>
          </button>

          {/* Comment toggle button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs
              ${showComments
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                : "border-zinc-700 text-zinc-300 hover:border-amber-500/40 hover:text-amber-400"
              }`}
            title="View comments"
            aria-label={`${commentCount} comments`}
          >
            <CommentIcon />
            <span className="tabular-nums">{commentCount}</span>
          </button>

          {/* Log match button */}
          {currentUserId && (
            <button
              onClick={() => onLogMatch(deck)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-700
                         text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-all text-xs"
              title="Log a match result with this deck"
            >
              <TrophyIcon />
              <span className="hidden sm:inline">Log</span>
            </button>
          )}

          {/* Import button */}
          <button
            onClick={() => onImport(deck)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-600/20 border border-amber-600/30
                       text-amber-400 hover:bg-amber-600/30 transition-colors text-xs font-medium"
            title="Import into Deck Builder"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Import
          </button>

          {isOwner && (
            <button
              onClick={() => onUnpublish(deck.id)}
              className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-700
                         text-zinc-500 hover:border-red-500/40 hover:text-red-400 transition-colors text-xs"
              title="Remove your published deck"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Expandable comment section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CommentSection
              deckId={deck.id}
              currentUserId={currentUserId}
              gamertag={gamertag}
              onRequireGamertag={onRequireGamertag}
              showToast={showToast}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ─── Main Page Component ────────────────────────────────────
export default function CommunityDecks() {
  const { user } = useSupabaseAuth();
  const [, navigate] = useLocation();

  // State
  const [decks, setDecks] = useState<CommunityDeck[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [factionFilter, setFactionFilter] = useState<SinType | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "likes">("newest");
  const [page, setPage] = useState(1);
  const [gamertag, setGamertag] = useState<string | null>(null);
  const [showGamertagModal, setShowGamertagModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [likedDeckIds, setLikedDeckIds] = useState<Set<number>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [winRates, setWinRates] = useState<Record<number, WinRateData>>({});
  const [logMatchDeck, setLogMatchDeck] = useState<CommunityDeck | null>(null);

  const LIMIT = 12;
  const totalPages = Math.ceil(total / LIMIT);

  // Load gamertag + liked deck IDs for logged-in user
  useEffect(() => {
    if (!user) return;
    trpcQuery("community.getGamertag", { playerId: user.id })
      .then((result: any) => setGamertag(result.gamertag))
      .catch(() => {});
    trpcQuery("community.likedDeckIds", { playerId: user.id })
      .then((ids: number[]) => setLikedDeckIds(new Set(ids)))
      .catch(() => {});
  }, [user]);

  // Load community decks
  const loadDecks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await trpcQuery("community.list", {
        faction: factionFilter === "all" ? undefined : factionFilter,
        sortBy,
        page,
        limit: LIMIT,
      });
      setDecks(result.decks);
      setTotal(result.total);

      // Load comment counts + win rates for visible decks (batch queries)
      if (result.decks.length > 0) {
        const deckIds = result.decks.map((d: CommunityDeck) => d.id);
        trpcQuery("community.commentCounts", { deckIds })
          .then((counts: Record<number, number>) => setCommentCounts(counts))
          .catch(() => {});
        trpcQuery("community.batchWinRates", { deckIds })
          .then((rates: Record<number, WinRateData>) => setWinRates(rates))
          .catch(() => {});
      }
    } catch (err) {
      console.error("Failed to load community decks:", err);
    }
    setLoading(false);
  }, [factionFilter, sortBy, page]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [factionFilter, sortBy]);

  // Show toast
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Handle publish
  const handlePublishClick = () => {
    if (!user) {
      showToast("Sign in to publish decks", "error");
      return;
    }
    if (!gamertag) {
      setShowGamertagModal(true);
      return;
    }
    setShowPublishModal(true);
  };

  const handleGamertagSave = async (tag: string) => {
    setGamertag(tag);
    setShowGamertagModal(false);
    setShowPublishModal(true);
  };

  const handlePublish = async (data: { deckName: string; faction: SinType; cardIds: string[]; strategy: string }) => {
    if (!user || !gamertag) return;
    setPublishing(true);
    try {
      await trpcMutate("community.publish", {
        playerId: user.id,
        gamertag,
        deckName: data.deckName,
        faction: data.faction,
        cardIds: JSON.stringify(data.cardIds),
        strategy: data.strategy,
      });
      showToast("Deck published to the community!");
      setShowPublishModal(false);
      loadDecks();
    } catch (err: any) {
      showToast(err.message || "Failed to publish deck", "error");
    }
    setPublishing(false);
  };

  const handleImport = useCallback((deck: CommunityDeck) => {
    try {
      const cardIds: string[] = JSON.parse(deck.cardIds);
      const code = encodeDeck(deck.faction as SinType, cardIds);
      if (code) {
        navigate(`/deck-builder?import=${encodeURIComponent(code)}`);
      }
    } catch {
      showToast("Failed to import deck", "error");
    }
  }, [navigate, showToast]);

  // Toggle like with optimistic update
  const handleToggleLike = useCallback(async (deckId: number) => {
    if (!user) {
      showToast("Sign in to like decks", "error");
      return;
    }

    const wasLiked = likedDeckIds.has(deckId);
    setLikedDeckIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(deckId);
      else next.add(deckId);
      return next;
    });
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? { ...d, likes: wasLiked ? Math.max(0, d.likes - 1) : d.likes + 1 }
          : d
      )
    );

    try {
      const result = await trpcMutate("community.toggleLike", {
        deckId,
        playerId: user.id,
      });
      setDecks((prev) =>
        prev.map((d) => (d.id === deckId ? { ...d, likes: result.newCount } : d))
      );
      if (result.liked !== !wasLiked) {
        setLikedDeckIds((prev) => {
          const next = new Set(prev);
          if (result.liked) next.add(deckId);
          else next.delete(deckId);
          return next;
        });
      }
    } catch {
      setLikedDeckIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(deckId);
        else next.delete(deckId);
        return next;
      });
      setDecks((prev) =>
        prev.map((d) =>
          d.id === deckId
            ? { ...d, likes: wasLiked ? d.likes + 1 : Math.max(0, d.likes - 1) }
            : d
        )
      );
      showToast("Failed to update like", "error");
    }
  }, [user, likedDeckIds, showToast]);

  const handleUnpublish = useCallback(async (deckId: number) => {
    if (!user) return;
    if (!confirm("Remove this deck from the community library?")) return;
    try {
      await trpcMutate("community.unpublish", { deckId, playerId: user.id });
      showToast("Deck removed from community");
      loadDecks();
    } catch {
      showToast("Failed to remove deck", "error");
    }
  }, [user, showToast, loadDecks]);

  // Log match result
  const handleLogMatch = useCallback((deck: CommunityDeck) => {
    if (!user) {
      showToast("Sign in to log match results", "error");
      return;
    }
    setLogMatchDeck(deck);
  }, [user, showToast]);

  const handleLogMatchSubmit = useCallback(async (result: "win" | "loss", opponentFaction: string) => {
    if (!user || !logMatchDeck) return;
    try {
      await trpcMutate("community.logMatch", {
        deckId: logMatchDeck.id,
        playerId: user.id,
        result,
        opponentFaction,
      });
      showToast(
        result === "win" ? "Victory logged!" : "Defeat logged — learn and adapt!",
        "success"
      );
      setLogMatchDeck(null);
      // Refresh win rate for this deck
      trpcQuery("community.winRate", { deckId: logMatchDeck.id })
        .then((data: WinRateData) => {
          setWinRates((prev) => ({ ...prev, [logMatchDeck.id]: data }));
        })
        .catch(() => {});
    } catch {
      showToast("Failed to log match result", "error");
    }
  }, [user, logMatchDeck, showToast]);

  const handleRequireGamertag = useCallback(() => {
    setShowGamertagModal(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-white">
      {/* Header */}
      <header className="relative border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 inline-flex items-center gap-1 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-3">
            <div>
              <h1 className="font-[Cinzel] text-3xl sm:text-4xl text-amber-400 tracking-wide">
                Community Decks
              </h1>
              <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-xl">
                Browse player-built decks, discover new strategies, and share your own creations with the community.
              </p>
            </div>

            <button
              onClick={handlePublishClick}
              disabled={publishing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white font-semibold
                         hover:bg-amber-500 transition-colors disabled:opacity-50 text-sm whitespace-nowrap self-start sm:self-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Publish Deck
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-4 border-b border-zinc-800/40">
        <div className="flex flex-wrap items-center gap-3">
          {/* Faction filter pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFactionFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
                ${factionFilter === "all"
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}
            >
              All Factions
            </button>
            {SINS.map((sin) => (
              <button
                key={sin}
                onClick={() => setFactionFilter(sin)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5
                  ${factionFilter === sin
                    ? `bg-opacity-15 text-opacity-90`
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                style={
                  factionFilter === sin
                    ? { borderColor: `${SIN_COLORS[sin]}60`, backgroundColor: `${SIN_COLORS[sin]}15`, color: SIN_COLORS[sin] }
                    : {}
                }
              >
                <img src={SIN_ARCHETYPE_ICONS[sin]} alt="" className="w-3.5 h-3.5" />
                {SIN_LABELS[sin]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-zinc-500 text-xs">Sort:</span>
            <button
              onClick={() => setSortBy("newest")}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors border
                ${sortBy === "newest"
                  ? "border-zinc-500 bg-zinc-800 text-white"
                  : "border-zinc-700/50 text-zinc-400 hover:text-zinc-300"
                }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy("likes")}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors border
                ${sortBy === "likes"
                  ? "border-zinc-500 bg-zinc-800 text-white"
                  : "border-zinc-700/50 text-zinc-400 hover:text-zinc-300"
                }`}
            >
              Most Liked
            </button>
          </div>
        </div>
      </div>

      {/* Deck Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 opacity-30">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-zinc-600">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-zinc-400 text-lg mb-2">No decks published yet</h3>
            <p className="text-zinc-500 text-sm mb-6">
              Be the first to share your deck with the community!
            </p>
            <button
              onClick={handlePublishClick}
              className="px-5 py-2.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-500 transition-colors text-sm"
            >
              Publish Your First Deck
            </button>
          </div>
        ) : (
          <>
            <div className="text-zinc-500 text-sm mb-4">
              {total} deck{total !== 1 ? "s" : ""} published
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  currentUserId={user?.id ?? null}
                  isLiked={likedDeckIds.has(deck.id)}
                  commentCount={commentCounts[deck.id] || 0}
                  winRate={winRates[deck.id] || null}
                  gamertag={gamertag}
                  onImport={handleImport}
                  onToggleLike={handleToggleLike}
                  onUnpublish={handleUnpublish}
                  onLogMatch={handleLogMatch}
                  onRequireGamertag={handleRequireGamertag}
                  showToast={showToast}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm
                             hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-zinc-400 text-sm px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm
                             hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] px-5 py-3 rounded-xl shadow-xl text-sm font-medium
              ${toast.type === "success"
                ? "bg-green-900/90 border border-green-700/50 text-green-200"
                : "bg-red-900/90 border border-red-700/50 text-red-200"
              }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showGamertagModal && (
          <GamertagModal
            currentTag={gamertag || ""}
            onSave={handleGamertagSave}
            onClose={() => setShowGamertagModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPublishModal && gamertag && (
          <PublishModal
            gamertag={gamertag}
            onPublish={handlePublish}
            onClose={() => setShowPublishModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {logMatchDeck && (
          <LogMatchModal
            deck={logMatchDeck}
            onLog={handleLogMatchSubmit}
            onClose={() => setLogMatchDeck(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
