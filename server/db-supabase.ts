/**
 * Supabase-native database layer.
 *
 * Drop-in replacement for server/db.ts that uses @supabase/supabase-js
 * instead of Drizzle ORM + MySQL. All function signatures match the
 * original so the tRPC router and api/_source.ts work without changes.
 *
 * Column mapping: Supabase uses snake_case, app uses camelCase.
 * We transform at the boundary in each function.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Supabase Client (lazy singleton) ──────────────────────

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn("[Supabase] Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return null;
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// ─── Type Definitions ──────────────────────────────────────

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string;
  category: string;
  priority: string;
  content: string;
  featuredImage: string | null;
  readingTime: number;
  published: number;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscussionComment {
  id: number;
  pageContext: string;
  section: string | null;
  parentId: number | null;
  userId: number | null;
  authorName: string;
  guestId: string | null;
  content: string;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerDeck {
  id: number;
  supabaseUserId: string;
  faction: string;
  name: string;
  cardIds: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Row Mappers (snake_case → camelCase) ──────────────────

function mapBlogPost(row: any): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    metaDescription: row.meta_description,
    keywords: row.keywords,
    category: row.category,
    priority: row.priority,
    content: row.content,
    featuredImage: row.featured_image,
    readingTime: row.reading_time,
    published: row.published,
    publishedAt: new Date(row.published_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapComment(row: any): DiscussionComment {
  return {
    id: row.id,
    pageContext: row.page_context,
    section: row.section,
    parentId: row.parent_id,
    userId: row.user_id,
    authorName: row.author_name,
    guestId: row.guest_id,
    content: row.content,
    upvotes: row.upvotes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapDeck(row: any): PlayerDeck {
  return {
    id: row.id,
    supabaseUserId: row.supabase_user_id,
    faction: row.faction,
    name: row.name,
    cardIds: row.card_ids,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ─── Blog Posts ────────────────────────────────────────────

export async function getBlogPosts(opts: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<{ posts: BlogPost[]; total: number }> {
  const sb = getSupabase();
  if (!sb) return { posts: [], total: 0 };

  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;

  // Build query for posts
  let query = sb
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("published", 1)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts.category) {
    query = query.eq("category", opts.category);
  }
  if (opts.search) {
    // Search across title, meta_description, and keywords
    query = query.or(
      `title.ilike.%${opts.search}%,meta_description.ilike.%${opts.search}%,keywords.ilike.%${opts.search}%`
    );
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("[Supabase] getBlogPosts error:", error);
    return { posts: [], total: 0 };
  }

  return {
    posts: (data || []).map(mapBlogPost),
    total: count ?? 0,
  };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const sb = getSupabase();
  if (!sb) return undefined;

  const { data, error } = await sb
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", 1)
    .limit(1)
    .single();

  if (error || !data) return undefined;
  return mapBlogPost(data);
}

export async function getRelatedPosts(
  category: string,
  excludeSlug: string,
  limit = 5
): Promise<BlogPost[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("blog_posts")
    .select("*")
    .eq("category", category)
    .eq("published", 1)
    .neq("slug", excludeSlug)
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapBlogPost);
}

export async function getAllBlogSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("published", 1)
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row: any) => ({
    slug: row.slug,
    updatedAt: new Date(row.updated_at),
  }));
}

export async function getRecentBlogPosts(limit = 50): Promise<BlogPost[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("blog_posts")
    .select("*")
    .eq("published", 1)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapBlogPost);
}

export async function getBlogCategoryCounts(): Promise<{ category: string; count: number }[]> {
  const sb = getSupabase();
  if (!sb) return [];

  // Supabase doesn't have a direct GROUP BY via the client, so we fetch all categories
  // and count client-side. For 466 posts this is fine.
  const { data, error } = await sb
    .from("blog_posts")
    .select("category")
    .eq("published", 1);

  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.category] = (counts[row.category] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Discussion Comments ───────────────────────────────────

export async function getDiscussionComments(pageContext: string): Promise<DiscussionComment[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("discussion_comments")
    .select("*")
    .eq("page_context", pageContext)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapComment);
}

export async function createDiscussionComment(
  input: Omit<DiscussionComment, "id" | "createdAt" | "updatedAt" | "upvotes">
): Promise<{ id: number }> {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");

  const { data, error } = await sb
    .from("discussion_comments")
    .insert({
      page_context: input.pageContext,
      section: input.section,
      parent_id: input.parentId,
      user_id: input.userId,
      author_name: input.authorName,
      guest_id: input.guestId,
      content: input.content,
      upvotes: 0,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("Failed to create comment: " + (error?.message || "unknown"));
  return { id: data.id };
}

export async function deleteDiscussionComment(commentId: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  // Delete child replies first
  await sb.from("discussion_comments").delete().eq("parent_id", commentId);
  // Delete the comment itself
  await sb.from("discussion_comments").delete().eq("id", commentId);
  return true;
}

export async function upvoteDiscussionComment(commentId: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  // Fetch current upvotes, increment, update
  const { data: current } = await sb
    .from("discussion_comments")
    .select("upvotes")
    .eq("id", commentId)
    .single();

  if (!current) return false;

  await sb
    .from("discussion_comments")
    .update({ upvotes: (current.upvotes || 0) + 1 })
    .eq("id", commentId);

  return true;
}

// ─── Player Decks ──────────────────────────────────────────

export async function getDecksByUser(supabaseUserId: string): Promise<PlayerDeck[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("player_decks")
    .select("*")
    .eq("supabase_user_id", supabaseUserId)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapDeck);
}

export async function getDeckById(deckId: number): Promise<PlayerDeck | undefined> {
  const sb = getSupabase();
  if (!sb) return undefined;

  const { data, error } = await sb
    .from("player_decks")
    .select("*")
    .eq("id", deckId)
    .limit(1)
    .single();

  if (error || !data) return undefined;
  return mapDeck(data);
}

export async function createDeck(
  input: { supabaseUserId: string; faction: string; name: string; cardIds: string; isActive?: number }
): Promise<{ id: number }> {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");

  const { data, error } = await sb
    .from("player_decks")
    .insert({
      supabase_user_id: input.supabaseUserId,
      faction: input.faction,
      name: input.name,
      card_ids: input.cardIds,
      is_active: input.isActive ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("Failed to create deck: " + (error?.message || "unknown"));
  return { id: data.id };
}

export async function updateDeck(
  deckId: number,
  data: Partial<{ name: string; cardIds: string; isActive: number }>
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const updateObj: Record<string, any> = {};
  if (data.name !== undefined) updateObj.name = data.name;
  if (data.cardIds !== undefined) updateObj.card_ids = data.cardIds;
  if (data.isActive !== undefined) updateObj.is_active = data.isActive;
  updateObj.updated_at = new Date().toISOString();

  await sb.from("player_decks").update(updateObj).eq("id", deckId);
  return true;
}

export async function deleteDeck(deckId: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  await sb.from("player_decks").delete().eq("id", deckId);
  return true;
}

export async function setActiveDeck(
  supabaseUserId: string,
  faction: string,
  deckId: number
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  // Deactivate all decks for this user+faction
  await sb
    .from("player_decks")
    .update({ is_active: 0, updated_at: new Date().toISOString() })
    .eq("supabase_user_id", supabaseUserId)
    .eq("faction", faction);

  // Activate the chosen deck
  await sb
    .from("player_decks")
    .update({ is_active: 1, updated_at: new Date().toISOString() })
    .eq("id", deckId);

  return true;
}

// ─── User Account Deletion (GDPR) ─────────────────────────

export async function deleteAllUserData(supabaseUserId: string): Promise<{
  decksDeleted: number;
  commentsDeleted: number;
}> {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");

  // Count decks before deleting
  const { count: deckCount } = await sb
    .from("player_decks")
    .select("*", { count: "exact", head: true })
    .eq("supabase_user_id", supabaseUserId);

  // Delete all decks
  await sb.from("player_decks").delete().eq("supabase_user_id", supabaseUserId);

  // Count comments before deleting
  const { count: commentCount } = await sb
    .from("discussion_comments")
    .select("*", { count: "exact", head: true })
    .eq("guest_id", supabaseUserId);

  // Delete all comments by this user
  await sb.from("discussion_comments").delete().eq("guest_id", supabaseUserId);

  return {
    decksDeleted: deckCount ?? 0,
    commentsDeleted: commentCount ?? 0,
  };
}

// ─── Community Decks ──────────────────────────────────────

export interface CommunityDeck {
  id: number;
  playerId: string;
  gamertag: string;
  deckName: string;
  faction: string;
  cardIds: string;
  strategy: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

function mapCommunityDeck(row: any): CommunityDeck {
  return {
    id: row.id,
    playerId: row.player_id,
    gamertag: row.gamertag,
    deckName: row.deck_name,
    faction: row.faction,
    cardIds: row.card_ids,
    strategy: row.strategy || "",
    likes: row.likes || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/** Get or set a player's gamertag */
