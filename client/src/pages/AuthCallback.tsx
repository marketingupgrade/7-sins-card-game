/**
 * AuthCallback — OAuth Redirect Handler
 *
 * After Discord/Google OAuth, Supabase redirects here with tokens in the URL hash.
 * The Supabase client automatically picks up the tokens from the URL.
 * We just show a loading state and redirect to the home page once auth is confirmed.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function AuthCallback() {
  usePageMeta({
    title: "Authenticating",
    description: "Completing authentication for the 7 Deadly Sins Card Game.",
    canonicalPath: "/auth/callback",
    noindex: true,
  });

  const [, navigate] = useLocation();
  const { user, isLoading } = useSupabaseAuth();

  useEffect(() => {
    // Once auth state resolves, redirect to home
    if (!isLoading) {
      // Small delay to ensure session is fully established
      const timer = setTimeout(() => {
        navigate(user ? "/" : "/login");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Animated sigil */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-2 border border-amber-500/20 border-b-amber-500/60 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          <svg className="absolute inset-0 w-full h-full p-4 text-amber-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z" />
          </svg>
        </div>

        <div className="text-center">
          <p
            className="text-amber-200/80 text-sm tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Completing the Ritual...
          </p>
          <p className="text-white/30 text-xs mt-2" style={{ fontFamily: "var(--font-body)" }}>
            Verifying your identity with the cathedral
          </p>
        </div>
      </div>
    </div>
  );
}
