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
 * - User auth section (avatar, sign in/out)
 * - Mobile responsive
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabaseAuth } from "@/contexts/AuthContext";

interface MenuLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

/**
 * Navigation links — Home first, then alphabetical.
 * "Lore" displays as the label but routes to /blog.
 */
const MENU_LINKS: MenuLink[] = [
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
    label: "Brandbook",
    href: "/brandbook",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    description: "How the overlords wished this game to be molded",
  },
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
    label: "Deck Builder",
    href: "/deck-builder",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h6v6H4z" />
        <path d="M14 4h6v6h-6z" />
        <path d="M4 14h6v6H4z" />
        <path d="M17 14v8" />
        <path d="M13 18h8" />
      </svg>
    ),
    description: "Build custom 30-card decks for battle",
  },
  {
    label: "Game Rules",
    href: "/rules",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8" />
        <path d="M8 11h6" />
      </svg>
    ),
    description: "Complete rules, mechanics & passive reference",
  },
  {
    label: "Lore",
    href: "/blog",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    description: "Strategy guides, tips & card game insights",
  },
  {
    label: "Matchup Matrix",
    href: "/matchups",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    description: "7\u00D77 faction win-rate heatmap",
  },
  {
    label: "Patch Notes",
    href: "/changelog",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    description: "Version history & balance changes",
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

/** User auth section at the top of the menu */
function UserSection({ onClose }: { onClose: () => void }) {
  const { user, displayName, avatarUrl, signOut, isLoading } = useSupabaseAuth();
  const [, navigate] = useLocation();

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="px-4 pb-3">
        <Link
          href="/login"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/20 text-amber-200/80 hover:text-amber-200 text-xs tracking-[0.15em] uppercase transition-all duration-200"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Sign In
        </Link>
        <p className="text-[9px] text-white/15 text-center mt-1.5">Save decks & track progress</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full border border-amber-500/20 object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-amber-500/20 bg-amber-500/10 flex items-center justify-center shrink-0">
            <span className="text-amber-200/60 text-xs font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {(displayName || "S")[0].toUpperCase()}
            </span>
          </div>
        )}

        {/* Name + sign out */}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-amber-200/80 font-medium truncate" style={{ fontFamily: "var(--font-heading)" }}>
            {displayName || "Sinner"}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              onClick={onClose}
              className="text-[10px] text-amber-200/40 hover:text-amber-200/70 transition-colors tracking-wider uppercase"
            >
              Account
            </Link>
            <button
              onClick={async () => {
                await signOut();
                onClose();
                navigate("/");
              }}
              className="text-[10px] text-white/25 hover:text-red-400/60 transition-colors tracking-wider uppercase"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
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
                {/* Header with 7S logo */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                    <img
                      src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-logo-v3-3chkwhz9LsB5kZ8AaXhdvw.webp"
                      alt="7S"
                      className="w-8 h-8 opacity-70"
                    />
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                  </div>
                </div>

                {/* User auth section */}
                <UserSection onClose={close} />

                {/* Divider */}
                <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

                {/* Navigation label */}
                <div className="px-5 pt-2 pb-1">
                  <p
                    className="text-[9px] tracking-[0.4em] text-amber-200/30 text-center uppercase"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Navigation
                  </p>
                </div>

                {/* Links */}
                <nav className="px-3 pb-3 max-h-[50vh] overflow-y-auto">
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
