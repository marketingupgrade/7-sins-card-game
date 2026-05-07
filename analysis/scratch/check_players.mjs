import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Check players table
const { data, error } = await sb.from('players').select('*').limit(3);
console.log('Players error:', error);
console.log('Players sample:', JSON.stringify(data, null, 2));

// Check if community_decks table exists
const { data: d2, error: e2 } = await sb.from('community_decks').select('*').limit(1);
console.log('\nCommunity decks error:', e2);
console.log('Community decks data:', d2);

// Check player_decks structure
const { data: d3, error: e3 } = await sb.from('player_decks').select('*').limit(1);
console.log('\nPlayer decks error:', e3);
console.log('Player decks sample:', JSON.stringify(d3, null, 2));
