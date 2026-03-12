/**
 * Migration: Add columns for simultaneous lock-in system
 * 
 * Tables modified:
 * - games: add turn_phase, locked_plays, selection_deadline
 * - active_effects: add compound_pattern, doubled
 * - game_players: add locked_cards
 */

import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Since we can't run ALTER TABLE via the Supabase JS client,
// we'll use a workaround: create a temporary SQL function, execute it, then drop it.
async function run() {
  console.log('Creating temporary SQL execution function...');
  
  // First, create a function that can execute arbitrary SQL
  const createFnResult = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  }).catch(() => null);

  // Alternative: Use the Supabase SQL endpoint (v1)
  const sqlEndpoint = `${process.env.VITE_SUPABASE_URL}/rest/v1/`;
  
  // Actually, let's try a different approach - use the database connection string directly
  // The Supabase project has a postgres connection we can use
  
  // For now, let's try the simplest approach: just test if columns exist by trying to use them
  // If they don't exist, we'll need to add them via the Supabase dashboard
  
  const queries = [
    "ALTER TABLE games ADD COLUMN IF NOT EXISTS turn_phase text DEFAULT 'selection'",
    "ALTER TABLE games ADD COLUMN IF NOT EXISTS locked_plays jsonb DEFAULT '{}'::jsonb",
    "ALTER TABLE games ADD COLUMN IF NOT EXISTS selection_deadline timestamptz",
    "ALTER TABLE active_effects ADD COLUMN IF NOT EXISTS compound_pattern text",
    "ALTER TABLE active_effects ADD COLUMN IF NOT EXISTS doubled boolean DEFAULT false",
    "ALTER TABLE game_players ADD COLUMN IF NOT EXISTS locked_cards jsonb DEFAULT '[]'::jsonb",
  ];

  // Try using the pg_net extension or direct connection
  // Actually, let's use the Supabase Management API v1
  const projectRef = new URL(process.env.VITE_SUPABASE_URL).hostname.split('.')[0];
  
  for (const query of queries) {
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        }
      );
      const text = await response.text();
      console.log(`Query: ${query.substring(0, 60)}...`);
      console.log(`Result: ${response.status} ${text.substring(0, 100)}`);
    } catch (err) {
      console.log(`Error for: ${query.substring(0, 60)}...`);
      console.log(err.message);
    }
  }
}

run().catch(console.error);
