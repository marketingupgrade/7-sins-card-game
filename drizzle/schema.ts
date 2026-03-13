import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Discussion comments for the Balance Analysis page.
 *
 * Supports threaded replies via parentId (self-referencing FK).
 * Each comment is tied to a page context (e.g. "balance") and optionally
 * to a specific section within that page.
 *
 * Guest comments use guestName + guestId (client-generated UUID stored in localStorage).
 * Authenticated comments use userId (FK to users table).
 */
export const discussionComments = mysqlTable("discussion_comments", {
  id: int("id").autoincrement().primaryKey(),
  /** Page context — which page this comment belongs to (e.g. "balance", "matchups") */
  pageContext: varchar("pageContext", { length: 64 }).notNull().default("balance"),
  /** Optional section anchor within the page (e.g. "passives", "methodology") */
  section: varchar("section", { length: 64 }),
  /** Self-referencing parent ID for threaded replies. NULL = top-level comment. */
  parentId: int("parentId"),
  /** FK to users.id — NULL for guest comments */
  userId: int("userId"),
  /** Display name for the commenter (guest or authenticated) */
  authorName: varchar("authorName", { length: 100 }).notNull(),
  /** Client-generated guest identifier (UUID in localStorage) for guest rate-limiting */
  guestId: varchar("guestId", { length: 64 }),
  /** The comment body (plain text, max ~2000 chars) */
  content: text("content").notNull(),
  /** Upvote count for community sorting */
  upvotes: int("upvotes").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiscussionComment = typeof discussionComments.$inferSelect;
export type InsertDiscussionComment = typeof discussionComments.$inferInsert;

/**
 * Player-built custom decks.
 *
 * Each deck belongs to a single faction and contains exactly 30 card IDs
 * selected from that faction's 54-card pool. Players can save multiple
 * decks per faction.
 *
 * Auth: Uses Supabase Auth UUID as the owner identifier.
 * Guest players use localStorage instead (no DB row).
 *
 * cardIds is stored as a JSON-serialized array of card ID strings,
 * e.g. '["wrath_1","wrath_3","wrath_7",...]'
 */
export const playerDecks = mysqlTable("player_decks", {
  id: int("id").autoincrement().primaryKey(),
  /** Supabase Auth user UUID — owner of this deck */
  supabaseUserId: varchar("supabaseUserId", { length: 64 }).notNull(),
  /** Faction this deck belongs to (e.g. "Wrath", "Sloth") */
  faction: varchar("faction", { length: 32 }).notNull(),
  /** Player-chosen deck name (e.g. "Burn Rush", "Control Wrath") */
  name: varchar("name", { length: 100 }).notNull(),
  /** JSON array of 30 card IDs from the faction's pool */
  cardIds: text("cardIds").notNull(),
  /** Whether this is the player's active/default deck for this faction */
  isActive: int("isActive").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerDeck = typeof playerDecks.$inferSelect;
export type InsertPlayerDeck = typeof playerDecks.$inferInsert;
