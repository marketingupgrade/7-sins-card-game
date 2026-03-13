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
