/**
 * Migration: Add gamertag to players + create community_decks table
 * Uses Supabase Management API SQL endpoint
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use the Supabase SQL endpoint (pg REST doesn't support DDL)
// We'll use the postgrest-compatible approach: create via raw fetch to the SQL endpoint
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

async function runSQL(sql, description) {
  console.log(`\n--- ${description} ---`);
  
  // Use the Supabase SQL API endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.log(`HTTP ${res.status}: ${text}`);
    return false;
  }
  
  console.log('Success');
  return true;
}

// Alternative: use supabase-js to insert test data to verify table exists
import { createClient } from '@supabase/supabase-js';
const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: 'public' },
  auth: { persistSession: false },
});

// Step 1: Check if gamertag column already exists on players
const { data: sample } = await sb.from('players').select('*').limit(1);
const hasGamertag = sample && sample.length > 0 && 'gamertag' in sample[0];
console.log('Players has gamertag column:', hasGamertag);

if (!hasGamertag) {
  // Need to add gamertag column - use the Supabase Dashboard SQL editor API
  console.log('\nGamertag column missing. Adding via direct PostgreSQL connection...');
  console.log('NOTE: You may need to add this column manually via the Supabase Dashboard SQL editor:');
  console.log('  ALTER TABLE players ADD COLUMN gamertag VARCHAR(30) UNIQUE;');
}

// Step 2: Check if community_decks table exists
const { error: cdErr } = await sb.from('community_decks').select('id').limit(1);
if (cdErr && cdErr.code === 'PGRST205') {
  console.log('\ncommunity_decks table does not exist. Creating...');
  console.log('NOTE: Run this SQL in the Supabase Dashboard SQL editor:');
  console.log(`
CREATE TABLE community_decks (
  id SERIAL PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  gamertag VARCHAR(30) NOT NULL,
  deck_name VARCHAR(100) NOT NULL,
  faction VARCHAR(32) NOT NULL,
  card_ids TEXT NOT NULL,
  strategy TEXT DEFAULT '',
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_decks_faction ON community_decks(faction);
CREATE INDEX idx_community_decks_player ON community_decks(player_id);
CREATE INDEX idx_community_decks_likes ON community_decks(likes DESC);

-- Enable RLS
ALTER TABLE community_decks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read community decks
CREATE POLICY "Community decks are viewable by everyone" ON community_decks
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own decks
CREATE POLICY "Users can insert their own community decks" ON community_decks
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Allow users to update their own decks
CREATE POLICY "Users can update their own community decks" ON community_decks
  FOR UPDATE USING (auth.uid() = player_id);

-- Allow users to delete their own decks
CREATE POLICY "Users can delete their own community decks" ON community_decks
  FOR DELETE USING (auth.uid() = player_id);
  `);
} else {
  console.log('\ncommunity_decks table already exists');
}

// Cleanup
process.exit(0);
