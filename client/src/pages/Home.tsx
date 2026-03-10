/**
 * Home Page - Game Lobby
 *
 * Landing page with cyberpunk aesthetic. Players can:
 * - Create a new game (generates room code)
 * - Join an existing game (enter room code)
 *
 * Uses direct Supabase calls via client-side game engine.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlayerId } from "@/hooks/usePlayerId";
import { createGame, joinGame } from "@/lib/gameEngine";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import { Flame, Moon, Swords, Users, Zap } from "lucide-react";

export default function Home() {
  const playerId = usePlayerId();
  const [, setLocation] = useLocation();
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreate = async () => {
    if (!username.trim()) { setError("Enter a username, sinner."); return; }
    setIsCreating(true);
    setError("");
    try {
      const data = await createGame(playerId, username.trim());
      setLocation(`/lobby/${data.gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!username.trim()) { setError("Enter a username, sinner."); return; }
    if (!roomCode.trim()) { setError("Enter a room code."); return; }
    setIsJoining(true);
    setError("");
    try {
      const data = await joinGame(roomCode.trim().toUpperCase(), playerId, username.trim());
      setLocation(`/lobby/${data.gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.03_270)] via-background to-[oklch(0.08_0.02_25)]" />
      <div className="absolute inset-0 scanlines opacity-30" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 2 === 0 ? "oklch(0.55 0.25 25)" : "oklch(0.45 0.15 290)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-wider text-glow-wrath" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="text-wrath">7</span>{" "}
            <span className="text-foreground">DEADLY</span>{" "}
            <span className="text-sloth">SINS</span>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="narrator-text text-xl md:text-2xl mt-4">
            "Welcome, sinners. Choose your vice wisely."
          </motion.p>
        </motion.div>

        {/* Game controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full max-w-md space-y-6">
          {/* Username input */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Your Name, Sinner</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username..." maxLength={20} className="bg-card border-border text-foreground text-lg h-12" style={{ fontFamily: "var(--font-body)" }} />
          </div>

          {/* Error display */}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-destructive text-sm narrator-text">{error}</motion.p>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" className="bg-wrath hover:bg-wrath-glow text-white h-14 glow-wrath" style={{ fontFamily: "var(--font-heading)" }} onClick={handleCreate} disabled={isCreating}>
              <Swords className="w-5 h-5 mr-2" /> {isCreating ? "CREATING..." : "CREATE GAME"}
            </Button>
            <Button size="lg" variant="outline" className="border-sloth text-sloth hover:bg-sloth/10 h-14 glow-sloth" style={{ fontFamily: "var(--font-heading)" }} onClick={() => setShowJoin(!showJoin)}>
              <Users className="w-5 h-5 mr-2" /> JOIN GAME
            </Button>
          </div>

          {/* Join form */}
          <AnimatePresence>
            {showJoin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                <Input value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={8} className="bg-card border-sloth/50 text-foreground text-center text-2xl tracking-[0.3em] h-14 uppercase" style={{ fontFamily: "var(--font-heading)" }} />
                <Button className="w-full bg-sloth hover:bg-sloth-glow text-white h-12 glow-sloth" style={{ fontFamily: "var(--font-heading)" }} onClick={handleJoin} disabled={isJoining}>
                  {isJoining ? "JOINING..." : "ENTER ROOM"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-3 pt-6">
            {[
              { icon: Flame, label: "WRATH", color: "text-wrath", desc: "Burst damage" },
              { icon: Moon, label: "SLOTH", color: "text-sloth", desc: "Stall & drain" },
              { icon: Zap, label: "\u00D7ROUND", color: "text-neon-cyan", desc: "Compounding" },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="bg-card/50 border border-border rounded-lg p-3 text-center">
                <item.icon className={`w-6 h-6 mx-auto mb-1 ${item.color}`} />
                <p className={`text-xs font-bold ${item.color}`} style={{ fontFamily: "var(--font-heading)" }}>{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer narrator */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5 }} className="absolute bottom-6 narrator-text text-sm">
          "Four souls enter. One leaves slightly less damaged."
        </motion.p>
      </div>
    </div>
  );
}