export async function getPlayerGamertag(playerId: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("players")
    .select("gamertag")
    .eq("id", playerId)
    .single();
  if (error || !data) return null;
  return data.gamertag || null;
}

export async function setPlayerGamertag(playerId: string, gamertag: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("players")
    .update({ gamertag })
    .eq("id", playerId);
  if (error) {
    console.error("[Supabase] Failed to set gamertag:", error.message);
    return false;
  }
  return true;
}

export async function isGamertagTaken(gamertag: string, excludePlayerId?: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  let query = sb
    .from("players")
    .select("id", { count: "exact", head: true })
    .eq("gamertag", gamertag);
  if (excludePlayerId) {
    query = query.neq("id", excludePlayerId);
  }
  const { count } = await query;
  return (count ?? 0) > 0;
}

/** Publish a deck to the community library */
export async function publishCommunityDeck(input: {
  playerId: string;
  gamertag: string;
  deckName: string;
  faction: string;
  cardIds: string;
  strategy: string;
}): Promise<{ id: number }> {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");
  const { data, error } = await sb
    .from("community_decks")
    .insert({
      player_id: input.playerId,
      gamertag: input.gamertag,
      deck_name: input.deckName,
      faction: input.faction,
      card_ids: input.cardIds,
      strategy: input.strategy,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("Failed to publish deck: " + (error?.message || "unknown"));
  return { id: data.id };
}

/** List community decks with optional filters */
export async function listCommunityDecks(opts: {
  faction?: string;
  sortBy?: "newest" | "likes";
  page?: number;
  limit?: number;
}): Promise<{ decks: CommunityDeck[]; total: number }> {
  const sb = getSupabase();
  if (!sb) return { decks: [], total: 0 };

  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;

  let query = sb
    .from("community_decks")
    .select("*", { count: "exact" });

  if (opts.faction) {
    query = query.eq("faction", opts.faction);
  }

  if (opts.sortBy === "likes") {
    query = query.order("likes", { ascending: false }).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error || !data) return { decks: [], total: 0 };
  return { decks: data.map(mapCommunityDeck), total: count ?? 0 };
}

/** Get a single community deck by ID */
export async function getCommunityDeck(deckId: number): Promise<CommunityDeck | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("community_decks")
    .select("*")
    .eq("id", deckId)
    .single();
  if (error || !data) return null;
  return mapCommunityDeck(data);
}

/** Unpublish (delete) a community deck — only the owner can do this */
export async function unpublishCommunityDeck(deckId: number, playerId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("community_decks")
    .delete()
    .eq("id", deckId)
    .eq("player_id", playerId);
  if (error) {
    console.error("[Supabase] Failed to unpublish deck:", error.message);
    return false;
  }
  return true;
}

/** Like a community deck (increment likes) */
export async function likeCommunityDeck(deckId: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: current } = await sb
    .from("community_decks")
    .select("likes")
    .eq("id", deckId)
    .single();
  if (!current) return false;
  const { error } = await sb
    .from("community_decks")
    .update({ likes: (current.likes || 0) + 1 })
    .eq("id", deckId);
  if (error) return false;
  return true;
}

/** Get community decks published by a specific player */
export async function getPlayerCommunityDecks(playerId: string): Promise<CommunityDeck[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("community_decks")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapCommunityDeck);
}

// ─── User Management (stubs for Manus OAuth compat) ────────
// These are used by the Manus OAuth flow in the bundled serverless function.
// On Vercel with Supabase Auth, these are no-ops but must exist to avoid
// import errors during esbuild bundling.

export async function upsertUser(_user: any): Promise<void> {
  // No-op: Supabase Auth handles user management
  return;
}

export async function getUserByOpenId(_openId: string): Promise<any> {
  // No-op: Supabase Auth handles user lookup
  return undefined;
}
