/**
 * 404 Page - Lost in the Void
 * Even getting lost here is a sin.
 */

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ICON_URLS } from "@/lib/assetUrls";
import { useLocation } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function NotFound() {
  usePageMeta({
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist. Return to the Cathedral of Sins.",
    canonicalPath: "/404",
    noindex: true,
  });

  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-arena relative overflow-hidden noise-overlay flex items-center justify-center">
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-wrath/30"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              y: [0, -60, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-md mx-auto px-6"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <img src={ICON_URLS.debuff_wrath} alt="lost" className="w-20 h-20 object-contain mx-auto mb-6 drop-shadow-[0_0_20px_oklch(0.6_0.28_25/0.3)]" />
        </motion.div>

        <h1
          className="text-7xl font-black text-wrath text-glow-wrath mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          404
        </h1>

        <h2
          className="text-xl font-bold text-foreground/80 mb-4 tracking-wider"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          LOST IN THE VOID
        </h2>

        <p
          className="text-sm text-muted-foreground/60 mb-2 leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          You wandered somewhere that doesn't exist.
          Impressive, honestly. Even your navigation skills are sinful.
        </p>

        <p className="narrator-text text-base mb-8">
          "The void stares back. It's not impressed either."
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLocation("/")}
          className="btn-wrath rounded-xl py-3.5 px-8 text-sm flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          CRAWL BACK HOME
        </motion.button>
      </motion.div>
    </div>
  );
}
