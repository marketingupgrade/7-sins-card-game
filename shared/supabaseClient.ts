/**
 * Supabase Client Configuration
 *
 * Provides both a client-side (anon key) and server-side (service role key)
 * Supabase client for the 7 Deadly Sins Card Game.
 *
 * The external Supabase project is separate from the Manus built-in database.
 * It handles: game state, real-time subscriptions, and multiplayer sync.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Client-side Supabase (uses anon key, safe for browser) ──
let _clientSupabase: SupabaseClient | null = null;

export function getClientSupabase(): SupabaseClient {
  if (_clientSupabase) return _clientSupabase;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)");
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
