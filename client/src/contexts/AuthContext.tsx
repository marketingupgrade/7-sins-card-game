/**
 * AuthContext — Supabase Auth Session Management
 *
 * Provides authentication state across the app using Supabase Auth.
 * Supports: Discord OAuth, Google OAuth, email/password, and phone/OTP.
 *
 * Usage:
 *   const { user, session, signOut, isLoading } = useSupabaseAuth();
 *
 * The context listens to Supabase auth state changes and keeps
 * the React tree in sync. It also links the Supabase auth user
 * to the existing `players` table for game identity continuity.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getClientSupabase } from "../../../shared/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  /** Display name — from user metadata or email prefix */
  displayName: string | null;
  /** Avatar URL from OAuth provider */
  avatarUrl: string | null;
  /** Sign out and clear session */
  signOut: () => Promise<void>;
  /** Sign in with Discord OAuth */
  signInWithDiscord: () => Promise<void>;
  /** Sign in with Google OAuth */
  signInWithGoogle: () => Promise<void>;
  /** Sign in with email + password */
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Sign up with email + password */
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Send OTP to phone number */
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  /** Verify phone OTP */
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * Extract a display name from the Supabase user object.
 * Checks OAuth metadata first, then falls back to email prefix.
 */
function getDisplayName(user: User | null): string | null {
  if (!user) return null;
  const meta = user.user_metadata;
  return (
    meta?.full_name ||
    meta?.name ||
    meta?.preferred_username ||
    meta?.user_name ||
    user.email?.split("@")[0] ||
    user.phone ||
    null
  );
}

function getAvatarUrl(user: User | null): string | null {
  if (!user) return null;
  const meta = user.user_metadata;
  return meta?.avatar_url || meta?.picture || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getClientSupabase();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Link Supabase auth user to the existing `players` table.
   * This ensures game identity continuity when a guest logs in.
   */
  useEffect(() => {
    if (!user) return;
    const supabase = getClientSupabase();
    const displayName = getDisplayName(user);

    // Upsert into players table so the game engine recognizes this user
    supabase
      .from("players")
      .upsert(
        {
          id: user.id,
          username: displayName || "Sinner",
        },
        { onConflict: "id" }
      )
      .then(({ error }) => {
        if (error) console.error("[Auth] Failed to sync player:", error.message);
      });

    // Also store the auth user ID in localStorage so the game engine picks it up
    localStorage.setItem("7sins_player_id", user.id);
  }, [user]);

  const signOut = useCallback(async () => {
    const supabase = getClientSupabase();
    await supabase.auth.signOut();
    // Don't clear localStorage player ID — let them keep playing as guest
  }, []);

  const signInWithDiscord = useCallback(async () => {
    const supabase = getClientSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getClientSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const supabase = getClientSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const supabase = getClientSupabase();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error?.message ?? null };
    },
    []
  );

  const signInWithPhone = useCallback(async (phone: string) => {
    const supabase = getClientSupabase();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return { error: error?.message ?? null };
  }, []);

  const verifyPhoneOtp = useCallback(
    async (phone: string, token: string) => {
      const supabase = getClientSupabase();
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      return { error: error?.message ?? null };
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        displayName: getDisplayName(user),
        avatarUrl: getAvatarUrl(user),
        signOut,
        signInWithDiscord,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInWithPhone,
        verifyPhoneOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useSupabaseAuth must be used within <AuthProvider>");
  return ctx;
}
