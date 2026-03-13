/**
 * SigilMenu — Gothic-themed navigation menu
 *
 * A dark cathedral-styled hamburger menu that transforms into a sigil/cross
 * when opened. Positioned top-right, below the music toggle.
 * Contains links to non-game pages: Collection, Balance Analysis, etc.
 *
 * Features:
 * - Animated hamburger → cross morph
 * - Ember particle glow on hover
 * - Slide-in panel with gothic styling
 * - Faction-colored accent lines
 * - Mobile responsive
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface MenuLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const MENU_LINKS: MenuLink[] = [
  {
    label: "Card Collection",
    href: "/collection",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="14" height="17" rx="2" />
        <path d="M8 4V2a1 1 0 0 1 1-1h10a2 2 0 0 1 2 2v14a1 1 0 0 1-1 1h-2" />
        <path d="M6 10h6" />
        <path d="M6 14h4" />
      </svg>
    ),
    description: "Browse all 378 cards across 7 factions",
  },
  {
    label: "Balance Analysis",
    href: "/balance",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 4-10" />
      </svg>
    ),
    description: "Deep-dive into faction balance & methodology",
  },
  {
    label: "Home",
    href: "/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    description: "Return to the cathedral entrance",
  },
];

/** Animated sigil hamburger button */
function SigilButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      {/* Outer sigil ring — visible on hover */}
      <div
        className="absolute inset-0 rounded-lg border border-amber-500/0 group-hover:border-amber-500/30 transition-all duration-500"
        style={{
          boxShadow: isOpen
            ? "0 0 12px rgba(245, 158, 11, 0.15), inset 0 0 8px rgba(245, 158, 11, 0.05)"
            : "none",
        }}
      />

      {/* Rotating sigil circle on hover */}
      <svg
        className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        viewBox="0 0 40 40"
        style={{ animation: "spin 12s linear infinite" }}
      >
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="rgba(245, 158, 11, 0.15)"
          strokeWidth="0.5"
          strokeDasharray="3 5"
        />
      </svg>

      {/* Hamburger lines → cross morph */}
      <div className="relative w-5 h-4 flex flex-col justify-between">
        <span
          className="block h-[1.5px] rounded-full transition-all duration-300 origin-center"
          style={{
            backgroundColor: isOpen ? "rgba(245, 158, 11, 0.9)" : "rgba(255, 255, 255, 0.6)",
            transform: isOpen ? "translateY(7.25px) rotate(45deg)" : "none",
            width: isOpen ? "100%" : "100%",
          }}
        />
        <span
          className="block h-[1.5px] rounded-full transition-all duration-300"
          style={{
            backgroundColor: isOpen ? "rgba(245, 158, 11, 0.9)" : "rgba(255, 255, 255, 0.45)",
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? "scaleX(0)" : "none",
            width: "70%",
            marginLeft: "auto",
          }}
        />
        <span
          className="block h-[1.5px] rounded-full transition-all duration-300 origin-center"
          style={{
            backgroundColor: isOpen ? "rgba(245, 158, 11, 0.9)" : "rgba(255, 255, 255, 0.6)",
            transform: isOpen ? "translateY(-7.25px) rotate(-45deg)" : "none",
            width: isOpen ? "100%" : "85%",
          }}
        />
      </div>
    </button>
  );
}

export default function SigilMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    // Delay to prevent the opening click from immediately closing
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [isOpen, close]);

  return (
    <div ref={menuRef} className="relative z-50">
      <SigilButton isOpen={isOpen} onClick={toggle} />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
              onClick={close}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-12 z-50 w-72 origin-top-right"
            >
              {/* Gothic panel */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 12, 10, 0.97), rgba(20, 15, 12, 0.95))",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                  boxShadow: `
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    0 0 30px rgba(245, 158, 11, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.03)
                  `,
                }}
              >
                {/* Header ornament */}
                <div className="px-5 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                    <svg width="12" height="12" viewBox="0 0 12 12" className="text-amber-500/40">
                      <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="currentColor" />
                    </svg>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                  </div>
                  <p
                    className="text-[9px] tracking-[0.4em] text-amber-200/30 text-center mt-2 uppercase"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Navigation
                  </p>
                </div>

                {/* Links */}
                <nav className="px-3 pb-3">
                  {MENU_LINKS.map((link, i) => {
                    const isActive = location === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={close}
                          className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-amber-500/10 text-amber-200"
                              : "text-white/60 hover:text-white/90 hover:bg-white/5"
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`mt-0.5 shrink-0 transition-colors duration-200 ${
                              isActive ? "text-amber-400" : "text-white/30 group-hover:text-amber-400/60"
                            }`}
                          >
                            {link.icon}
                          </div>

                          {/* Text */}
                          <div className="min-w-0">
                            <div
                              className="text-sm font-semibold tracking-wide"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              {link.label}
                            </div>
                            <div className="text-[11px] text-white/30 mt-0.5 leading-tight">
                              {link.description}
                            </div>
                          </div>

                          {/* Active indicator */}
                          {isActive && (
                            <div className="ml-auto mt-2 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                          )}
                        </Link>

                        {/* Divider between items */}
                        {i < MENU_LINKS.length - 1 && (
                          <div className="mx-3 my-1 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        )}
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Footer ornament */}
                <div className="px-5 pb-3 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                    <div className="w-1 h-1 rotate-45 bg-amber-500/20" />
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                  </div>
                  <p className="text-[8px] tracking-[0.3em] text-white/15 text-center mt-2 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                    v5.1 — 378 Cards
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
