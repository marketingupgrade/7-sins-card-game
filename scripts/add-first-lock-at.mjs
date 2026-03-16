/**
 * Migration: Add first_lock_at column to Supabase games table
 * 
 * This column tracks when the first player locked in during a selection phase,
 * enabling server-side turn timer enforcement.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

async function migrate() {
  // Use Supabase's SQL editor via the management API
  // Since we can't run DDL via PostgREST, we'll use a workaround:
  // Try to select the column first to check if it exists
  const { error: checkError } = await sb.from("games").select("first_lock_at").limit(1);
  
  if (!checkError) {
    console.log("Column first_lock_at already exists. No migration needed.");
    return;
  }

  console.log("Column first_lock_at does not exist. Need to add it via Supabase SQL Editor.");
  console.log("");
  console.log("Please run this SQL in the Supabase SQL Editor:");
  console.log("  ALTER TABLE games ADD COLUMN first_lock_at TIMESTAMPTZ DEFAULT NULL;");
  console.log("");
  console.log("Or we can use the games table's JSONB metadata approach instead.");
}

migrate().catch(console.error);
