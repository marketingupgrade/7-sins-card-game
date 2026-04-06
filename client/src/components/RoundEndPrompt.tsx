import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LockedPlay, PlayerState, SinType } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";

interface RoundSummaryPlayer {
  id: string;
  username: string;
  chosenSin: SinType;
  preHp: number;
  currentHp: number;
  maxHp: number;
  cardsPlayed: number;
  isAlive: boolean;
}

interface RoundEndPromptProps {
  isOpen: boolean;
  currentRound: number;
  onViewBattleLog: () => void;
  onContinue: () => void;
  isMobile?: boolean;
  /** Locked plays from the just-resolved round */
  resolvedPlays?: LockedPlay[];
  /** Player states BEFORE resolution (snapshot) */
  preResolutionPlayers?: PlayerState[];
  /** Player states AFTER resolution (current) */
  postResolutionPlayers?: PlayerState[];
  /** Current player's ID */
  currentPlayerId?: string;
}

/* ─── Round Summary Stats ─── */
function RoundSummary({
  summaryPlayers,
  currentPlayerId,
  isMobile,
}: {
  summaryPlayers: RoundSummaryPlayer[];
  currentPlayerId?: string;
  isMobile?: boolean;
}) {
  if (summaryPlayers.length === 0) return null;

  // Sort: current player first, then by HP change (most damage taken first)
  const sorted = [...summaryPlayers].sort((a, b) => {
    if (a.id === currentPlayerId) return -1;
    if (b.id === currentPlayerId) return 1;
    return (a.currentHp - a.preHp) - (b.currentHp - b.preHp);
  });

  return (
    <div className={`w-full ${isMobile ? 'max-w-[260px]' : 'max-w-[320px]'} mx-auto`}>
      <div className="flex flex-col gap-1.5">
        {sorted.map((p, i) => {
          const delta = p.currentHp - p.preHp;
          const pctNow = Math.max(0, (p.currentHp / p.maxHp) * 100);
          const hpColor = pctNow > 60 ? "oklch(0.72 0.19 155)" : pctNow > 30 ? "oklch(0.78 0.18 90)" : "oklch(0.65 0.25 25)";
          const isMe = p.id === currentPlayerId;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.25 }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${isMe ? 'ring-1 ring-candle/20' : ''}`}
              style={{
                background: isMe ? 'oklch(0.15 0.03 70 / 0.5)' : 'oklch(0.10 0.01 280 / 0.4)',
              }}
            >
              {/* Faction portrait */}
              <div
                className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border"
                style={{ borderColor: isMe ? 'oklch(0.75 0.12 70 / 0.5)' : 'rgba(255,255,255,0.1)' }}
              >
                <img
                  src={FACTION_PORTRAITS[p.chosenSin]}
                  alt={p.chosenSin}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name + cards played */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-bold truncate"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: isMe ? 'oklch(0.85 0.08 70)' : 'oklch(0.70 0.02 280)',
                    }}
                  >
                    {p.username}
                    {isMe && <span className="text-candle/40 ml-1">(you)</span>}
                  </span>
                  {p.cardsPlayed > 0 && (
                    <span className="text-[8px] text-white/30 flex-shrink-0">
                      {p.cardsPlayed} card{p.cardsPlayed > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {/* HP bar */}
                <div className="h-1 rounded-full mt-0.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: `${Math.max(0, (p.preHp / p.maxHp) * 100)}%` }}
                    animate={{ width: `${pctNow}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: hpColor }}
                  />
                </div>
              </div>

              {/* HP delta */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span
                  className="text-[10px] font-black tabular-nums"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: !p.isAlive ? 'oklch(0.50 0.20 25)' : hpColor,
                  }}
                >
                  {!p.isAlive ? '☠️' : `${p.currentHp}`}
                </span>
                {delta !== 0 && p.isAlive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 + 0.4 }}
                    className="text-[9px] font-bold tabular-nums"
                    style={{
                      color: delta > 0 ? 'oklch(0.72 0.19 155)' : 'oklch(0.65 0.25 25)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {delta > 0 ? '+' : ''}{delta}
                  </motion.span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function RoundEndPromptInner({
  isOpen,
  currentRound,
  onViewBattleLog,
  onContinue,
  isMobile,
  resolvedPlays,
  preResolutionPlayers,
  postResolutionPlayers,
  currentPlayerId,
}: RoundEndPromptProps) {
  // Build summary data
  const summaryPlayers = useMemo<RoundSummaryPlayer[]>(() => {
    if (!preResolutionPlayers || !postResolutionPlayers) return [];
    return postResolutionPlayers.map((post) => {
      const pre = preResolutionPlayers.find(p => p.id === post.id);
      const cardsPlayed = (resolvedPlays || []).filter(
        lp => lp.playerId === post.id && !('pass' in lp) && lp.cardId
      ).length;
      return {
        id: post.id,
        username: post.username || 'Unknown',
        chosenSin: (post.chosenSin || 'wrath') as SinType,
        preHp: pre?.currentHp ?? post.currentHp,
        currentHp: post.currentHp,
        maxHp: post.maxHp || 333,
        cardsPlayed,
        isAlive: post.isAlive,
      };
    });
  }, [preResolutionPlayers, postResolutionPlayers, resolvedPlays]);

  // Total cards played this round
  const totalCards = useMemo(() => {
    return (resolvedPlays || []).filter(lp => !('pass' in lp) && lp.cardId).length;
  }, [resolvedPlays]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 z-50 flex items-center justify-center ${isMobile ? 'px-4' : ''}`}
          style={{ background: 'oklch(0.05 0.02 280 / 0.8)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col items-center gap-3 ${isMobile ? 'p-4 rounded-xl w-full max-w-xs' : 'p-5 rounded-2xl max-w-sm'} border border-candle/20`}
            style={{
              background: 'oklch(0.12 0.02 280 / 0.95)',
              boxShadow: '0 0 40px oklch(0.75 0.12 70 / 0.15), 0 4px 24px oklch(0 0 0 / 0.5)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Round complete header */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.75 0.12 70)' }} />
                <span
                  className="text-candle/70 text-xs tracking-[0.2em] uppercase"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Round {currentRound} Complete
                </span>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.75 0.12 70)' }} />
              </div>
              {totalCards > 0 && (
                <p className="text-candle/30 text-[10px]" style={{ fontFamily: 'var(--font-body)' }}>
                  {totalCards} card{totalCards > 1 ? 's' : ''} resolved
                </p>
              )}
            </div>

            {/* Round summary with HP changes */}
            {summaryPlayers.length > 0 && (
              <RoundSummary
                summaryPlayers={summaryPlayers}
                currentPlayerId={currentPlayerId}
                isMobile={isMobile}
              />
            )}

            {/* Action buttons */}
            <div className={`flex ${isMobile ? 'flex-col w-full' : ''} gap-3 mt-1`}>
              <button
                onClick={onViewBattleLog}
                className={`${isMobile ? 'w-full' : ''} px-5 py-2.5 rounded-lg border border-candle/30 text-candle hover:bg-candle/10 active:bg-candle/15 transition-all text-sm font-semibold tracking-wide flex items-center justify-center gap-2`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
                Battle Log
              </button>
              <button
                onClick={onContinue}
                className={`${isMobile ? 'w-full' : ''} px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2 hover:brightness-110 active:brightness-90`}
                style={{
                  fontFamily: 'var(--font-heading)',
                  background: 'oklch(0.55 0.15 145)',
                  color: 'oklch(0.98 0 0)',
                }}
              >
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            {/* Auto-continue indicator */}
            <div className="flex items-center gap-1.5 text-candle/30 text-xs">
              <motion.div
                className="w-1 h-1 rounded-full"
                style={{ background: 'oklch(0.75 0.12 70 / 0.5)' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span style={{ fontFamily: 'var(--font-body)' }}>Auto-continuing in a moment...</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const RoundEndPrompt = memo(RoundEndPromptInner);
export default RoundEndPrompt;
