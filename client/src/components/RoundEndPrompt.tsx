import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RoundEndPromptProps {
  isOpen: boolean;
  currentRound: number;
  onViewBattleLog: () => void;
  onContinue: () => void;
  isMobile?: boolean;
}

function RoundEndPromptInner({ isOpen, currentRound, onViewBattleLog, onContinue, isMobile }: RoundEndPromptProps) {
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
            className={`flex flex-col items-center gap-4 ${isMobile ? 'p-5 rounded-xl w-full max-w-xs' : 'p-6 rounded-2xl'} border border-candle/20`}
            style={{
              background: 'oklch(0.12 0.02 280 / 0.95)',
              boxShadow: '0 0 40px oklch(0.75 0.12 70 / 0.15), 0 4px 24px oklch(0 0 0 / 0.5)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Round complete header */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'oklch(0.75 0.12 70)' }}
                />
                <span
                  className="text-candle/70 text-xs tracking-[0.2em] uppercase"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Round {currentRound} Complete
                </span>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'oklch(0.75 0.12 70)' }}
                />
              </div>
              <p className="text-candle/40 text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                Review what happened or press on
              </p>
            </div>

            {/* Action buttons */}
            <div className={`flex ${isMobile ? 'flex-col w-full' : ''} gap-3`}>
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
                View Battle Log
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
