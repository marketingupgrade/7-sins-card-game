/**
 * Lobby Page - Pre-game setup
 *
 * Shows room code, player list, sin selection, and start button.
 * Uses real-time updates to show when players join and select sins.
 */

import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useGameState } from "@/hooks/useGameState";
import { usePlayerId } from "@/hooks/usePlayerId";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Flame, Moon, Copy, Check, Play, Users } from "lucide-react";
import { SinType } from "../../../shared/gameTypes";

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const playerId = usePlayerId();
  const [, setLocation] = useLocation();
  const { gameState, isLoading } = useGameState(gameId || null);
  const [copied, setCopied] = useState(false);

  const chooseSin = trpc.game.chooseSin.useMutation();
  const startGame = trpc.game.start.useMutation({
    onSuccess: () => {
      setLocation(`/game/${gameId}`);
    },
  });

  // Redirect to game if already active
  useEffect(() => {
    if (gameState?.status === "active") {
      setLocation(`/game/${gameId}`);
    }
  }, [gameState?.status, gameId, setLocation]);

  const handleCopyCode = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChooseSin = (sin: SinType) => {
    if (!gameId) return;
    chooseSin.mutate({ gameId, sin, playerId });
  };

  const handleStart = () => {
    if (!gameId) return;
    startGame.mutate({ gameId });
  };

  const myPlayer = gameState?.players.find((p) => p.id === playerId);
  const allReady = gameState?.players.every((p) => p.chosenSin) && (gameState?.players.length ?? 0) >= 2;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Flame className="w-12 h-12 text-wrath" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.03_270)] via-background to-[oklch(0.08_0.02_25)]" />
      <div className="absolute inset-0 scanlines opacity-20" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Room Code */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Room Code
          </p>
          <div className="flex items-center gap-3">
            <h2
              className="text-4xl md:text-5xl font-bold tracking-[0.3em] text-neon-cyan text-glow-cyan"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {gameState?.roomCode || "------"}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleCopyCode} className="text-muted-foreground hover:text-neon-cyan">
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          <p className="narrator-text text-sm mt-2">"Share this code. Bring your victims."</p>
        </motion.div>

        {/* Player List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-lg mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
              Players ({gameState?.players.length || 0}/4)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((seat) => {
              const player = gameState?.players.find((p) => p.seatIndex === seat);
              return (
                <motion.div
                  key={seat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * seat }}
                  className={`border rounded-lg p-4 ${
                    player
                      ? player.chosenSin === "wrath"
                        ? "border-wrath/50 bg-wrath/5 card-wrath"
                        : player.chosenSin === "sloth"
                        ? "border-sloth/50 bg-sloth/5 card-sloth"
                        : "border-border bg-card/50"
                      : "border-border/30 bg-card/20"
                  }`}
                >
                  {player ? (
                    <div className="text-center">
                      <p className="font-semibold text-foreground truncate" style={{ fontFamily: "var(--font-body)" }}>
                        {player.username}
                      </p>
                      {player.chosenSin ? (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {player.chosenSin === "wrath" ? (
                            <Flame className="w-3 h-3 text-wrath" />
                          ) : (
                            <Moon className="w-3 h-3 text-sloth" />
                          )}
                          <span
                            className={`text-xs uppercase ${player.chosenSin === "wrath" ? "text-wrath" : "text-sloth"}`}
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {player.chosenSin}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">Choosing...</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted-foreground/50 text-sm">Empty Seat</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Sin Selection */}
        {myPlayer && !myPlayer.chosenSin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mb-8"
          >
            <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Choose Your Sin
            </p>
            <div className="grid grid-cols-2 gap-4">
              {/* Wrath */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChooseSin("wrath")}
                disabled={chooseSin.isPending}
                className="border-2 border-wrath/50 rounded-xl p-6 text-center bg-wrath/5 hover:bg-wrath/10 transition-colors glow-wrath"
              >
                <Flame className="w-10 h-10 text-wrath mx-auto mb-3" />
                <h3 className="text-xl font-bold text-wrath" style={{ fontFamily: "var(--font-heading)" }}>WRATH</h3>
                <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: "var(--font-body)" }}>
                  Aggressive burst damage. Hit hard, hit fast, hurt yourself too.
                </p>
              </motion.button>

              {/* Sloth */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChooseSin("sloth")}
                disabled={chooseSin.isPending}
                className="border-2 border-sloth/50 rounded-xl p-6 text-center bg-sloth/5 hover:bg-sloth/10 transition-colors glow-sloth"
              >
                <Moon className="w-10 h-10 text-sloth mx-auto mb-3" />
                <h3 className="text-xl font-bold text-sloth" style={{ fontFamily: "var(--font-heading)" }}>SLOTH</h3>
                <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: "var(--font-body)" }}>
                  Defensive stall. Shields, heals, and slow inevitable doom.
                </p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        {allReady && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button
              size="lg"
              className="bg-neon-cyan text-background hover:bg-neon-cyan/80 h-14 px-12 glow-cyan text-lg"
              style={{ fontFamily: "var(--font-heading)" }}
              onClick={handleStart}
              disabled={startGame.isPending}
            >
              <Play className="w-5 h-5 mr-2" />
              {startGame.isPending ? "STARTING..." : "BEGIN THE RECKONING"}
            </Button>
            {startGame.error && (
              <p className="text-destructive text-sm text-center mt-2">{startGame.error.message}</p>
            )}
          </motion.div>
        )}

        {!allReady && gameState && gameState.players.length > 0 && (
          <p className="narrator-text text-sm opacity-60">
            "Waiting for all sinners to pick their poison..."
          </p>
        )}
      </div>
    </div>
  );
}
