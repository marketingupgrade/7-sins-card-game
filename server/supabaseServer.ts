/**
 * Server-side Supabase Client
 *
 * Uses the service_role key for full database access.
 * Only use this on the server - never expose to the client.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _serverSupabase: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (_serverSupabase) return _serverSupabase;

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing server Supabase env vars (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }

  _serverSupabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _serverSupabase;
}
