import { eq, desc, asc, isNull, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, discussionComments, InsertDiscussionComment, DiscussionComment, playerDecks, PlayerDeck, InsertPlayerDeck } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Discussion Comments ────────────────────────────────────

/**
 * Fetch all comments for a given page context, ordered by newest first.
 * Returns flat array — threading is handled client-side via parentId.
 */
export async function getDiscussionComments(pageContext: string): Promise<DiscussionComment[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(discussionComments)
    .where(eq(discussionComments.pageContext, pageContext))
    .orderBy(asc(discussionComments.createdAt));
}

/**
 * Create a new discussion comment (top-level or reply).
 * Returns the inserted comment's ID.
 */
export async function createDiscussionComment(
  data: Omit<InsertDiscussionComment, "id" | "createdAt" | "updatedAt" | "upvotes">
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(discussionComments).values({
    ...data,
    upvotes: 0,
  });

  return { id: Number(result[0].insertId) };
}

/**
 * Delete a discussion comment by ID.
 * Only the comment author (matched by userId or guestId) or an admin can delete.
 */
export async function deleteDiscussionComment(commentId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(discussionComments).where(eq(discussionComments.id, commentId));
  // Also delete child replies
  await db.delete(discussionComments).where(eq(discussionComments.parentId, commentId));
  return true;
}

/**
 * Upvote a discussion comment. Increments the upvote counter by 1.
 */
export async function upvoteDiscussionComment(commentId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(discussionComments)
    .set({ upvotes: sql`${discussionComments.upvotes} + 1` })
    .where(eq(discussionComments.id, commentId));
  return true;
}

// ─── Player Decks ──────────────────────────────────────────

/**
 * Fetch all decks belonging to a Supabase user, newest first.
 */
export async function getDecksByUser(supabaseUserId: string): Promise<PlayerDeck[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(playerDecks)
    .where(eq(playerDecks.supabaseUserId, supabaseUserId))
    .orderBy(desc(playerDecks.updatedAt));
}

/**
 * Fetch a single deck by ID. Returns undefined if not found.
 */
export async function getDeckById(deckId: number): Promise<PlayerDeck | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(playerDecks).where(eq(playerDecks.id, deckId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new deck. Returns the inserted deck's ID.
 */
export async function createDeck(
  data: Omit<InsertPlayerDeck, "id" | "createdAt" | "updatedAt">
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playerDecks).values(data);
  return { id: Number(result[0].insertId) };
}

/**
 * Update an existing deck's name, cardIds, or isActive status.
 */
export async function updateDeck(
  deckId: number,
  data: Partial<Pick<InsertPlayerDeck, "name" | "cardIds" | "isActive">>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.update(playerDecks).set(data).where(eq(playerDecks.id, deckId));
  return true;
}

/**
 * Delete a deck by ID.
 */
export async function deleteDeck(deckId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(playerDecks).where(eq(playerDecks.id, deckId));
  return true;
}

/**
 * Set a deck as active for a user+faction combo.
 * Deactivates all other decks for the same user+faction first.
 */
export async function setActiveDeck(supabaseUserId: string, faction: string, deckId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Deactivate all decks for this user+faction
  await db
    .update(playerDecks)
    .set({ isActive: 0 })
    .where(and(eq(playerDecks.supabaseUserId, supabaseUserId), eq(playerDecks.faction, faction)));

  // Activate the chosen deck
  await db.update(playerDecks).set({ isActive: 1 }).where(eq(playerDecks.id, deckId));
  return true;
}

/**
 * Delete ALL data associated with a Supabase user.
 * GDPR right to erasure — cascading delete across:
 * - player_decks (custom decks)
 * - discussion_comments (by guestId matching supabaseUserId)
 *
 * Returns counts of deleted rows per table.
 */
export async function deleteAllUserData(supabaseUserId: string): Promise<{
  decksDeleted: number;
  commentsDeleted: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all decks
  const deckResult = await db
    .delete(playerDecks)
    .where(eq(playerDecks.supabaseUserId, supabaseUserId));
  const decksDeleted = (deckResult as any)[0]?.affectedRows ?? 0;

  // Delete all comments by this user (using guestId which stores supabase user ID)
  const commentResult = await db
    .delete(discussionComments)
    .where(eq(discussionComments.guestId, supabaseUserId));
  const commentsDeleted = (commentResult as any)[0]?.affectedRows ?? 0;

  return { decksDeleted, commentsDeleted };
}
