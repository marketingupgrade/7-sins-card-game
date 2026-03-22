/**
 * Add cover_image_url column to Supabase chronicles table.
 * Connects directly to Supabase PostgreSQL using pg.
 */
import pg from "pg";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Extract project ref from URL: https://xqotfmrlhqiayiyjijpl.supabase.co
const projectRef = supabaseUrl?.replace("https://", "").split(".")[0];
const password = process.env.SUPABASE_DB_PASSWORD || "";

// Supabase direct connection string format
const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

async function main() {
  // Alternative: use the Supabase management API
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Try the Supabase management API approach first
  console.log("Attempting to add column via Supabase Management API...");
  
  try {
    // The Supabase Management API has a SQL endpoint
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        query: "ALTER TABLE chronicles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;"
      })
    });
    
    if (res.ok) {
      console.log("✅ Column added successfully via Management API!");
      return;
    }
    console.log("Management API:", res.status, await res.text());
  } catch (e) {
    console.log("Management API failed:", e.message);
  }
  
  console.log("\n⚠️  Could not add column automatically.");
  console.log("Please run this SQL in the Supabase SQL Editor:");
  console.log("  ALTER TABLE chronicles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;");
  console.log("\nThe code will handle the missing column gracefully (cover art will be null).");
}

main().catch(console.error);
