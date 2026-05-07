/**
 * Run DDL migration against Supabase PostgreSQL via the SQL API
 */
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
-- Add gamertag column to players
ALTER TABLE players ADD COLUMN IF NOT EXISTS gamertag VARCHAR(30) UNIQUE;

-- Create community_decks table
CREATE TABLE IF NOT EXISTS community_decks (
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

CREATE INDEX IF NOT EXISTS idx_community_decks_faction ON community_decks(faction);
CREATE INDEX IF NOT EXISTS idx_community_decks_player ON community_decks(player_id);
CREATE INDEX IF NOT EXISTS idx_community_decks_likes ON community_decks(likes DESC);
`;

// Use the Supabase pg endpoint (available with service role key)
const res = await fetch(`${SUPABASE_URL}/pg`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

console.log('Status:', res.status);
const text = await res.text();
console.log('Response:', text.substring(0, 500));
