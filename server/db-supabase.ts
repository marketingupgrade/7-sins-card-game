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

/**
 * Toggle like on a community deck (per-player, one like per deck).
 * Uses the community_likes junction table for rate-limiting.
 * Returns { liked: boolean, newCount: number } so the UI can update instantly.
 */
export async function toggleCommunityLike(
  deckId: number,
  playerId: string
): Promise<{ liked: boolean; newCount: number }> {
  const sb = getSupabase();
  if (!sb) return { liked: false, newCount: 0 };

  // Check if the player already liked this deck
  const { data: existing } = await sb
    .from("community_likes")
    .select("id")
    .eq("deck_id", deckId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (existing) {
    // Unlike: remove the like row and decrement
    await sb.from("community_likes").delete().eq("id", existing.id);
    const { data: current } = await sb
      .from("community_decks")
      .select("likes")
      .eq("id", deckId)
      .single();
    const newCount = Math.max(0, (current?.likes || 1) - 1);
    await sb.from("community_decks").update({ likes: newCount }).eq("id", deckId);
    return { liked: false, newCount };
  } else {
    // Like: insert a like row and increment
    await sb.from("community_likes").insert({ deck_id: deckId, player_id: playerId });
    const { data: current } = await sb
      .from("community_decks")
      .select("likes")
      .eq("id", deckId)
      .single();
    const newCount = (current?.likes || 0) + 1;
    await sb.from("community_decks").update({ likes: newCount }).eq("id", deckId);
    return { liked: true, newCount };
  }
}

/** Check which deck IDs a player has liked (for rendering filled hearts) */
export async function getPlayerLikedDeckIds(playerId: string): Promise<number[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("community_likes")
    .select("deck_id")
    .eq("player_id", playerId);
  if (error || !data) return [];
  return data.map((r: any) => r.deck_id);
}

// ─── Community Comments ────────────────────────────────────

export interface CommunityComment {
  id: number;
  deckId: number;
  playerId: string;
  gamertag: string;
  content: string;
  parentId: number | null;
  createdAt: Date;
  replies?: CommunityComment[];
}

function mapCommunityComment(row: any): CommunityComment {
  return {
    id: row.id,
    deckId: row.deck_id,
    playerId: row.player_id,
    gamertag: row.gamertag,
    content: row.content,
    parentId: row.parent_id ?? null,
    createdAt: new Date(row.created_at),
  };
}

/**
 * List comments for a community deck as a threaded tree.
 * Top-level comments (parent_id IS NULL) are returned newest-first.
 * Each top-level comment has a `replies` array sorted oldest-first
 * so conversations read naturally top-to-bottom.
 */
export async function listDeckComments(
  deckId: number,
  limit = 100
): Promise<CommunityComment[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("community_comments")
    .select("*")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error || !data) return [];

  const all = data.map(mapCommunityComment);
  const byId = new Map<number, CommunityComment>();
  const roots: CommunityComment[] = [];

  for (const c of all) {
    c.replies = [];
    byId.set(c.id, c);
  }
  for (const c of all) {
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.replies!.push(c);
    } else {
      roots.push(c);
    }
  }
  // Return top-level newest-first
  roots.reverse();
  return roots;
}

/** Add a comment (or reply) to a community deck */
export async function addDeckComment(input: {
  deckId: number;
  playerId: string;
  gamertag: string;
  content: string;
  parentId?: number | null;
}): Promise<CommunityComment | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const row: Record<string, any> = {
    deck_id: input.deckId,
    player_id: input.playerId,
    gamertag: input.gamertag,
    content: input.content,
  };
  if (input.parentId) row.parent_id = input.parentId;
  const { data, error } = await sb
    .from("community_comments")
    .insert(row)
    .select("*")
    .single();
  if (error || !data) {
    console.error("[Supabase] Failed to add comment:", error?.message);
    return null;
  }
  return mapCommunityComment(data);
}

/** Delete a comment (only the author can delete) */
export async function deleteDeckComment(
  commentId: number,
  playerId: string
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb
    .from("community_comments")
    .delete()
    .eq("id", commentId)
    .eq("player_id", playerId);
  if (error) {
    console.error("[Supabase] Failed to delete comment:", error.message);
    return false;
  }
  return true;
}

/** Get comment count for a deck (for badge display) */
export async function getDeckCommentCount(deckId: number): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const { count, error } = await sb
    .from("community_comments")
    .select("id", { count: "exact", head: true })
    .eq("deck_id", deckId);
  if (error) return 0;
  return count ?? 0;
}

/** Get comment counts for multiple decks at once (batch) */
export async function getDeckCommentCounts(deckIds: number[]): Promise<Record<number, number>> {
  const sb = getSupabase();
  if (!sb || deckIds.length === 0) return {};
  const { data, error } = await sb
    .from("community_comments")
    .select("deck_id")
    .in("deck_id", deckIds);
  if (error || !data) return {};
  const counts: Record<number, number> = {};
  for (const row of data) {
    counts[row.deck_id] = (counts[row.deck_id] || 0) + 1;
  }
  return counts;
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

// ─── Deck Match Results (Win-Rate Tracking) ──────────────────

export interface DeckMatchResult {
  id: number;
  deckId: number;
  playerId: string;
  result: "win" | "loss";
  opponentFaction: string;
  createdAt: Date;
}

function mapMatchResult(row: any): DeckMatchResult {
  return {
    id: row.id,
    deckId: row.deck_id,
    playerId: row.player_id,
    result: row.result,
    opponentFaction: row.opponent_faction,
    createdAt: new Date(row.created_at),
  };
}

/** Log a match result (win/loss) for a community deck */
export async function logDeckMatchResult(input: {
  deckId: number;
  playerId: string;
  result: "win" | "loss";
  opponentFaction: string;
}): Promise<DeckMatchResult | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("deck_match_results")
    .insert({
      deck_id: input.deckId,
      player_id: input.playerId,
      result: input.result,
      opponent_faction: input.opponentFaction,
    })
    .select("*")
    .single();
  if (error || !data) {
    console.error("[Supabase] Failed to log match result:", error?.message);
    return null;
  }
  return mapMatchResult(data);
}

