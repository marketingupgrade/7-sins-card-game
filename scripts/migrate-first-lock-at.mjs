/**
 * Migration: Add first_lock_at column to Supabase games table
 * Uses the Supabase Management API via fetch
 */

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing env vars");
  process.exit(1);
}

// Extract project ref from URL (e.g., https://xqotfmrlhqiayiyjijpl.supabase.co)
const projectRef = url.replace("https://", "").split(".")[0];
console.log("Project ref:", projectRef);

// Use the PostgREST RPC endpoint to execute SQL
// Supabase allows running SQL via the pg_net extension or via the REST API
// Alternative: use the supabase-js client with a Postgres function

// Actually, the simplest approach: use the Supabase REST API to call a Postgres function
// But we need to create the function first... Chicken and egg.

// Best approach: Use the Supabase SQL endpoint directly
async function runSQL(sql) {
  // The Supabase project has a SQL endpoint at /rest/v1/rpc
  // But we need a function. Let's try the pg_graphql approach or just use
  // the management API.
  
  // Actually, for Supabase, we can use the /pg endpoint with the service role key
  const resp = await fetch(`${url}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // This won't work without a function...
    }),
  });
  console.log("Status:", resp.status);
  const text = await resp.text();
  console.log("Response:", text);
}

// The real solution: just store first_lock_at in the existing JSONB metadata
// or use a column that already exists. Let's check what columns the games table has.
async function checkColumns() {
  const resp = await fetch(`${url}/rest/v1/games?select=*&limit=0`, {
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "count=exact",
    },
  });
  console.log("Status:", resp.status);
  console.log("Headers:", Object.fromEntries(resp.headers.entries()));
}

checkColumns().catch(console.error);
