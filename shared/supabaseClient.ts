/**
 * Supabase Client Configuration
 *
 * Provides a client-side (anon key) Supabase client for the 7 Deadly Sins Card Game.
 *
 * The external Supabase project is separate from the Manus built-in database.
 * It handles: game state, real-time subscriptions, and multiplayer sync.
 *
 * SECURITY: Never expose environment variable names or internal config to users.
 * All configuration errors are logged to console only.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Client-side Supabase (uses anon key, safe for browser) ──
let _clientSupabase: SupabaseClient | null = null;

export function getClientSupabase(): SupabaseClient {
  if (_clientSupabase) return _clientSupabase;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("[Supabase] Client configuration incomplete. Check server environment.");
    throw new Error("Game server is temporarily unavailable. Try again in a moment.");
  }

  _clientSupabase = createClient(url, anonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return _clientSupabase;
}