/** Get aggregated win rate for a single deck */
export async function getDeckWinRate(
  deckId: number
): Promise<{ wins: number; losses: number; total: number; winRate: number }> {
  const sb = getSupabase();
  if (!sb) return { wins: 0, losses: 0, total: 0, winRate: 0 };
  const { data, error } = await sb
    .from("deck_match_results")
    .select("result")
    .eq("deck_id", deckId);
  if (error || !data) return { wins: 0, losses: 0, total: 0, winRate: 0 };
  const wins = data.filter((r: any) => r.result === "win").length;
  const losses = data.filter((r: any) => r.result === "loss").length;
  const total = wins + losses;
  return { wins, losses, total, winRate: total > 0 ? Math.round((wins / total) * 100) : 0 };
}

/** Get win rates for multiple decks at once (batch, for list page) */
export async function batchDeckWinRates(
  deckIds: number[]
): Promise<Record<number, { wins: number; losses: number; total: number; winRate: number }>> {
  const sb = getSupabase();
  if (!sb || deckIds.length === 0) return {};
  const { data, error } = await sb
    .from("deck_match_results")
    .select("deck_id, result")
    .in("deck_id", deckIds);
  if (error || !data) return {};
  const result: Record<number, { wins: number; losses: number; total: number; winRate: number }> = {};
  for (const row of data) {
    if (!result[row.deck_id]) result[row.deck_id] = { wins: 0, losses: 0, total: 0, winRate: 0 };
    if (row.result === "win") result[row.deck_id].wins++;
    else result[row.deck_id].losses++;
    result[row.deck_id].total++;
  }
  for (const id of Object.keys(result)) {
    const r = result[Number(id)];
    r.winRate = r.total > 0 ? Math.round((r.wins / r.total) * 100) : 0;
  }
  return result;
}

/** Get a player's recent match history with a specific deck */
export async function getPlayerDeckHistory(
  deckId: number,
  playerId: string,
  limit = 20
): Promise<DeckMatchResult[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("deck_match_results")
    .select("*")
    .eq("deck_id", deckId)
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(mapMatchResult);
}

// ─── Player Profile ──────────────────────────────────────────

export interface PlayerProfile {
  playerId: string;
  gamertag: string | null;
  joinedAt: Date;
  decksPublished: number;
  totalLikesReceived: number;
  matchesPlayed: number;
  matchesWon: number;
  overallWinRate: number;
}

/** Get a player's full profile with aggregated stats */
export async function getPlayerProfile(playerId: string): Promise<PlayerProfile | null> {
  const sb = getSupabase();
  if (!sb) return null;

  // Get player record
  const { data: player, error: playerErr } = await sb
    .from("players")
    .select("id, gamertag, created_at")
    .eq("id", playerId)
    .single();
  if (playerErr || !player) return null;

  // Count published decks
  const { count: decksPublished } = await sb
    .from("community_decks")
    .select("id", { count: "exact", head: true })
    .eq("player_id", playerId);

  // Sum total likes across all published decks
  const { data: deckLikes } = await sb
    .from("community_decks")
    .select("likes")
    .eq("player_id", playerId);
  const totalLikesReceived = (deckLikes || []).reduce((sum: number, d: any) => sum + (d.likes || 0), 0);

  // Count matches played and won
  const { data: matchResults } = await sb
    .from("deck_match_results")
    .select("result")
    .eq("player_id", playerId);
  const matchesPlayed = matchResults?.length || 0;
  const matchesWon = (matchResults || []).filter((r: any) => r.result === "win").length;
  const overallWinRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;

  return {
    playerId: player.id,
    gamertag: player.gamertag || null,
    joinedAt: new Date(player.created_at),
    decksPublished: decksPublished ?? 0,
    totalLikesReceived,
    matchesPlayed,
    matchesWon,
    overallWinRate,
  };
}

/** Get a player's recent match history across all their decks */
export async function getPlayerAllMatchHistory(
  playerId: string,
  limit = 30
): Promise<(DeckMatchResult & { deckName?: string; faction?: string })[]> {
  const sb = getSupabase();
  if (!sb) return [];

  // Get recent match results
  const { data: results, error } = await sb
    .from("deck_match_results")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !results) return [];

  // Get deck names for context
  const deckIds = Array.from(new Set(results.map((r: any) => r.deck_id)));
  const { data: decks } = await sb
    .from("community_decks")
    .select("id, deck_name, faction")
    .in("id", deckIds);
  const deckMap = new Map((decks || []).map((d: any) => [d.id, { name: d.deck_name, faction: d.faction }]));

  return results.map((row: any) => {
    const deck = deckMap.get(row.deck_id);
    return {
      ...mapMatchResult(row),
      deckName: deck?.name || "Unknown Deck",
      faction: deck?.faction || "unknown",
    };
  });
}

/** Look up a player by gamertag (for profile URL routing) */
export async function getPlayerByGamertag(gamertag: string): Promise<{ id: string; gamertag: string } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("players")
    .select("id, gamertag")
    .eq("gamertag", gamertag)
    .single();
  if (error || !data) return null;
  return { id: data.id, gamertag: data.gamertag };
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
