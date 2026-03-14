/**
 * ResetPassword Page — Set New Password
 *
 * Users land here after clicking the password reset link in their email.
 * Supabase automatically establishes a session from the reset token in the URL,
 * so we can call updateUser({ password }) directly.
 */

import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useSupabaseAuth } from "@/contexts/AuthContext";
import EmberField from "@/components/EmberField";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const { user, updatePassword, isLoading: authLoading } = useSupabaseAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Wait briefly for Supabase to process the recovery token from URL hash
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  // Show loading while Supabase processes the recovery token
  if (authLoading || !ready) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-4">
        <EmberField />
        <div className="relative z-20 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full mx-auto mb-4" />
          <p className="text-amber-200/40 text-sm tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  // No session means the reset token was invalid or expired
  if (!user && ready) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-4">
        <EmberField />
        <div className="relative z-20 w-full max-w-md text-center">
          <h1
            className="text-2xl text-amber-100/90 tracking-[0.1em] mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Link Expired
          </h1>
          <p className="text-white/40 text-sm mb-6">
            This password reset link has expired or is invalid. Please request a new one.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-200 text-sm font-medium tracking-wider uppercase transition-all"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

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
            Set New Password
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15, 12, 10, 0.97), rgba(20, 15, 12, 0.95))",
            border: "1px solid rgba(245, 158, 11, 0.12)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(245, 158, 11, 0.03)",
          }}
        >
          <div className="p-6">
            {success ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2
                  className="text-lg text-amber-100/90 tracking-wider mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Password Updated
                </h2>
                <p className="text-white/40 text-sm mb-6">
                  Your password has been changed. You can now sign in.
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-200 text-sm font-medium tracking-wider uppercase transition-all"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Enter the Cathedral
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-amber-200/40 uppercase mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                      New Password
                    </label>
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
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-amber-200/40 uppercase mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/90 placeholder:text-white/20 text-sm focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-200 text-sm font-medium tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {loading ? "Updating..." : "Set New Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
