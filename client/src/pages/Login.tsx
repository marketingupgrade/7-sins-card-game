/**
 * Login Page — Supabase Auth Gateway
 *
 * Gothic-themed authentication page:
 * - Email + password (primary — sign in / sign up)
 * - Discord, Google, Twitch (coming soon)
 *
 * Guests can continue without logging in but won't be able to save decks.
 */

import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useSupabaseAuth } from "@/contexts/AuthContext";
import EmberField from "@/components/EmberField";
import { usePageMeta } from "@/hooks/usePageMeta";

type EmailMode = "signin" | "signup" | "forgot";

/** Discord brand icon */
function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

/** Google brand icon */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/** Twitch brand icon */
function TwitchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

export default function Login() {
  usePageMeta({
    title: "Sign In",
    description: "Sign in to the 7 Deadly Sins Card Game to save your progress, build decks, and compete in ranked matches.",
    canonicalPath: "/login",
  });

  const [, navigate] = useLocation();
  const {
    user,
    signInWithEmail,
    signUpWithEmail,
    resetPasswordForEmail,
  } = useSupabaseAuth();

  const [emailMode, setEmailMode] = useState<EmailMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    navigate("/");
    return null;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (emailMode === "forgot") {
      const { error: err } = await resetPasswordForEmail(email);
      if (err) setError(err);
      else setSuccess("Password reset link sent. Check your email.");
    } else if (emailMode === "signin") {
      const { error: err } = await signInWithEmail(email, password);
      if (err) setError(err);
      else navigate("/");
    } else {
      const { error: err } = await signUpWithEmail(email, password);
      if (err) setError(err);
      else setSuccess("Check your email for a confirmation link. Then sign in.");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-4">
      <EmberField />

      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }}
      />

      <div className="relative z-20 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img
              src="https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-logo-v3-3chkwhz9LsB5kZ8AaXhdvw.webp"
              alt="7S"
              className="w-16 h-16 mx-auto mb-4 opacity-80 hover:opacity-100 transition-opacity"
            />
            <h1
              className="text-3xl sm:text-4xl text-amber-100/90 tracking-[0.15em] hover:text-amber-200/100 transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              7 DEADLY SINS
            </h1>
          </Link>
          <div className="flex items-center gap-3 justify-center mt-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/30" />
            <svg width="10" height="10" viewBox="0 0 12 12" className="text-amber-500/40">
              <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="currentColor" />
            </svg>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/30" />
          </div>
          <p
            className="text-[10px] tracking-[0.3em] text-amber-200/30 mt-3 uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Enter the Cathedral
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15, 12, 10, 0.97), rgba(20, 15, 12, 0.95))",
            border: "1px solid rgba(245, 158, 11, 0.12)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(245, 158, 11, 0.03)",
          }}
        >
          <div className="p-6">
            {/* Error / Success messages */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                {success}
              </div>
            )}

            {/* Email form — primary auth method */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] text-amber-200/40 uppercase mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sinner@cathedral.gg"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 text-sm focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>

              {/* Password field — hidden in forgot mode */}
              {emailMode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] tracking-[0.2em] text-amber-200/40 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                      Password
                    </label>
                    {emailMode === "signin" && (
                      <button
                        type="button"
                        onClick={() => { setEmailMode("forgot"); setError(null); setSuccess(null); }}
                        className="text-[10px] text-amber-400/40 hover:text-amber-400/70 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 text-sm focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-200 text-sm font-medium tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {loading
                  ? "Processing..."
                  : emailMode === "forgot"
                    ? "Send Reset Link"
                    : emailMode === "signin"
                      ? "Sign In"
                      : "Create Account"}
              </button>

              {/* Mode toggle links */}
              <div className="flex flex-col items-center gap-1">
                {emailMode === "forgot" ? (
                  <button
                    type="button"
                    onClick={() => { setEmailMode("signin"); setError(null); setSuccess(null); }}
                    className="text-center text-xs text-white/30 hover:text-white/50 transition-colors"
                  >
                    Back to sign in
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode(emailMode === "signin" ? "signup" : "signin");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-center text-xs text-white/30 hover:text-white/50 transition-colors"
                  >
                    {emailMode === "signin"
                      ? "Don't have an account? Create one"
                      : "Already have an account? Sign in"}
                  </button>
                )}
              </div>
            </form>

            {/* Social providers — coming soon */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[9px] text-white/15 tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                  coming soon
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="flex gap-3">
                {/* Discord — coming soon */}
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#5865F2]/5 border border-[#5865F2]/10 text-white/20 cursor-not-allowed relative group"
                  title="Discord sign-in coming soon"
                >
                  <DiscordIcon />
                  <span className="text-[11px] font-medium tracking-wide">Discord</span>
                </button>

                {/* Google — coming soon */}
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/3 border border-white/5 text-white/20 cursor-not-allowed relative group opacity-60"
                  title="Google sign-in coming soon"
                >
                  <GoogleIcon />
                  <span className="text-[11px] font-medium tracking-wide">Google</span>
                </button>

                {/* Twitch — coming soon */}
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#9146FF]/5 border border-[#9146FF]/10 text-white/20 cursor-not-allowed relative group opacity-60"
                  title="Twitch sign-in coming soon"
                >
                  <TwitchIcon />
                  <span className="text-[11px] font-medium tracking-wide">Twitch</span>
                </button>
              </div>
            </div>

            {/* Value prop */}
            <p className="text-center text-white/25 text-[11px] leading-relaxed mt-5" style={{ fontFamily: "var(--font-body)" }}>
              Sign in to save your custom decks, track your match history, and unlock faction achievements.
            </p>
          </div>

          {/* Footer — continue as guest */}
          <div className="px-6 pb-5 pt-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] text-white/15 tracking-widest uppercase" style={{ fontFamily: "var(--font-heading)" }}>or</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <Link
              href="/"
              className="block w-full text-center py-2.5 rounded-lg text-white/30 hover:text-white/50 text-xs tracking-wider uppercase transition-colors hover:bg-white/3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Continue as Guest
            </Link>
            <p className="text-center text-[10px] text-white/15 mt-2">
              Guests can play but cannot save custom decks
            </p>
          </div>
        </div>

        {/* Legal links */}
        <div className="flex justify-center gap-4 mt-6">
          {[
            { label: "Terms", href: "/terms" },
            { label: "Privacy", href: "/privacy" },
            { label: "Cookies", href: "/cookies" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] text-white/15 hover:text-white/30 transition-colors tracking-wider uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
