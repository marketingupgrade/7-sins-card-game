// api/_source.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, desc, asc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var discussionComments = mysqlTable("discussion_comments", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var playerDecks = mysqlTable("player_decks", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  /** URL-friendly slug (e.g. "how-to-play-7-deadly-sins") */
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  /** Post title */
  title: varchar("title", { length: 300 }).notNull(),
  /** SEO meta description */
  metaDescription: varchar("metaDescription", { length: 320 }).notNull(),
  /** Target keywords (comma-separated) */
  keywords: text("keywords").notNull(),
  /** Blog category slug (e.g. "game-guides", "comparisons") */
  category: varchar("category", { length: 64 }).notNull(),
  /** SEO priority: high, medium, low */
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium").notNull(),
  /** Full HTML content of the blog post */
  content: text("content").notNull(),
  /** Featured image URL (card art from the game) */
  featuredImage: varchar("featuredImage", { length: 500 }),
  /** Estimated reading time in minutes */
  readingTime: int("readingTime").notNull().default(5),
  /** Whether the post is published */
  published: int("published").notNull().default(1),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getDiscussionComments(pageContext) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discussionComments).where(eq(discussionComments.pageContext, pageContext)).orderBy(asc(discussionComments.createdAt));
}
async function createDiscussionComment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(discussionComments).values({
    ...data,
    upvotes: 0
  });
  return { id: Number(result[0].insertId) };
}
async function deleteDiscussionComment(commentId) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(discussionComments).where(eq(discussionComments.id, commentId));
  await db.delete(discussionComments).where(eq(discussionComments.parentId, commentId));
  return true;
}
async function upvoteDiscussionComment(commentId) {
  const db = await getDb();
  if (!db) return false;
  await db.update(discussionComments).set({ upvotes: sql`${discussionComments.upvotes} + 1` }).where(eq(discussionComments.id, commentId));
  return true;
}
async function getDecksByUser(supabaseUserId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(playerDecks).where(eq(playerDecks.supabaseUserId, supabaseUserId)).orderBy(desc(playerDecks.updatedAt));
}
async function getDeckById(deckId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(playerDecks).where(eq(playerDecks.id, deckId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createDeck(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(playerDecks).values(data);
  return { id: Number(result[0].insertId) };
}
async function updateDeck(deckId, data) {
  const db = await getDb();
  if (!db) return false;
  await db.update(playerDecks).set(data).where(eq(playerDecks.id, deckId));
  return true;
}
async function deleteDeck(deckId) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(playerDecks).where(eq(playerDecks.id, deckId));
  return true;
}
async function setActiveDeck(supabaseUserId, faction, deckId) {
  const db = await getDb();
  if (!db) return false;
  await db.update(playerDecks).set({ isActive: 0 }).where(and(eq(playerDecks.supabaseUserId, supabaseUserId), eq(playerDecks.faction, faction)));
  await db.update(playerDecks).set({ isActive: 1 }).where(eq(playerDecks.id, deckId));
  return true;
}
async function getBlogPosts(opts) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;
  const conditions = [eq(blogPosts.published, 1)];
  if (opts.category) {
    conditions.push(eq(blogPosts.category, opts.category));
  }
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      sql`(${blogPosts.title} LIKE ${term} OR ${blogPosts.metaDescription} LIKE ${term} OR ${blogPosts.keywords} LIKE ${term})`
    );
  }
  const where = conditions.length === 1 ? conditions[0] : and(...conditions);
  const [posts, countResult] = await Promise.all([
    db.select().from(blogPosts).where(where).orderBy(desc(blogPosts.publishedAt)).limit(limit).offset(offset),
    db.select({ count: sql`count(*)` }).from(blogPosts).where(where)
  ]);
  return { posts, total: Number(countResult[0]?.count ?? 0) };
}
async function getBlogPostBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(blogPosts).where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, 1))).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getRelatedPosts(category, excludeSlug, limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).where(and(
    eq(blogPosts.category, category),
    eq(blogPosts.published, 1),
    sql`${blogPosts.slug} != ${excludeSlug}`
  )).orderBy(sql`RAND()`).limit(limit);
}
async function getAllBlogSlugs() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(eq(blogPosts.published, 1)).orderBy(desc(blogPosts.publishedAt));
}
async function getRecentBlogPosts(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).where(eq(blogPosts.published, 1)).orderBy(desc(blogPosts.publishedAt)).limit(limit);
}
async function getBlogCategoryCounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    category: blogPosts.category,
    count: sql`count(*)`
  }).from(blogPosts).where(eq(blogPosts.published, 1)).groupBy(blogPosts.category).orderBy(sql`count(*) DESC`);
}
async function deleteAllUserData(supabaseUserId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const deckResult = await db.delete(playerDecks).where(eq(playerDecks.supabaseUserId, supabaseUserId));
  const decksDeleted = deckResult[0]?.affectedRows ?? 0;
  const commentResult = await db.delete(discussionComments).where(eq(discussionComments.guestId, supabaseUserId));
  const commentsDeleted = commentResult[0]?.affectedRows ?? 0;
  return { decksDeleted, commentsDeleted };
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/chat.ts
import { streamText, stepCountIs } from "ai";
import { tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod/v4";

// server/_core/patchedFetch.ts
function createPatchedFetch(originalFetch) {
  return async (input, init) => {
    const response = await originalFetch(input, init);
    if (!response.body) return response;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";
    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer.length > 0) {
              const fixed = buffer.replace(/"type":""/g, '"type":"function"');
              controller.enqueue(encoder.encode(fixed));
            }
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const eventSeparator = "\n\n";
          let separatorIndex;
          while ((separatorIndex = buffer.indexOf(eventSeparator)) !== -1) {
            const completeEvent = buffer.slice(
              0,
              separatorIndex + eventSeparator.length
            );
            buffer = buffer.slice(separatorIndex + eventSeparator.length);
            const fixedEvent = completeEvent.replace(
              /"type":""/g,
              '"type":"function"'
            );
            controller.enqueue(encoder.encode(fixedEvent));
          }
        } catch (error) {
          controller.error(error);
        }
      }
    });
    return new Response(stream, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    });
  };
}

// server/_core/chat.ts
function createLLMProvider() {
  const baseURL = ENV.forgeApiUrl.endsWith("/v1") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/v1`;
  return createOpenAI({
    baseURL,
    apiKey: ENV.forgeApiKey,
    fetch: createPatchedFetch(fetch)
  });
}
var tools = {
  getWeather: tool({
    description: "Get the current weather for a location",
    inputSchema: z.object({
      location: z.string().describe("The city and country, e.g. 'Tokyo, Japan'"),
      unit: z.enum(["celsius", "fahrenheit"]).optional().default("celsius")
    }),
    execute: async ({ location, unit }) => {
      const temp = Math.floor(Math.random() * 30) + 5;
      const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"][Math.floor(Math.random() * 4)];
      return {
        location,
        temperature: unit === "fahrenheit" ? Math.round(temp * 1.8 + 32) : temp,
        unit,
        conditions,
        humidity: Math.floor(Math.random() * 50) + 30
      };
    }
  }),
  calculate: tool({
    description: "Perform a mathematical calculation",
    inputSchema: z.object({
      expression: z.string().describe("The math expression to evaluate, e.g. '2 + 2'")
    }),
    execute: async ({ expression }) => {
      try {
        const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
        const result = Function(
          `"use strict"; return (${sanitized})`
        )();
        return { expression, result };
      } catch {
        return { expression, error: "Invalid expression" };
      }
    }
  })
};
function registerChatRoutes(app2) {
  const openai = createLLMProvider();
  app2.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }
      const result = streamText({
        model: openai.chat("gpt-4o"),
        system: "You are a helpful assistant. You have access to tools for getting weather and doing calculations. Use them when appropriate.",
        messages,
        tools,
        stopWhen: stepCountIs(5)
      });
      result.pipeUIMessageStreamToResponse(res);
    } catch (error) {
      console.error("[/api/chat] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}

// server/routers.ts
import { z as z3 } from "zod";

// server/_core/systemRouter.ts
import { z as z2 } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z2.object({
      timestamp: z2.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z2.object({
      title: z2.string().min(1, "title is required"),
      content: z2.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// shared/cardData.ts
var WRATH_CARDS = [
  {
    id: "wrath_01",
    name: "Fury Swipe",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_02",
    name: "Burning Fists",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 4, duration: 2, targetMode: "self" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_03",
    name: "Rage Pulse",
    sin: "wrath",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_04",
    name: "Blood Offering",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "self_damage", baseValue: 7, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_05",
    name: "Ember Slash",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 12, duration: 2, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_06",
    name: "Searing Touch",
    sin: "wrath",
    cost: 0,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 9, duration: 4, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_07",
    name: "Wrathful Cry",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_08",
    name: "Scorch Mark",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 5, duration: 3, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_09",
    name: "Flame Jab",
    sin: "wrath",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_10",
    name: "Provoke",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 5, duration: 2, targetMode: "self" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_11",
    name: "Reckless Charge",
    sin: "wrath",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 16, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 5, duration: 2, targetMode: "self" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_12",
    name: "Smoldering Rage",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_13",
    name: "Firebrand",
    sin: "wrath",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "duo" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_14",
    name: "Ignite",
    sin: "wrath",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 5, duration: 3, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_15",
    name: "Temper Flare",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }, { type: "damage", baseValue: 9, duration: 2, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_16",
    name: "Bloodlust",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "self_damage", baseValue: 4, duration: 1, targetMode: "self" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_17",
    name: "Cauterize",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "self_damage", baseValue: 5, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 9, duration: 3, targetMode: "self" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_18",
    name: "War Cry",
    sin: "wrath",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_19",
    name: "Kindle",
    sin: "wrath",
    cost: 0,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 5, duration: 4, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_20",
    name: "Fury Spike",
    sin: "wrath",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }],
    description: "A common wrath card"
  },
  {
    id: "wrath_21",
    name: "Berserker Rage",
    sin: "wrath",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 21, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 7, duration: 2, targetMode: "self" }, { type: "shield_gain", baseValue: 9, duration: 2, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_22",
    name: "Inferno Wave",
    sin: "wrath",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 5, duration: 2, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_23",
    name: "Blood Pact",
    sin: "wrath",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "self_damage", baseValue: 9, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 24, duration: 3, targetMode: "single" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_24",
    name: "Volcanic Eruption",
    sin: "wrath",
    cost: 4,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 7, duration: 2, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_25",
    name: "Retribution",
    sin: "wrath",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 16, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 11, duration: 3, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_26",
    name: "Immolation",
    sin: "wrath",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "self_damage", baseValue: 11, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 13, duration: 3, targetMode: "aoe" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_27",
    name: "Wrath Unleashed",
    sin: "wrath",
    cost: 3,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_28",
    name: "Scorched Earth",
    sin: "wrath",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_29",
    name: "Fury Storm",
    sin: "wrath",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 16, duration: 4, targetMode: "duo" }, { type: "self_damage", baseValue: 5, duration: 2, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_30",
    name: "Berserk Slash",
    sin: "wrath",
    cost: 2,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 9, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_31",
    name: "Magma Surge",
    sin: "wrath",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 11, duration: 5, targetMode: "duo" }, { type: "shield_gain", baseValue: 7, duration: 2, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_32",
    name: "Burning Vengeance",
    sin: "wrath",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 7, duration: 2, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_33",
    name: "Firestorm",
    sin: "wrath",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_34",
    name: "Rage Incarnate",
    sin: "wrath",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 19, duration: 4, targetMode: "single" }, { type: "self_damage", baseValue: 7, duration: 3, targetMode: "self" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_35",
    name: "Flame Barrier",
    sin: "wrath",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 13, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 9, duration: 2, targetMode: "single" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_36",
    name: "Pyroclasm",
    sin: "wrath",
    cost: 3,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 5, duration: 2, targetMode: "single" }],
    description: "A rare wrath card"
  },
  {
    id: "wrath_37",
    name: "Molten Core",
    sin: "wrath",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "self_damage", baseValue: 5, duration: 4, targetMode: "self" }, { type: "damage", baseValue: 12, duration: 4, targetMode: "single" }, { type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }],
    description: "The molten core within erupts, burning all in its path"
  },
  {
    id: "wrath_38",
    name: "Hellfire Rush",
    sin: "wrath",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "duo" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A hellfire rush that scorches two foes at once"
  },
  {
    id: "wrath_39",
    name: "Apocalypse Fist",
    sin: "wrath",
    cost: 5,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 16, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 11, duration: 2, targetMode: "self" }, { type: "affliction_amplify", baseValue: 7, duration: 2, targetMode: "aoe" }],
    description: "An apocalyptic fist that shatters everything"
  },
  {
    id: "wrath_40",
    name: "Ragnarok",
    sin: "wrath",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 24, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 9, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "Volcanic eruption of pure concentrated rage"
  },
  {
    id: "wrath_41",
    name: "Phoenix Rebirth",
    sin: "wrath",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "self_damage", baseValue: 13, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 21, duration: 4, targetMode: "self" }, { type: "damage", baseValue: 21, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 11, duration: 2, targetMode: "self" }],
    description: "The berserker's final gambit \u2014 all or nothing"
  },
  {
    id: "wrath_42",
    name: "Supernova",
    sin: "wrath",
    cost: 6,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 9, duration: 2, targetMode: "self" }, { type: "shield_steal", baseValue: 7, duration: 2, targetMode: "aoe" }],
    description: "Fury made manifest, tearing through defenses"
  },
  {
    id: "wrath_43",
    name: "Blood Nova",
    sin: "wrath",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 21, duration: 4, targetMode: "duo" }, { type: "self_damage", baseValue: 11, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 13, duration: 3, targetMode: "self" }],
    description: "A storm of blades fueled by bottomless anger"
  },
  {
    id: "wrath_44",
    name: "Infernal Judgment",
    sin: "wrath",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 19, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 9, duration: 2, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Wrath's echo reverberates through every wound"
  },
  {
    id: "wrath_45",
    name: "Cataclysm",
    sin: "wrath",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 13, duration: 5, targetMode: "aoe" }, { type: "self_damage", baseValue: 7, duration: 3, targetMode: "self" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "The inferno within consumes friend and foe alike"
  },
  {
    id: "wrath_46",
    name: "Wrath of God",
    sin: "wrath",
    cost: 6,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 21, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 12, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "A cataclysmic strike born from suffering"
  },
  {
    id: "wrath_47",
    name: "Hellstorm",
    sin: "wrath",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 16, duration: 4, targetMode: "aoe" }, { type: "shield_gain", baseValue: 13, duration: 3, targetMode: "self" }, { type: "self_damage", baseValue: 9, duration: 3, targetMode: "self" }],
    description: "Rage crystallized into devastating force"
  },
  {
    id: "wrath_48",
    name: "Undying Fury",
    sin: "wrath",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 22, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 9, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 11, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "The fury of a thousand battles compressed into one blow"
  },
  {
    id: "wrath_49",
    name: "Armageddon",
    sin: "wrath",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 19, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 11, duration: 3, targetMode: "self" }, { type: "affliction_amplify", baseValue: 5, duration: 3, targetMode: "aoe" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "aoe" }],
    description: "Unstoppable momentum fueled by pure hatred"
  },
  {
    id: "wrath_50",
    name: "Last Stand",
    sin: "wrath",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "self_damage", baseValue: 13, duration: 2, targetMode: "self" }, { type: "damage", baseValue: 26, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 16, duration: 2, targetMode: "self" }],
    description: "The final expression of wrath \u2014 total annihilation"
  },
  // ── Skip-Queue (Priority) Cards ──
  {
    id: "wrath_51",
    name: "Flash Rage",
    sin: "wrath",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 2, targetMode: "single" }],
    description: "Strike before they see it coming \u2014 pure fury, no delay.",
    skipQueue: true
  },
  {
    id: "wrath_52",
    name: "Retribution Spike",
    sin: "wrath",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 12, duration: 2, targetMode: "single" }, { type: "self_damage", baseValue: 5, duration: 1, targetMode: "self" }],
    description: "Pain dealt before pain received. The wrathful always strike first.",
    skipQueue: true
  },
  {
    id: "wrath_53",
    name: "Berserker's Reflex",
    sin: "wrath",
    cost: 0,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }],
    description: "Instinct, not thought. The body moves before the mind.",
    skipQueue: true
  },
  {
    id: "wrath_54",
    name: "Preemptive Fury",
    sin: "wrath",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
    description: "Attack is the best defense \u2014 but a little armor doesn't hurt.",
    skipQueue: true
  }
];
var SLOTH_CARDS = [
  {
    id: "sloth_01",
    name: "Lazy Swipe",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_02",
    name: "Drowsy Guard",
    sin: "sloth",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_03",
    name: "Yawn",
    sin: "sloth",
    cost: 0,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_04",
    name: "Nap Time",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_05",
    name: "Sluggish Blow",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_06",
    name: "Hibernate",
    sin: "sloth",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_07",
    name: "Torpor",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_08",
    name: "Heavy Eyelids",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_09",
    name: "Snooze",
    sin: "sloth",
    cost: 0,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "heal_gain", baseValue: 3, duration: 4, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_10",
    name: "Lethargic Pulse",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_11",
    name: "Doze Off",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_12",
    name: "Slow Roll",
    sin: "sloth",
    cost: 2,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_13",
    name: "Pillow Fort",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_14",
    name: "Rest",
    sin: "sloth",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 3, duration: 2, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_15",
    name: "Drag Feet",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 2, duration: 4, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_16",
    name: "Cozy Blanket",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 4, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_17",
    name: "Idle Hands",
    sin: "sloth",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_18",
    name: "Procrastinate",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 4, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_19",
    name: "Dull Ache",
    sin: "sloth",
    cost: 2,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_20",
    name: "Slumber Ward",
    sin: "sloth",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common sloth card"
  },
  {
    id: "sloth_21",
    name: "Deep Slumber",
    sin: "sloth",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "heal_gain", baseValue: 5, duration: 5, targetMode: "self" }, { type: "shield_gain", baseValue: 4, duration: 4, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_22",
    name: "Comatose",
    sin: "sloth",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_23",
    name: "Narcolepsy",
    sin: "sloth",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_24",
    name: "Quicksand",
    sin: "sloth",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "duo" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_25",
    name: "Stonewall",
    sin: "sloth",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 6, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 3, duration: 2, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_26",
    name: "Entropy",
    sin: "sloth",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_27",
    name: "Feign Death",
    sin: "sloth",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 8, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_28",
    name: "Soporific Mist",
    sin: "sloth",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_29",
    name: "Glacial Pace",
    sin: "sloth",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }, { type: "shield_gain", baseValue: 3, duration: 4, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_30",
    name: "Dreamcatcher",
    sin: "sloth",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 5, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_31",
    name: "Sedation",
    sin: "sloth",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_32",
    name: "Inertia",
    sin: "sloth",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 5, duration: 5, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_33",
    name: "Fortress of Sloth",
    sin: "sloth",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 8, duration: 4, targetMode: "self" }, { type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_34",
    name: "Slow Decay",
    sin: "sloth",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "heal_gain", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_35",
    name: "Stasis Field",
    sin: "sloth",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }, { type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_36",
    name: "Tranquility",
    sin: "sloth",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 5, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare sloth card"
  },
  {
    id: "sloth_37",
    name: "Sandman's Touch",
    sin: "sloth",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Lethargy spreads like a contagion through the battlefield"
  },
  {
    id: "sloth_38",
    name: "Eternal Rest",
    sin: "sloth",
    cost: 4,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "heal_gain", baseValue: 4, duration: 5, targetMode: "self" }, { type: "shield_gain", baseValue: 5, duration: 5, targetMode: "self" }],
    description: "The weight of inaction crushes all ambition"
  },
  {
    id: "sloth_39",
    name: "Absolute Zero",
    sin: "sloth",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "shield_gain", baseValue: 6, duration: 4, targetMode: "self" }],
    description: "A yawn so powerful it drains the will to fight"
  },
  {
    id: "sloth_40",
    name: "Cryogenic Sleep",
    sin: "sloth",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "heal_gain", baseValue: 6, duration: 5, targetMode: "self" }, { type: "shield_gain", baseValue: 8, duration: 5, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "Entropy accelerates \u2014 everything slows to a crawl"
  },
  {
    id: "sloth_41",
    name: "Time Stop",
    sin: "sloth",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 6, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "The comfort of stagnation becomes a fortress"
  },
  {
    id: "sloth_42",
    name: "Eternal Slumber",
    sin: "sloth",
    cost: 6,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 5, duration: 5, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 5, targetMode: "aoe" }, { type: "heal_gain", baseValue: 5, duration: 4, targetMode: "self" }],
    description: "Apathy weaponized into a defensive cocoon"
  },
  {
    id: "sloth_43",
    name: "Impenetrable Wall",
    sin: "sloth",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 10, duration: 4, targetMode: "self" }, { type: "heal_gain", baseValue: 5, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "Time itself seems to slow around the slothful"
  },
  {
    id: "sloth_44",
    name: "Suspended Animation",
    sin: "sloth",
    cost: 4,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "shield_gain", baseValue: 6, duration: 5, targetMode: "self" }, { type: "heal_gain", baseValue: 4, duration: 5, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 4, targetMode: "self" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "A torpor so deep it becomes impenetrable armor"
  },
  {
    id: "sloth_45",
    name: "Gravity Well",
    sin: "sloth",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 5, duration: 4, targetMode: "self" }],
    description: "The lazy path proves the most efficient"
  },
  {
    id: "sloth_46",
    name: "Oblivion",
    sin: "sloth",
    cost: 6,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 5, targetMode: "aoe" }, { type: "damage", baseValue: 5, duration: 5, targetMode: "aoe" }, { type: "shield_gain", baseValue: 8, duration: 4, targetMode: "self" }, { type: "energy_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "Inertia becomes an unstoppable force"
  },
  {
    id: "sloth_47",
    name: "Cocoon",
    sin: "sloth",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 9, duration: 4, targetMode: "self" }, { type: "heal_gain", baseValue: 6, duration: 4, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Rest becomes a weapon more potent than any blade"
  },
  {
    id: "sloth_48",
    name: "Petrify",
    sin: "sloth",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 5, targetMode: "single" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }],
    description: "The ultimate expression of doing absolutely nothing"
  },
  {
    id: "sloth_49",
    name: "Dormant Power",
    sin: "sloth",
    cost: 4,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "shield_gain", baseValue: 6, duration: 5, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "Procrastination elevated to an art form of survival"
  },
  {
    id: "sloth_50",
    name: "Nirvana",
    sin: "sloth",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 8, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 8, duration: 4, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "In stillness, true power is conserved"
  },
  // ── Skip-Queue (Priority) Cards ──
  {
    id: "sloth_51",
    name: "Drowsy Ward",
    sin: "sloth",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 8, duration: 3, targetMode: "self" }],
    description: "A lazy barrier that somehow blocks everything.",
    skipQueue: true
  },
  {
    id: "sloth_52",
    name: "Yawning Hex",
    sin: "sloth",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 5, duration: 2, targetMode: "self" }],
    description: "Your yawn is contagious \u2014 and draining.",
    skipQueue: true
  },
  {
    id: "sloth_53",
    name: "Torpor Snap",
    sin: "sloth",
    cost: 0,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A flick of lethargy that dulls the mind before battle begins.",
    skipQueue: true
  },
  {
    id: "sloth_54",
    name: "Idle Absorption",
    sin: "sloth",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 6, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Do nothing, gain everything. The slothful way.",
    skipQueue: true
  }
];
var GREED_CARDS = [
  {
    id: "greed_01",
    name: "Coin Toss",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_02",
    name: "Pickpocket",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_03",
    name: "Toll Collector",
    sin: "greed",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_04",
    name: "Interest",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_05",
    name: "Skim Off Top",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_06",
    name: "Gold Rush",
    sin: "greed",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "A common greed card"
  },
  {
    id: "greed_07",
    name: "Embezzle",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_steal", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_08",
    name: "Tax Levy",
    sin: "greed",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_09",
    name: "Counterfeit",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 6, duration: 3, targetMode: "self" }],
    description: "A common greed card"
  },
  {
    id: "greed_10",
    name: "Loan Shark",
    sin: "greed",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }],
    description: "A common greed card"
  },
  {
    id: "greed_11",
    name: "Penny Pinch",
    sin: "greed",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common greed card"
  },
  {
    id: "greed_12",
    name: "Swindle",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 6, duration: 2, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_13",
    name: "Hoard",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common greed card"
  },
  {
    id: "greed_14",
    name: "Usury",
    sin: "greed",
    cost: 2,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 6, duration: 5, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_15",
    name: "Bribe",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_16",
    name: "Extort",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_17",
    name: "Miser's Touch",
    sin: "greed",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
    description: "A common greed card"
  },
  {
    id: "greed_18",
    name: "Fleece",
    sin: "greed",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_19",
    name: "Compound Interest",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
    description: "A common greed card"
  },
  {
    id: "greed_20",
    name: "Treasure Hunt",
    sin: "greed",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common greed card"
  },
  {
    id: "greed_21",
    name: "Hostile Takeover",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 4, duration: 2, targetMode: "single" }],
    description: "A rare greed card"
  },
  {
    id: "greed_22",
    name: "Ponzi Scheme",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 6, duration: 5, targetMode: "duo" }, { type: "heal_steal", baseValue: 4, duration: 3, targetMode: "duo" }],
    description: "A rare greed card"
  },
  {
    id: "greed_23",
    name: "Golden Parachute",
    sin: "greed",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 10, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "A rare greed card"
  },
  {
    id: "greed_24",
    name: "Market Crash",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 6, duration: 3, targetMode: "aoe" }],
    description: "A rare greed card"
  },
  {
    id: "greed_25",
    name: "Insider Trading",
    sin: "greed",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 8, duration: 3, targetMode: "single" }],
    description: "A rare greed card"
  },
  {
    id: "greed_26",
    name: "Bankruptcy",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "energy_steal", baseValue: 2, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 10, duration: 3, targetMode: "single" }],
    description: "A rare greed card"
  },
  {
    id: "greed_27",
    name: "Monopoly",
    sin: "greed",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "A rare greed card"
  },
  {
    id: "greed_28",
    name: "Hedge Fund",
    sin: "greed",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 6, duration: 5, targetMode: "single" }, { type: "shield_gain", baseValue: 6, duration: 4, targetMode: "self" }],
    description: "A rare greed card"
  },
  {
    id: "greed_29",
    name: "Leverage",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 4, duration: 2, targetMode: "self" }],
    description: "A rare greed card"
  },
  {
    id: "greed_30",
    name: "Asset Strip",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_steal", baseValue: 7, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 6, duration: 3, targetMode: "single" }],
    description: "A rare greed card"
  },
  {
    id: "greed_31",
    name: "Inflation",
    sin: "greed",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare greed card"
  },
  {
    id: "greed_32",
    name: "Audit",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
    description: "A rare greed card"
  },
  {
    id: "greed_33",
    name: "Black Market",
    sin: "greed",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare greed card"
  },
  {
    id: "greed_34",
    name: "Venture Capital",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 4, targetMode: "self" }],
    description: "A rare greed card"
  },
  {
    id: "greed_35",
    name: "Foreclosure",
    sin: "greed",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 6, duration: 2, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare greed card"
  },
  {
    id: "greed_36",
    name: "Debt Collector",
    sin: "greed",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 4, duration: 2, targetMode: "single" }],
    description: "A rare greed card"
  },
  {
    id: "greed_37",
    name: "Offshore Account",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 13, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Every coin stolen fuels the next heist"
  },
  {
    id: "greed_38",
    name: "Pyramid Scheme",
    sin: "greed",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "The taxman cometh, and he takes everything"
  },
  {
    id: "greed_39",
    name: "Wealth of Nations",
    sin: "greed",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 10, duration: 3, targetMode: "self" }],
    description: "A golden cage that traps and drains simultaneously"
  },
  {
    id: "greed_40",
    name: "Golden Age",
    sin: "greed",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 6, duration: 4, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 4, targetMode: "self" }],
    description: "Avarice knows no bounds \u2014 take it all"
  },
  {
    id: "greed_41",
    name: "Total Liquidation",
    sin: "greed",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 2, duration: 2, targetMode: "aoe" }],
    description: "The Midas touch corrupts everything it contacts"
  },
  {
    id: "greed_42",
    name: "Midas Touch",
    sin: "greed",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 16, duration: 4, targetMode: "single" }, { type: "heal_steal", baseValue: 7, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 6, duration: 3, targetMode: "single" }],
    description: "Wealth hoarded becomes a weapon of mass destruction"
  },
  {
    id: "greed_43",
    name: "Economic Warfare",
    sin: "greed",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "aoe" }],
    description: "Every transaction skimmed, every deal exploited"
  },
  {
    id: "greed_44",
    name: "Gilded Fortress",
    sin: "greed",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 16, duration: 4, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "The vault grows deeper as enemies grow poorer"
  },
  {
    id: "greed_45",
    name: "Robber Baron",
    sin: "greed",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "duo" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "duo" }, { type: "heal_steal", baseValue: 6, duration: 3, targetMode: "duo" }],
    description: "A hostile takeover of body, mind, and soul"
  },
  {
    id: "greed_46",
    name: "Empire Builder",
    sin: "greed",
    cost: 6,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 8, duration: 5, targetMode: "aoe" }, { type: "shield_gain", baseValue: 13, duration: 5, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 5, targetMode: "self" }],
    description: "Interest compounds on suffering as well as gold"
  },
  {
    id: "greed_47",
    name: "Hostile Merger",
    sin: "greed",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 10, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 2, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "The market crashes, but greed always profits"
  },
  {
    id: "greed_48",
    name: "Treasury Raid",
    sin: "greed",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 7, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 10, duration: 3, targetMode: "single" }],
    description: "Embezzlement of life force \u2014 the ultimate white collar crime"
  },
  {
    id: "greed_49",
    name: "Plutocracy",
    sin: "greed",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 12, duration: 4, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 10, duration: 3, targetMode: "self" }, { type: "heal_steal", baseValue: 4, duration: 3, targetMode: "aoe" }],
    description: "A pyramid scheme of pain and profit"
  },
  {
    id: "greed_50",
    name: "Infinite Greed",
    sin: "greed",
    cost: 6,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 6, duration: 2, targetMode: "aoe" }, { type: "heal_steal", baseValue: 4, duration: 2, targetMode: "aoe" }],
    description: "The final audit reveals everything was already taken"
  },
  // ── Skip-Queue (Priority) Cards ──
  {
    id: "greed_51",
    name: "Quick Skim",
    sin: "greed",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A pickpocket's reflex \u2014 your energy is now mine.",
    skipQueue: true
  },
  {
    id: "greed_52",
    name: "Tax Collector's Rush",
    sin: "greed",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_steal", baseValue: 6, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "The taxman arrives before the battle \u2014 nothing escapes the ledger.",
    skipQueue: true
  },
  {
    id: "greed_53",
    name: "Coin Flip",
    sin: "greed",
    cost: 0,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }],
    description: "Heads you lose, tails I win. The coin was weighted.",
    skipQueue: true
  },
  {
    id: "greed_54",
    name: "Advance Payment",
    sin: "greed",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
    description: "Collect interest before the debt is even owed.",
    skipQueue: true
  }
];
var ENVY_CARDS = [
  {
    id: "envy_01",
    name: "Covetous Strike",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_02",
    name: "Green-Eyed Glare",
    sin: "envy",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_03",
    name: "Bitter Touch",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_04",
    name: "Jealous Whisper",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_05",
    name: "Spite",
    sin: "envy",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "affliction_amplify", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_06",
    name: "Envy's Grasp",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_07",
    name: "Resentment",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "duo" }],
    description: "A common envy card"
  },
  {
    id: "envy_08",
    name: "Copycat",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 3, duration: 2, targetMode: "self" }],
    description: "A common envy card"
  },
  {
    id: "envy_09",
    name: "Malice",
    sin: "envy",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_10",
    name: "Grudge",
    sin: "envy",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_11",
    name: "Sour Grapes",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_12",
    name: "Toxic Envy",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_13",
    name: "Begrudge",
    sin: "envy",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_14",
    name: "Covet",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_steal", baseValue: 4, duration: 2, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_15",
    name: "Inferiority Complex",
    sin: "envy",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_16",
    name: "Petty Theft",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 2, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_17",
    name: "Sidelong Glance",
    sin: "envy",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common envy card"
  },
  {
    id: "envy_18",
    name: "Comparison",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "A common envy card"
  },
  {
    id: "envy_19",
    name: "Undermine",
    sin: "envy",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "duo" }],
    description: "A common envy card"
  },
  {
    id: "envy_20",
    name: "Bitter Pill",
    sin: "envy",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common envy card"
  },
  {
    id: "envy_21",
    name: "Doppelganger",
    sin: "envy",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_22",
    name: "Curse of Envy",
    sin: "envy",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "single" }, { type: "affliction_amplify", baseValue: 3, duration: 5, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_23",
    name: "Mirror Match",
    sin: "envy",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "affliction_transfer", baseValue: 5, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 8, duration: 3, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_24",
    name: "Schadenfreude",
    sin: "envy",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 3, duration: 2, targetMode: "duo" }],
    description: "A rare envy card"
  },
  {
    id: "envy_25",
    name: "Sabotage",
    sin: "envy",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 2, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_26",
    name: "Plagiarize",
    sin: "envy",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 8, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 7, duration: 3, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_27",
    name: "Festering Wound",
    sin: "envy",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 4, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_28",
    name: "Jealous Rage",
    sin: "envy",
    cost: 3,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 2, targetMode: "single" }, { type: "self_damage", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A rare envy card"
  },
  {
    id: "envy_29",
    name: "Parasitic Link",
    sin: "envy",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 7, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_30",
    name: "Voodoo Doll",
    sin: "envy",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_31",
    name: "Insidious Whisper",
    sin: "envy",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "affliction_amplify", baseValue: 3, duration: 5, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_32",
    name: "Green Plague",
    sin: "envy",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "aoe" }],
    description: "A rare envy card"
  },
  {
    id: "envy_33",
    name: "Resentful Strike",
    sin: "envy",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 7, duration: 3, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_34",
    name: "Soul Siphon",
    sin: "envy",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 8, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_35",
    name: "Torment",
    sin: "envy",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare envy card"
  },
  {
    id: "envy_36",
    name: "Bitter Harvest",
    sin: "envy",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 2, duration: 4, targetMode: "duo" }],
    description: "A rare envy card"
  },
  {
    id: "envy_37",
    name: "Malevolent Gaze",
    sin: "envy",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 8, duration: 2, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A malevolent gaze that amplifies every weakness"
  },
  {
    id: "envy_38",
    name: "Equalizer",
    sin: "envy",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "aoe" }],
    description: "The equalizer ensures no one has more than you"
  },
  {
    id: "envy_39",
    name: "Pandemic",
    sin: "envy",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "A pandemic of jealousy that infects all"
  },
  {
    id: "envy_40",
    name: "Identity Theft",
    sin: "envy",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 10, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 10, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Covetous eyes see every vulnerability"
  },
  {
    id: "envy_41",
    name: "Curse Cascade",
    sin: "envy",
    cost: 6,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 8, duration: 5, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "The green-eyed monster devours from within"
  },
  {
    id: "envy_42",
    name: "Nemesis",
    sin: "envy",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 16, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 8, duration: 4, targetMode: "single" }, { type: "shield_steal", baseValue: 7, duration: 2, targetMode: "single" }],
    description: "What they have, you want \u2014 and you'll take it"
  },
  {
    id: "envy_43",
    name: "Mass Hysteria",
    sin: "envy",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "Envy's whisper turns allies against each other"
  },
  {
    id: "envy_44",
    name: "Dread Mirror",
    sin: "envy",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "affliction_transfer", baseValue: 8, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "A mirror that reflects only the worst in others"
  },
  {
    id: "envy_45",
    name: "Existential Crisis",
    sin: "envy",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 4, duration: 3, targetMode: "aoe" }],
    description: "The curse of comparison amplifies all suffering"
  },
  {
    id: "envy_46",
    name: "Seven Deadly Sins",
    sin: "envy",
    cost: 6,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 4, duration: 2, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "Jealousy festers, turning small wounds into mortal ones"
  },
  {
    id: "envy_47",
    name: "Twisted Fate",
    sin: "envy",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "affliction_amplify", baseValue: 8, duration: 4, targetMode: "single" }, { type: "damage", baseValue: 14, duration: 4, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Everything they built, you'll tear down"
  },
  {
    id: "envy_48",
    name: "Wretched Curse",
    sin: "envy",
    cost: 4,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "affliction_amplify", baseValue: 4, duration: 5, targetMode: "single" }, { type: "damage", baseValue: 8, duration: 5, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "The envious eye sees weakness where others see strength"
  },
  {
    id: "envy_49",
    name: "Envious Apocalypse",
    sin: "envy",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 11, duration: 4, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 7, duration: 4, targetMode: "aoe" }, { type: "discard_burn", baseValue: 1, duration: 2, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "A toxic comparison that poisons everything it touches"
  },
  {
    id: "envy_50",
    name: "Absolute Jealousy",
    sin: "envy",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 9, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 8, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 7, duration: 2, targetMode: "single" }],
    description: "In the end, envy consumes the envious most of all"
  },
  // ── Skip-Queue (Priority) Cards ──
  {
    id: "envy_51",
    name: "Covetous Glance",
    sin: "envy",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A jealous look that makes every wound sting deeper.",
    skipQueue: true
  },
  {
    id: "envy_52",
    name: "Stolen Moment",
    sin: "envy",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 6, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
    description: "What's yours is mine \u2014 especially your health.",
    skipQueue: true
  },
  {
    id: "envy_53",
    name: "Spite Needle",
    sin: "envy",
    cost: 0,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }],
    description: "A tiny prick of malice, delivered before you can blink.",
    skipQueue: true
  },
  {
    id: "envy_54",
    name: "Mirror Snatch",
    sin: "envy",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_steal", baseValue: 5, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 2, targetMode: "single" }],
    description: "Your protection becomes my weapon.",
    skipQueue: true
  }
];
var PRIDE_CARDS = [
  {
    id: "pride_01",
    name: "Boastful Strike",
    sin: "pride",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "A common pride card"
  },
  {
    id: "pride_02",
    name: "Arrogant Slash",
    sin: "pride",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "A common pride card"
  },
  {
    id: "pride_03",
    name: "Vainglory",
    sin: "pride",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_04",
    name: "Pompous Display",
    sin: "pride",
    cost: 3,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
    description: "A common pride card"
  },
  {
    id: "pride_05",
    name: "Condescend",
    sin: "pride",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_06",
    name: "Ego Boost",
    sin: "pride",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_07",
    name: "Showoff",
    sin: "pride",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "duo" }],
    description: "A common pride card"
  },
  {
    id: "pride_08",
    name: "Hubris Strike",
    sin: "pride",
    cost: 3,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_09",
    name: "Grandstand",
    sin: "pride",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }],
    description: "A common pride card"
  },
  {
    id: "pride_10",
    name: "Narcissism",
    sin: "pride",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_11",
    name: "Swagger",
    sin: "pride",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_12",
    name: "Look at Me",
    sin: "pride",
    cost: 3,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_13",
    name: "Superiority",
    sin: "pride",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common pride card"
  },
  {
    id: "pride_14",
    name: "Preen",
    sin: "pride",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_15",
    name: "Disdain",
    sin: "pride",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common pride card"
  },
  {
    id: "pride_16",
    name: "Magnificent",
    sin: "pride",
    cost: 3,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_17",
    name: "Self-Admiration",
    sin: "pride",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 3, duration: 2, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_18",
    name: "Imperious Wave",
    sin: "pride",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }],
    description: "A common pride card"
  },
  {
    id: "pride_19",
    name: "Crown Jewel",
    sin: "pride",
    cost: 3,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common pride card"
  },
  {
    id: "pride_20",
    name: "Belittle",
    sin: "pride",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common pride card"
  },
  {
    id: "pride_21",
    name: "Royal Decree",
    sin: "pride",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 3, duration: 2, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_22",
    name: "Throne of Bones",
    sin: "pride",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "duo" }, { type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_23",
    name: "Coronation",
    sin: "pride",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 8, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_24",
    name: "Absolute Authority",
    sin: "pride",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "A rare pride card"
  },
  {
    id: "pride_25",
    name: "Glorious Charge",
    sin: "pride",
    cost: 3,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 2, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_26",
    name: "Majestic Barrier",
    sin: "pride",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_27",
    name: "Tyrant's Fist",
    sin: "pride",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare pride card"
  },
  {
    id: "pride_28",
    name: "Regal Splendor",
    sin: "pride",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_29",
    name: "Imperious Command",
    sin: "pride",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "A rare pride card"
  },
  {
    id: "pride_30",
    name: "Golden Throne",
    sin: "pride",
    cost: 5,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 9, duration: 4, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_31",
    name: "Crushing Ego",
    sin: "pride",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "A rare pride card"
  },
  {
    id: "pride_32",
    name: "Magnificent Aura",
    sin: "pride",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 4, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_33",
    name: "Dictator's Whim",
    sin: "pride",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "A rare pride card"
  },
  {
    id: "pride_34",
    name: "Exalted Strike",
    sin: "pride",
    cost: 5,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_35",
    name: "Vanity Mirror",
    sin: "pride",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 3, duration: 2, targetMode: "self" }],
    description: "A rare pride card"
  },
  {
    id: "pride_36",
    name: "Domination",
    sin: "pride",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "aoe" }],
    description: "A rare pride card"
  },
  {
    id: "pride_37",
    name: "Supreme Confidence",
    sin: "pride",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "Supreme confidence that borders on divinity"
  },
  {
    id: "pride_38",
    name: "Overbearing Force",
    sin: "pride",
    cost: 5,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }, { type: "shield_steal", baseValue: 3, duration: 2, targetMode: "duo" }],
    description: "Overbearing force that crushes lesser beings"
  },
  {
    id: "pride_39",
    name: "God Complex",
    sin: "pride",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 8, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "A god complex made manifest in devastating power"
  },
  {
    id: "pride_40",
    name: "Manifest Destiny",
    sin: "pride",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 4, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "The crown weighs heavy but grants absolute authority"
  },
  {
    id: "pride_41",
    name: "Emperor's Wrath",
    sin: "pride",
    cost: 5,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 3, duration: 2, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "Narcissistic brilliance that blinds all who witness it"
  },
  {
    id: "pride_42",
    name: "Absolute Monarchy",
    sin: "pride",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 4, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "The pedestal grows higher with every victory"
  },
  {
    id: "pride_43",
    name: "Divine Right",
    sin: "pride",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "Arrogance so pure it becomes a shield"
  },
  {
    id: "pride_44",
    name: "Megalomania",
    sin: "pride",
    cost: 6,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "discard_burn", baseValue: 1, duration: 2, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "The lion's roar silences all opposition"
  },
  {
    id: "pride_45",
    name: "Zenith",
    sin: "pride",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 4, targetMode: "single" }, { type: "shield_steal", baseValue: 4, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "Superiority isn't a complex \u2014 it's a fact"
  },
  {
    id: "pride_46",
    name: "Apotheosis",
    sin: "pride",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 8, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 9, duration: 4, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 4, targetMode: "self" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }],
    description: "The throne demands sacrifice from all who approach"
  },
  {
    id: "pride_47",
    name: "Titan's Decree",
    sin: "pride",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "aoe" }],
    description: "Vanity's mirror reflects only perfection"
  },
  {
    id: "pride_48",
    name: "Eternal Glory",
    sin: "pride",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 4, targetMode: "aoe" }, { type: "heal_gain", baseValue: 7, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 7, duration: 4, targetMode: "self" }],
    description: "The summit of pride \u2014 looking down on everything"
  },
  {
    id: "pride_49",
    name: "Supreme Being",
    sin: "pride",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "duo" }, { type: "shield_steal", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "duo" }],
    description: "An ego so massive it warps reality itself"
  },
  {
    id: "pride_50",
    name: "Narcissus Bloom",
    sin: "pride",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 7, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 7, duration: 4, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "Pride goeth before destruction \u2014 but what a glorious fall"
  },
  // ── Skip-Queue (Priority) Cards ──
  {
    id: "pride_51",
    name: "Regal Decree",
    sin: "pride",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 6, duration: 2, targetMode: "self" }],
    description: "The king speaks first. Always.",
    skipQueue: true
  },
  {
    id: "pride_52",
    name: "Imperious Strike",
    sin: "pride",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 2, targetMode: "single" }],
    description: "A blow delivered with absolute certainty of superiority.",
    skipQueue: true
  },
  {
    id: "pride_53",
    name: "Dismissive Wave",
    sin: "pride",
    cost: 0,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 5, duration: 2, targetMode: "self" }],
    description: "You're not even worth my attention. But this shield is.",
    skipQueue: true
  },
  {
    id: "pride_54",
    name: "First Among Equals",
    sin: "pride",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Pride demands the opening move \u2014 and the energy to back it up.",
    skipQueue: true
  }
];
var LUST_CARDS = [
  {
    id: "lust_01",
    name: "Seductive Touch",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "A common lust card"
  },
  {
    id: "lust_02",
    name: "Charm",
    sin: "lust",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "A common lust card"
  },
  {
    id: "lust_03",
    name: "Allure",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common lust card"
  },
  {
    id: "lust_04",
    name: "Tempting Whisper",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 2, duration: 5, targetMode: "single" }],
    description: "A common lust card"
  },
  {
    id: "lust_05",
    name: "Kiss of Death",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "A common lust card"
  },
  {
    id: "lust_06",
    name: "Enchant",
    sin: "lust",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common lust card"
  },
  {
    id: "lust_07",
    name: "Passion Burn",
    sin: "lust",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }],
    description: "A common lust card"
  },
  {
    id: "lust_08",
    name: "Desire",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 2, duration: 5, targetMode: "single" }, { type: "heal_gain", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "A common lust card"
  },
  {
    id: "lust_09",
    name: "Heartbreaker",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }],
    description: "A common lust card"
  },
  {
    id: "lust_10",
    name: "Siren Song",
    sin: "lust",
    cost: 0,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 2, duration: 4, targetMode: "single" }],
    description: "A common lust card"
  },
  {
    id: "lust_11",
    name: "Forbidden Fruit",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common lust card"
  },
  {
    id: "lust_12",
    name: "Infatuation",
    sin: "lust",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }],
    description: "A common lust card"
  },
  {
    id: "lust_13",
    name: "Love Bite",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "A common lust card"
  },
  {
    id: "lust_14",
    name: "Beguile",
    sin: "lust",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A common lust card"
  },
  {
    id: "lust_15",
    name: "Obsession",
    sin: "lust",
    cost: 2,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }],
    description: "A common lust card"
  },
  {
    id: "lust_16",
    name: "Sultry Gaze",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common lust card"
  },
  {
    id: "lust_17",
    name: "Caress",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "A common lust card"
  },
  {
    id: "lust_18",
    name: "Flirt",
    sin: "lust",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common lust card"
  },
  {
    id: "lust_19",
    name: "Toxic Love",
    sin: "lust",
    cost: 2,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 2, duration: 5, targetMode: "duo" }],
    description: "A common lust card"
  },
  {
    id: "lust_20",
    name: "Mesmerize",
    sin: "lust",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A common lust card"
  },
  {
    id: "lust_21",
    name: "Succubus Kiss",
    sin: "lust",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 8, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 8, duration: 3, targetMode: "single" }],
    description: "A rare lust card"
  },
  {
    id: "lust_22",
    name: "Heartstring Pull",
    sin: "lust",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }, { type: "heal_steal", baseValue: 2, duration: 4, targetMode: "single" }],
    description: "A rare lust card"
  },
  {
    id: "lust_23",
    name: "Aphrodite's Wrath",
    sin: "lust",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }, { type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "A rare lust card"
  },
  {
    id: "lust_24",
    name: "Love Poison",
    sin: "lust",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 2, duration: 5, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "A rare lust card"
  },
  {
    id: "lust_25",
    name: "Seduction",
    sin: "lust",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 2, duration: 2, targetMode: "aoe" }],
    description: "A rare lust card"
  },
  {
    id: "lust_26",
    name: "Crimson Kiss",
    sin: "lust",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "A rare lust card"
  },
  {
    id: "lust_27",
    name: "Passionate Fury",
    sin: "lust",
    cost: 3,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 3, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare lust card"
  },
  {
    id: "lust_28",
    name: "Enchantress",
    sin: "lust",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "duo" }],
    description: "A rare lust card"
  },
  {
    id: "lust_29",
    name: "Draining Embrace",
    sin: "lust",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 4, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A rare lust card"
  },
  {
    id: "lust_30",
    name: "Irresistible",
    sin: "lust",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A rare lust card"
  },
  {
    id: "lust_31",
    name: "Fatal Attraction",
    sin: "lust",
    cost: 4,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }, { type: "heal_steal", baseValue: 2, duration: 5, targetMode: "single" }],
    description: "A rare lust card"
  },
  {
    id: "lust_32",
    name: "Love Triangle",
    sin: "lust",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }, { type: "heal_steal", baseValue: 2, duration: 3, targetMode: "duo" }],
    description: "A rare lust card"
  },
  {
    id: "lust_33",
    name: "Pheromone Cloud",
    sin: "lust",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "heal_gain", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "A rare lust card"
  },
  {
    id: "lust_34",
    name: "Broken Heart",
    sin: "lust",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A rare lust card"
  },
  {
    id: "lust_35",
    name: "Vampiric Touch",
    sin: "lust",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "heal_steal", baseValue: 3, duration: 5, targetMode: "single" }],
    description: "A rare lust card"
  },
  {
    id: "lust_36",
    name: "Enthrall",
    sin: "lust",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A rare lust card"
  },
  {
    id: "lust_37",
    name: "Desire Unbound",
    sin: "lust",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "An irresistible allure that drains the willing"
  },
  {
    id: "lust_38",
    name: "Rose Thorns",
    sin: "lust",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Passion's embrace heals as it destroys"
  },
  {
    id: "lust_39",
    name: "Eternal Seduction",
    sin: "lust",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "The siren's call lures victims to sweet oblivion"
  },
  {
    id: "lust_40",
    name: "Lilith's Embrace",
    sin: "lust",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 4, targetMode: "single" }, { type: "heal_steal", baseValue: 8, duration: 4, targetMode: "single" }, { type: "shield_steal", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "Desire made weapon \u2014 every touch steals life"
  },
  {
    id: "lust_41",
    name: "Mass Seduction",
    sin: "lust",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "A seductive whisper that weakens all resolve"
  },
  {
    id: "lust_42",
    name: "Crimson Tide",
    sin: "lust",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "heal_gain", baseValue: 8, duration: 5, targetMode: "self" }, { type: "shield_gain", baseValue: 4, duration: 3, targetMode: "self" }],
    description: "The dance of temptation leaves only exhaustion"
  },
  {
    id: "lust_43",
    name: "Forbidden Love",
    sin: "lust",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 4, targetMode: "single" }, { type: "heal_steal", baseValue: 8, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Obsession fuels an endless cycle of taking"
  },
  {
    id: "lust_44",
    name: "Love Plague",
    sin: "lust",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 2, duration: 5, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 1, duration: 4, targetMode: "aoe" }],
    description: "The kiss of corruption spreads with every heartbeat"
  },
  {
    id: "lust_45",
    name: "Aphrodisiac Storm",
    sin: "lust",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 2, duration: 2, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "Infatuation blinds while lust devours"
  },
  {
    id: "lust_46",
    name: "Heartless",
    sin: "lust",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 4, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
    description: "A charm so potent it turns enemies into fuel"
  },
  {
    id: "lust_47",
    name: "Siren's Requiem",
    sin: "lust",
    cost: 4,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "heal_gain", baseValue: 4, duration: 4, targetMode: "self" }],
    description: "The web of desire ensnares all who draw near"
  },
  {
    id: "lust_48",
    name: "Cupid's Arrow",
    sin: "lust",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 4, targetMode: "duo" }, { type: "heal_steal", baseValue: 4, duration: 4, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "duo" }],
    description: "Passion's fire burns brightest in the darkest moments"
  },
  {
    id: "lust_49",
    name: "Eternal Devotion",
    sin: "lust",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 9, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 9, duration: 4, targetMode: "self" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "Every stolen glance becomes a stolen breath"
  },
  {
    id: "lust_50",
    name: "Lust Incarnate",
    sin: "lust",
    cost: 6,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 8, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "The ultimate seduction \u2014 life itself surrendered willingly"
  },
  // ── Skip-Queue (Priority) Cards ──
  {
    id: "lust_51",
    name: "Alluring Whisper",
    sin: "lust",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 6, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
    description: "A sweet nothing that cuts like a blade.",
    skipQueue: true
  },
  {
    id: "lust_52",
    name: "Seductive Feint",
    sin: "lust",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 7, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
    description: "Draw them close, then take what you need.",
    skipQueue: true
  },
  {
    id: "lust_53",
    name: "Heartstring Tug",
    sin: "lust",
    cost: 0,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }],
    description: "A gentle pull that tears something vital.",
    skipQueue: true
  },
  {
    id: "lust_54",
    name: "Passion's Edge",
    sin: "lust",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 8, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 3, duration: 2, targetMode: "self" }],
    description: "Desire sharpened to a point \u2014 it strikes before reason.",
    skipQueue: true
  }
];
var GLUTTONY_CARDS = [
  {
    id: "gluttony_01",
    name: "Nibble",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_02",
    name: "Gulp",
    sin: "gluttony",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_03",
    name: "Chomp",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_04",
    name: "Gorge",
    sin: "gluttony",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 2, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_05",
    name: "Munch",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 2, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_06",
    name: "Belch",
    sin: "gluttony",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "aoe" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_07",
    name: "Crunch",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 11, duration: 2, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_08",
    name: "Devour Scraps",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 5, duration: 2, targetMode: "self" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_09",
    name: "Ravenous Bite",
    sin: "gluttony",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_10",
    name: "Consume",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_11",
    name: "Feast",
    sin: "gluttony",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 6, duration: 3, targetMode: "self" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_12",
    name: "Swallow Whole",
    sin: "gluttony",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 6, duration: 2, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_13",
    name: "Acid Spit",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_14",
    name: "Gluttonous Grab",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_15",
    name: "Bloat",
    sin: "gluttony",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 6, duration: 3, targetMode: "self" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_16",
    name: "Digest",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "slowburn",
    effects: [{ type: "discard_burn", baseValue: 2, duration: 4, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_17",
    name: "Hungry Eyes",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "duo" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_18",
    name: "Scavenge",
    sin: "gluttony",
    cost: 0,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_19",
    name: "Stomach Acid",
    sin: "gluttony",
    cost: 2,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_20",
    name: "Leftovers",
    sin: "gluttony",
    cost: 1,
    tier: "common",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 7, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A common gluttony card"
  },
  {
    id: "gluttony_21",
    name: "Feeding Frenzy",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_22",
    name: "Insatiable Hunger",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "damage", baseValue: 9, duration: 3, targetMode: "duo" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_23",
    name: "Acid Rain",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "aoe" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_24",
    name: "Digestive Tract",
    sin: "gluttony",
    cost: 2,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "discard_burn", baseValue: 2, duration: 5, targetMode: "single" }, { type: "damage", baseValue: 6, duration: 4, targetMode: "single" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_25",
    name: "Binge",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 5, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 9, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_26",
    name: "Regurgitate",
    sin: "gluttony",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 6, duration: 2, targetMode: "self" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_27",
    name: "Bottomless Pit",
    sin: "gluttony",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_28",
    name: "Gluttony's Maw",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "aggressive",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 14, duration: 3, targetMode: "single" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_29",
    name: "Corrode",
    sin: "gluttony",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "shield_steal", baseValue: 7, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_30",
    name: "Feast or Famine",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 9, duration: 3, targetMode: "single" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_31",
    name: "Consume All",
    sin: "gluttony",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "damage", baseValue: 11, duration: 3, targetMode: "duo" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_32",
    name: "Putrid Breath",
    sin: "gluttony",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_33",
    name: "Parasitic Feast",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 7, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_34",
    name: "Dissolve",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "slowburn",
    effects: [{ type: "discard_burn", baseValue: 2, duration: 5, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 5, targetMode: "single" }, { type: "shield_steal", baseValue: 5, duration: 3, targetMode: "single" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_35",
    name: "Ravenous Swarm",
    sin: "gluttony",
    cost: 4,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 7, duration: 2, targetMode: "aoe" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_36",
    name: "Gut Rot",
    sin: "gluttony",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 2, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "A rare gluttony card"
  },
  {
    id: "gluttony_37",
    name: "Engulf",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 7, duration: 2, targetMode: "self" }],
    description: "An insatiable hunger that consumes everything"
  },
  {
    id: "gluttony_38",
    name: "Voracious Appetite",
    sin: "gluttony",
    cost: 3,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "heal_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "The feast never ends \u2014 there's always room for more"
  },
  {
    id: "gluttony_39",
    name: "Consume the World",
    sin: "gluttony",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 12, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "A bottomless pit that swallows hope and health"
  },
  {
    id: "gluttony_40",
    name: "Eternal Hunger",
    sin: "gluttony",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 5, duration: 4, targetMode: "aoe" }, { type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 6, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "Ravenous consumption fuels unstoppable growth"
  },
  {
    id: "gluttony_41",
    name: "Black Hole",
    sin: "gluttony",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 17, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 7, duration: 2, targetMode: "single" }],
    description: "The glutton's banquet \u2014 your loss is their gain"
  },
  {
    id: "gluttony_42",
    name: "Apocalyptic Feast",
    sin: "gluttony",
    cost: 6,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 14, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "Devouring not just flesh but spirit and will"
  },
  {
    id: "gluttony_43",
    name: "Obese Monstrosity",
    sin: "gluttony",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 17, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 12, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }],
    description: "An appetite for destruction that knows no satiation"
  },
  {
    id: "gluttony_44",
    name: "Digestive Apocalypse",
    sin: "gluttony",
    cost: 6,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "damage", baseValue: 7, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 5, duration: 4, targetMode: "aoe" }],
    description: "The more you feed it, the hungrier it becomes"
  },
  {
    id: "gluttony_45",
    name: "Void Stomach",
    sin: "gluttony",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 6, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "A consuming void that turns waste into power"
  },
  {
    id: "gluttony_46",
    name: "Famine",
    sin: "gluttony",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }],
    description: "Gluttony's curse \u2014 always hungry, never satisfied"
  },
  {
    id: "gluttony_47",
    name: "All-Consuming",
    sin: "gluttony",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "duo" }, { type: "damage", baseValue: 14, duration: 3, targetMode: "duo" }, { type: "heal_steal", baseValue: 7, duration: 3, targetMode: "duo" }],
    description: "The feast of fools \u2014 everyone's invited, no one leaves"
  },
  {
    id: "gluttony_48",
    name: "Leviathan",
    sin: "gluttony",
    cost: 6,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 5, duration: 4, targetMode: "aoe" }, { type: "damage", baseValue: 12, duration: 4, targetMode: "aoe" }, { type: "shield_steal", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 4, targetMode: "self" }],
    description: "Metabolizing misery into raw energy"
  },
  {
    id: "gluttony_49",
    name: "Glutton King",
    sin: "gluttony",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 14, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "An all-you-can-eat buffet of suffering"
  },
  {
    id: "gluttony_50",
    name: "Singularity",
    sin: "gluttony",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 15, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 12, duration: 3, targetMode: "self" }],
    description: "The final course \u2014 everything that remains"
  },
  // ── Skip-Queue (Priority) Cards ──
  {
    id: "gluttony_51",
    name: "Voracious Snap",
    sin: "gluttony",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "discard_burn", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Bite first, chew later. Their cards are the appetizer.",
    skipQueue: true
  },
  {
    id: "gluttony_52",
    name: "Gulping Surge",
    sin: "gluttony",
    cost: 2,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 8, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Consume everything in reach \u2014 health, energy, all of it.",
    skipQueue: true
  },
  {
    id: "gluttony_53",
    name: "Nibble",
    sin: "gluttony",
    cost: 0,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "discard_burn", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Just a taste. But even a taste destroys.",
    skipQueue: true
  },
  {
    id: "gluttony_54",
    name: "Hunger Pang",
    sin: "gluttony",
    cost: 1,
    tier: "rare",
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 6, duration: 2, targetMode: "single" }, { type: "heal_steal", baseValue: 4, duration: 2, targetMode: "single" }],
    description: "The hunger strikes before the feast begins.",
    skipQueue: true
  }
];
var ALL_DECKS = {
  wrath: WRATH_CARDS,
  sloth: SLOTH_CARDS,
  greed: GREED_CARDS,
  envy: ENVY_CARDS,
  pride: PRIDE_CARDS,
  lust: LUST_CARDS,
  gluttony: GLUTTONY_CARDS
};
function getDeckForSin(sin) {
  const deck = ALL_DECKS[sin];
  if (!deck) throw new Error(`Unknown sin: ${sin}`);
  return deck.map((c) => c.id);
}
function getCardById(id) {
  for (const deck of Object.values(ALL_DECKS)) {
    const card = deck.find((c) => c.id === id);
    if (card) return card;
  }
  return void 0;
}
var ALL_CARDS = [
  ...WRATH_CARDS,
  ...SLOTH_CARDS,
  ...GREED_CARDS,
  ...ENVY_CARDS,
  ...PRIDE_CARDS,
  ...LUST_CARDS,
  ...GLUTTONY_CARDS
];
var CARD_MAP = {};
ALL_CARDS.forEach((card) => {
  CARD_MAP[card.id] = card;
});

// shared/gameTypes.ts
var COMPOUND_TICKS = {
  standard: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
  aggressive: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
  slowburn: [1, 1, 1, 1, 2, 2, 3, 3, 4, 5]
};
function getCompoundTick(pattern, tickIndex) {
  const ticks = COMPOUND_TICKS[pattern];
  if (tickIndex < 0) return 0;
  return ticks[Math.min(tickIndex, ticks.length - 1)];
}
function getCompoundTickValue(baseValue, pattern, tickIndex) {
  return Math.round(baseValue * getCompoundTick(pattern, tickIndex));
}
var MAX_ENERGY = 7;
var CONSUME_ENERGY_REFUND = 1;
var WRATH_VENGEANCE_PCT = 0.634;
var SLOTH_ENDURANCE_MULT = 0.45;
var SLOTH_ENDURANCE_CAP = 25;
var GREED_TAX_PCT = 0.063;
var GREED_TAX_TICK = 2;
var ENVY_JEALOUSY_PCT = 0.106;
var LUST_TEMPTATION_PCT = 0.25;
var GLUTTONY_DEVOURER_ENERGY = 1.585;
var STARTING_ENERGY = 2;
var MAX_ROUNDS = 20;
var STARTING_HP = 200;
var HAND_SIZE = 5;
var CARDS_PER_DECK = 30;
var ROUND_16_DOUBLING = 16;

// server/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";
var _serverSupabase = null;
function getServerSupabase() {
  if (_serverSupabase) return _serverSupabase;
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing server Supabase env vars (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }
  _serverSupabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return _serverSupabase;
}

// server/gameEngine.ts
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
function shuffleDeck(cardIds) {
  const deck = [...cardIds];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
async function ensurePlayer(playerId, username) {
  const sb = getServerSupabase();
  const { data: existing } = await sb.from("players").select("id").eq("id", playerId).single();
  if (!existing) {
    await sb.from("players").insert({ id: playerId, username });
  }
}
async function createGame(playerId, username) {
  const sb = getServerSupabase();
  const roomCode = generateRoomCode();
  const { data: game, error: gameError } = await sb.from("games").insert({ room_code: roomCode, status: "lobby" }).select("id").single();
  if (gameError || !game) throw new Error(`Failed to create game: ${gameError?.message}`);
  await ensurePlayer(playerId, username);
  const { error: joinError } = await sb.from("game_players").insert({
    game_id: game.id,
    player_id: playerId,
    seat_index: 0
  });
  if (joinError) throw new Error(`Failed to join game: ${joinError.message}`);
  await sb.from("game_log").insert({
    game_id: game.id,
    action_type: "game_created",
    action_data: { creator: username },
    round_number: 0
  });
  return { gameId: game.id, roomCode };
}
async function joinGame(roomCode, playerId, username) {
  const sb = getServerSupabase();
  const { data: game, error: gameError } = await sb.from("games").select("id, status").eq("room_code", roomCode.toUpperCase()).single();
  if (gameError || !game) throw new Error("Game not found");
  if (game.status !== "lobby") throw new Error("Game already started");
  const { data: players } = await sb.from("game_players").select("seat_index, player_id").eq("game_id", game.id).order("seat_index");
  if (!players) throw new Error("Failed to fetch players");
  if (players.length >= 4) throw new Error("Game is full");
  const existing = players.find((p) => p.player_id === playerId);
  if (existing) return { gameId: game.id, seatIndex: existing.seat_index };
  const takenSeats = new Set(players.map((p) => p.seat_index));
  let seatIndex = 0;
  while (takenSeats.has(seatIndex)) seatIndex++;
  await ensurePlayer(playerId, username);
  const { error: joinError } = await sb.from("game_players").insert({
    game_id: game.id,
    player_id: playerId,
    seat_index: seatIndex
  });
  if (joinError) throw new Error(`Failed to join: ${joinError.message}`);
  return { gameId: game.id, seatIndex };
}
async function chooseSin(gameId, playerId, sin) {
  const sb = getServerSupabase();
  const { error } = await sb.from("game_players").update({ chosen_sin: sin }).eq("game_id", gameId).eq("player_id", playerId);
  if (error) throw new Error(`Failed to choose sin: ${error.message}`);
}
async function startGame(gameId) {
  const sb = getServerSupabase();
  const { data: players } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  if (!players || players.length < 2) throw new Error("Need at least 2 players");
  const allReady = players.every((p) => p.chosen_sin);
  if (!allReady) throw new Error("All players must choose a sin");
  for (const player of players) {
    const fullDeck = getDeckForSin(player.chosen_sin);
    const customDeckIds = player.custom_deck_ids;
    const deckCards = customDeckIds && Array.isArray(customDeckIds) && customDeckIds.length > 0 ? customDeckIds : shuffleDeck(fullDeck).slice(0, CARDS_PER_DECK);
    const shuffled = shuffleDeck(deckCards);
    const hand = shuffled.slice(0, HAND_SIZE);
    const remainingDeck = shuffled.slice(HAND_SIZE);
    await sb.from("game_players").update({
      hand,
      deck: remainingDeck,
      discard_pile: [],
      current_hp: STARTING_HP,
      max_hp: STARTING_HP,
      is_alive: true,
      current_energy: STARTING_ENERGY,
      max_energy: MAX_ENERGY,
      bonus_energy: 0
    }).eq("id", player.id);
  }
  await sb.from("games").update({
    status: "active",
    current_round: 1,
    current_player_index: 0,
    turn_phase: "selection",
    locked_plays: [],
    started_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", gameId);
  for (const player of players) {
    await sb.from("game_players").update({ locked_cards: [] }).eq("id", player.id);
  }
  await sb.from("game_log").insert({
    game_id: gameId,
    action_type: "game_started",
    action_data: { playerCount: players.length },
    round_number: 1
  });
}
async function lockInCards(gameId, playerId, selections) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") throw new Error("Game not active");
  if (game.turn_phase !== "selection") throw new Error("Not in selection phase");
  const { data: player } = await sb.from("game_players").select("*").eq("game_id", gameId).eq("player_id", playerId).single();
  if (!player) throw new Error("Player not in game");
  if (!player.is_alive) throw new Error("Player is eliminated");
  const hand = player.hand || [];
  let energyBudget = player.current_energy ?? 0;
  const lockedPlays = [];
  for (const sel of selections) {
    if (!hand.includes(sel.cardId)) throw new Error(`Card ${sel.cardId} not in hand`);
    const card = getCardById(sel.cardId);
    if (!card) throw new Error(`Invalid card ${sel.cardId}`);
    if (card.cost > energyBudget) throw new Error(`Not enough energy for ${card.name}`);
    energyBudget -= card.cost;
    lockedPlays.push({
      playerId: player.player_id,
      gamePlayerId: player.id,
      cardId: sel.cardId,
      targetPlayerId: sel.targetPlayerId,
      skipQueue: card.skipQueue || false
    });
  }
  const storedLocked = lockedPlays.length > 0 ? lockedPlays : [{ pass: true }];
  await sb.from("game_players").update({ locked_cards: storedLocked }).eq("id", player.id);
  const existingLocked = (Array.isArray(game.locked_plays) ? game.locked_plays : []).filter(
    (lp) => lp.playerId !== playerId
  );
  const allLocked = [...existingLocked, ...lockedPlays];
  await sb.from("games").update({ locked_plays: allLocked }).eq("id", gameId);
  await sb.from("game_log").insert({
    game_id: gameId,
    player_id: player.id,
    action_type: "lock_in",
    action_data: { cardCount: selections.length, energyRemaining: energyBudget },
    round_number: game.current_round
  });
  const { data: allPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  const alivePlayers = (allPlayers || []).filter((p) => p.is_alive);
  const allConfirmed = alivePlayers.every((p) => {
    if (p.player_id === playerId) return true;
    const pLocked = Array.isArray(p.locked_cards) ? p.locked_cards : [];
    return pLocked.length > 0;
  });
  if (allConfirmed) {
    await sb.from("games").update({ turn_phase: "resolution" }).eq("id", gameId);
    await resolveLockedPlays(gameId);
  }
  const quip = selections.length === 0 ? "Choosing to do nothing? Bold strategy." : selections.length === 1 ? "One card locked. Let fate decide." : `${selections.length} cards locked. The arena trembles.`;
  return { success: true, narratorQuip: quip };
}
async function resolveLockedPlays(gameId) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) return;
  const { data: allPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  if (!allPlayers) return;
  const lockedPlays = Array.isArray(game.locked_plays) ? game.locked_plays : [];
  const sortedPlays = [...lockedPlays].sort((a, b) => {
    if (a.skipQueue && !b.skipQueue) return -1;
    if (!a.skipQueue && b.skipQueue) return 1;
    const playerA = allPlayers.find((p) => p.player_id === a.playerId);
    const playerB = allPlayers.find((p) => p.player_id === b.playerId);
    const hpA = playerA?.current_hp ?? 999;
    const hpB = playerB?.current_hp ?? 999;
    if (hpA !== hpB) return hpA - hpB;
    const seatA = playerA?.seat_index ?? 999;
    const seatB = playerB?.seat_index ?? 999;
    if (seatA !== seatB) return seatA - seatB;
    const cardA = getCardById(a.cardId);
    const cardB = getCardById(b.cardId);
    return (cardA?.cost ?? 0) - (cardB?.cost ?? 0);
  });
  for (const play of sortedPlays) {
    const { data: freshPlayer } = await sb.from("game_players").select("*").eq("player_id", play.playerId).eq("game_id", gameId).single();
    if (!freshPlayer || !freshPlayer.is_alive) continue;
    const card = getCardById(play.cardId);
    if (!card) continue;
    const { data: currentPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
    if (!currentPlayers) continue;
    const currentEnergy = freshPlayer.current_energy ?? 0;
    let newEnergy = Math.max(0, currentEnergy - card.cost);
    const sin = freshPlayer.chosen_sin;
    const hand = freshPlayer.hand || [];
    const newHand = hand.filter((id) => id !== play.cardId);
    const discard = freshPlayer.discard_pile || [];
    discard.push(play.cardId);
    await sb.from("game_players").update({ hand: newHand, discard_pile: discard, current_energy: newEnergy }).eq("id", freshPlayer.id);
    const effectDescriptions = [];
    for (const effect of card.effects) {
      const targets = resolveTargets(effect, freshPlayer, currentPlayers, play.targetPlayerId);
      const firstTickValue = getCompoundTickValue(effect.baseValue, card.compoundPattern, 0);
      for (const target of targets) {
        await applyInstantEffect(effect.type, firstTickValue, target, gameId, freshPlayer.player_id);
        if (sin === "envy" && effect.type === "damage" && target.player_id !== play.playerId) {
          await amplifyWorstAfflictionPct(gameId, target.id, ENVY_JEALOUSY_PCT);
        }
        if (effect.duration > 1) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: target.id,
            source_player_id: freshPlayer.id,
            effect_type: effect.type,
            base_value: effect.baseValue,
            applied_at_round: game.current_round,
            duration_rounds: effect.duration,
            card_id: play.cardId,
            current_tick: 1,
            compound_pattern: card.compoundPattern
          });
        }
        effectDescriptions.push(
          `${effect.type} ${firstTickValue} on ${target.player_id === play.playerId ? "self" : "enemy"} (${card.compoundPattern} \xD7${effect.duration}r)`
        );
      }
    }
    await sb.from("game_log").insert({
      game_id: gameId,
      player_id: freshPlayer.id,
      action_type: "play_card",
      action_data: {
        cardId: play.cardId,
        targetPlayerId: play.targetPlayerId,
        effects: effectDescriptions,
        compoundPattern: card.compoundPattern,
        energySpent: card.cost,
        energyRemaining: newEnergy,
        resolvedInPhase: "resolution"
      },
      round_number: game.current_round
    });
  }
  await advanceRound(gameId);
}
async function playCard(gameId, playerId, cardId, targetPlayerId) {
  const result = await lockInCards(gameId, playerId, [{ cardId, targetPlayerId }]);
  return { narratorQuip: result.narratorQuip, effects: [] };
}
async function passTurn(gameId, playerId) {
  await lockInCards(gameId, playerId, []);
}
async function getGameState(gameId) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) throw new Error("Game not found");
  const { data: gamePlayers } = await sb.from("game_players").select("*, players(username)").eq("game_id", gameId).order("seat_index");
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId);
  const rawLocked = game.locked_plays;
  const allLockedPlays = Array.isArray(rawLocked) ? rawLocked : [];
  const players = (gamePlayers || []).map((gp) => {
    const playerLocked = allLockedPlays.filter((lp) => lp.playerId === gp.player_id);
    const gpLockedCards = Array.isArray(gp.locked_cards) ? gp.locked_cards : [];
    return {
      id: gp.player_id,
      gamePlayerId: gp.id,
      username: gp.players?.username || "Unknown",
      seatIndex: gp.seat_index,
      chosenSin: gp.chosen_sin,
      currentHp: gp.current_hp,
      maxHp: gp.max_hp,
      isAlive: gp.is_alive,
      hand: gp.hand || [],
      deckSize: (gp.deck || []).length,
      discardSize: (gp.discard_pile || []).length,
      currentEnergy: gp.current_energy ?? 0,
      maxEnergy: gp.max_energy ?? 0,
      bonusEnergy: gp.bonus_energy ?? 0,
      lockedCards: playerLocked.length > 0 ? playerLocked : gpLockedCards,
      hasLockedIn: gpLockedCards.length > 0 || playerLocked.length > 0,
      consumedThisRound: gp.consumed_this_round ?? false
    };
  });
  const activeEffects = (effects || []).map((e) => ({
    id: e.id,
    targetPlayerId: e.target_player_id,
    sourcePlayerId: e.source_player_id,
    effectType: e.effect_type,
    baseValue: e.base_value,
    appliedAtRound: e.applied_at_round,
    durationRounds: e.duration_rounds,
    cardId: e.card_id,
    currentTick: e.current_tick ?? void 0,
    compoundPattern: e.compound_pattern ?? void 0,
    doubled: e.doubled ?? void 0
  }));
  return {
    id: game.id,
    roomCode: game.room_code,
    status: game.status,
    currentRound: game.current_round,
    currentPlayerIndex: game.current_player_index ?? 0,
    turnPhase: game.turn_phase || "selection",
    lockedPlays: allLockedPlays,
    players,
    activeEffects,
    winnerId: game.winner_id
  };
}
async function getGameLog(gameId) {
  const sb = getServerSupabase();
  const { data } = await sb.from("game_log").select("*").eq("game_id", gameId).order("timestamp", { ascending: true });
  return data || [];
}
async function consumeCard(gameId, playerId, cardId) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("current_round").eq("id", gameId).single();
  const { data: gp, error } = await sb.from("game_players").select("*").eq("game_id", gameId).eq("player_id", playerId).single();
  if (error || !gp) return { success: false, message: "The void cannot find you." };
  if (!gp.is_alive) return { success: false, message: "The dead cannot sacrifice." };
  if (gp.consumed_this_round) return { success: false, message: "The void has had its fill this round." };
  const hand = gp.hand || [];
  if (!hand.includes(cardId)) return { success: false, message: "That card has already slipped away." };
  const newHand = hand.filter((id) => id !== cardId);
  const newEnergy = Math.min((gp.current_energy || 0) + CONSUME_ENERGY_REFUND, MAX_ENERGY);
  await sb.from("game_players").update({
    hand: newHand,
    current_energy: newEnergy,
    consumed_this_round: true
  }).eq("game_id", gameId).eq("player_id", playerId);
  const card = getCardById(cardId);
  await sb.from("game_log").insert({
    game_id: gameId,
    round_number: game?.current_round || 1,
    player_id: playerId,
    action_type: "consume",
    action_data: {
      cardId,
      cardName: card?.name || cardId,
      energyRefund: CONSUME_ENERGY_REFUND,
      newEnergy
    }
  });
  return {
    success: true,
    message: `Banished ${card?.name || "a card"} to the void. +${CONSUME_ENERGY_REFUND} energy.`
  };
}
function resolveTargets(effect, source, allPlayers, targetPlayerId) {
  const alive = allPlayers.filter((p) => p.is_alive);
  switch (effect.targetMode) {
    case "self":
      return [source];
    case "single": {
      if (targetPlayerId) {
        const target = alive.find((p) => p.player_id === targetPlayerId);
        return target ? [target] : [];
      }
      const enemies = alive.filter((p) => p.player_id !== source.player_id);
      return enemies.sort((a, b) => a.current_hp - b.current_hp).slice(0, 1);
    }
    case "duo": {
      const enemies = alive.filter((p) => p.player_id !== source.player_id);
      return enemies.sort((a, b) => a.current_hp - b.current_hp).slice(0, 2);
    }
    case "aoe":
      return alive.filter((p) => p.player_id !== source.player_id);
    default:
      return [];
  }
}
async function applyInstantEffect(type, value, target, gameId, sourcePlayerId) {
  const sb = getServerSupabase();
  const roundedValue = Math.round(value);
  switch (type) {
    case "damage":
    case "self_damage": {
      let remainingDamage = roundedValue;
      if (gameId) {
        const { data: shields } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", target.id).in("effect_type", ["shield_gain"]);
        if (shields && shields.length > 0) {
          for (const shield of shields) {
            if (remainingDamage <= 0) break;
            const shieldValue = shield.base_value;
            if (shieldValue <= remainingDamage) {
              remainingDamage -= shieldValue;
              await sb.from("active_effects").delete().eq("id", shield.id);
            } else {
              await sb.from("active_effects").update({ base_value: shieldValue - remainingDamage }).eq("id", shield.id);
              remainingDamage = 0;
            }
          }
        }
      }
      if (remainingDamage > 0) {
        const newHp = Math.max(0, target.current_hp - remainingDamage);
        const isAlive = newHp > 0;
        await sb.from("game_players").update({ current_hp: newHp, is_alive: isAlive }).eq("id", target.id);
        target.current_hp = newHp;
        target.is_alive = isAlive;
        if (target.chosen_sin === "wrath" && target.is_alive && sourcePlayerId && sourcePlayerId !== target.player_id) {
          const reflectDmg = Math.round(remainingDamage * WRATH_VENGEANCE_PCT);
          if (reflectDmg > 0 && gameId) {
            const { data: attacker } = await sb.from("game_players").select("*").eq("player_id", sourcePlayerId).eq("game_id", gameId).single();
            if (attacker && attacker.is_alive) {
              const newAttackerHp = Math.max(0, attacker.current_hp - reflectDmg);
              const attackerAlive = newAttackerHp > 0;
              await sb.from("game_players").update({ current_hp: newAttackerHp, is_alive: attackerAlive }).eq("id", attacker.id);
            }
          }
        }
      }
      break;
    }
    case "heal_gain": {
      const newHp = Math.min(target.max_hp ?? STARTING_HP, target.current_hp + roundedValue);
      await sb.from("game_players").update({ current_hp: newHp }).eq("id", target.id);
      target.current_hp = newHp;
      break;
    }
    case "heal_steal": {
      const stolen = Math.min(roundedValue, target.current_hp);
      const newTargetHp = Math.max(0, target.current_hp - stolen);
      const isAlive = newTargetHp > 0;
      await sb.from("game_players").update({ current_hp: newTargetHp, is_alive: isAlive }).eq("id", target.id);
      target.current_hp = newTargetHp;
      target.is_alive = isAlive;
      if (sourcePlayerId && gameId) {
        const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", sourcePlayerId).eq("game_id", gameId).single();
        if (sourcePlayer) {
          const newSourceHp = Math.min(sourcePlayer.max_hp ?? STARTING_HP, sourcePlayer.current_hp + stolen);
          await sb.from("game_players").update({ current_hp: newSourceHp }).eq("id", sourcePlayer.id);
        }
      }
      break;
    }
    case "shield_gain": {
      if (gameId) {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: sourcePlayerId || target.id,
          effect_type: "shield_gain",
          base_value: roundedValue,
          applied_at_round: 0,
          duration_rounds: 1,
          card_id: "instant-shield"
        });
      }
      break;
    }
    case "shield_steal": {
      if (gameId) {
        const { data: shields } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", target.id).eq("effect_type", "shield_gain");
        let stolen = 0;
        if (shields && shields.length > 0) {
          for (const shield of shields) {
            if (stolen >= roundedValue) break;
            const take = Math.min(shield.base_value, roundedValue - stolen);
            stolen += take;
            if (take >= shield.base_value) {
              await sb.from("active_effects").delete().eq("id", shield.id);
            } else {
              await sb.from("active_effects").update({ base_value: shield.base_value - take }).eq("id", shield.id);
            }
          }
        }
        if (stolen > 0 && sourcePlayerId) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: sourcePlayerId,
            source_player_id: sourcePlayerId,
            effect_type: "shield_gain",
            base_value: stolen,
            applied_at_round: 0,
            duration_rounds: 1,
            card_id: "stolen-shield"
          });
        }
      }
      break;
    }
    case "energy_gain": {
      const currentSelfEnergy = target.current_energy ?? 0;
      const newEnergy = Math.min(currentSelfEnergy + roundedValue, MAX_ENERGY);
      await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", target.id);
      target.current_energy = newEnergy;
      break;
    }
    case "energy_steal": {
      const currentTargetEnergy = target.current_energy ?? 0;
      const drained = Math.min(roundedValue, currentTargetEnergy);
      await sb.from("game_players").update({ current_energy: currentTargetEnergy - drained }).eq("id", target.id);
      target.current_energy = currentTargetEnergy - drained;
      if (sourcePlayerId && gameId) {
        const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", sourcePlayerId).eq("game_id", gameId).single();
        if (sourcePlayer) {
          const newEnergy = Math.min((sourcePlayer.current_energy ?? 0) + drained, MAX_ENERGY);
          await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", sourcePlayer.id);
        }
      }
      break;
    }
    case "energy_block":
    case "heal_block":
    case "shield_block": {
      if (gameId) {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: sourcePlayerId || target.id,
          effect_type: type,
          base_value: roundedValue,
          applied_at_round: 0,
          duration_rounds: roundedValue,
          card_id: "block-effect"
        });
      }
      break;
    }
    case "affliction_amplify": {
      if (gameId) {
        await amplifyWorstAffliction(gameId, target.id, roundedValue);
      }
      break;
    }
    case "affliction_transfer": {
      if (gameId && sourcePlayerId) {
        const { data: sourceEffects } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", sourcePlayerId).in("effect_type", ["damage", "self_damage"]);
        if (sourceEffects && sourceEffects.length > 0) {
          const worst = sourceEffects.sort((a, b) => b.base_value - a.base_value)[0];
          await sb.from("active_effects").update({ target_player_id: target.id }).eq("id", worst.id);
        }
      }
      break;
    }
    case "discard_burn": {
      const discard = target.discard_pile || [];
      const burnCount = Math.min(roundedValue, discard.length);
      if (burnCount > 0) {
        const newDiscard = discard.slice(burnCount);
        await sb.from("game_players").update({ discard_pile: newDiscard }).eq("id", target.id);
        target.discard_pile = newDiscard;
        if (sourcePlayerId && gameId) {
          const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", sourcePlayerId).eq("game_id", gameId).single();
          if (sourcePlayer && sourcePlayer.chosen_sin === "gluttony") {
            const energyGain = Math.round(burnCount * GLUTTONY_DEVOURER_ENERGY);
            const newEnergy = Math.min((sourcePlayer.current_energy ?? 0) + energyGain, MAX_ENERGY);
            await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", sourcePlayer.id);
          }
        }
      }
      break;
    }
    case "energy_regen": {
      const currentEnergy = target.current_energy ?? 0;
      const newEnergy = Math.min(currentEnergy + roundedValue, MAX_ENERGY);
      await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", target.id);
      target.current_energy = newEnergy;
      break;
    }
    case "draw_boost": {
      for (let i = 0; i < roundedValue; i++) {
        await drawCard(target);
      }
      break;
    }
    case "draw_reduction": {
      const hand = target.hand || [];
      const discardCount = Math.min(roundedValue, hand.length);
      if (discardCount > 0) {
        const discarded = hand.splice(0, discardCount);
        const discard = target.discard_pile || [];
        discard.push(...discarded);
        await sb.from("game_players").update({ hand, discard_pile: discard }).eq("id", target.id);
        target.hand = hand;
        target.discard_pile = discard;
      }
      break;
    }
  }
}
async function amplifyWorstAffliction(gameId, targetId, amount) {
  const sb = getServerSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", targetId).in("effect_type", ["damage", "self_damage"]);
  if (effects && effects.length > 0) {
    const worst = effects.sort((a, b) => b.base_value - a.base_value)[0];
    await sb.from("active_effects").update({ base_value: worst.base_value + amount }).eq("id", worst.id);
  }
}
async function amplifyWorstAfflictionPct(gameId, targetId, pct) {
  const sb = getServerSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", targetId).in("effect_type", ["damage", "self_damage"]);
  if (effects && effects.length > 0) {
    const worst = effects.sort((a, b) => b.base_value - a.base_value)[0];
    const newValue = Math.round(worst.base_value * (1 + pct));
    await sb.from("active_effects").update({ base_value: newValue }).eq("id", worst.id);
  }
}
async function drawCard(player) {
  const sb = getServerSupabase();
  let deck = player.deck || [];
  const hand = player.hand || [];
  let discard = player.discard_pile || [];
  if (deck.length === 0 && discard.length > 0) {
    deck = shuffleDeck(discard);
    discard = [];
  }
  if (deck.length > 0) {
    const drawn = deck.shift();
    hand.push(drawn);
    await sb.from("game_players").update({ hand, deck, discard_pile: discard }).eq("id", player.id);
  }
}
async function advanceRound(gameId) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) return;
  const { data: allPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  if (!allPlayers) return;
  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  if (alivePlayers.length <= 1) {
    const winner = alivePlayers[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: (/* @__PURE__ */ new Date()).toISOString(),
      turn_phase: "round_end"
    }).eq("id", gameId);
    return;
  }
  const newRound = game.current_round + 1;
  if (newRound > MAX_ROUNDS) {
    const sortedByHp = [...alivePlayers].sort((a, b) => b.current_hp - a.current_hp);
    const winner = sortedByHp[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: (/* @__PURE__ */ new Date()).toISOString(),
      current_round: MAX_ROUNDS,
      turn_phase: "round_end"
    }).eq("id", gameId);
    return;
  }
  if (newRound === ROUND_16_DOUBLING) {
    await doubleAllAfflictions(gameId);
  }
  await resolveActiveEffects(gameId, newRound);
  const { data: postEffectPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  const stillAlive = (postEffectPlayers || []).filter((p) => p.is_alive);
  if (stillAlive.length <= 1) {
    const winner = stillAlive[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: (/* @__PURE__ */ new Date()).toISOString(),
      turn_phase: "round_end"
    }).eq("id", gameId);
    return;
  }
  for (const p of stillAlive) {
    const { data: freshPlayer } = await sb.from("game_players").select("*").eq("id", p.id).single();
    if (freshPlayer && freshPlayer.is_alive) {
      if (freshPlayer.chosen_sin === "sloth") {
        const energy = freshPlayer.current_energy ?? 0;
        const handSize = (freshPlayer.hand || []).length;
        const shieldVal = Math.min(Math.round(energy * handSize * SLOTH_ENDURANCE_MULT), SLOTH_ENDURANCE_CAP);
        if (shieldVal > 0) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: freshPlayer.id,
            source_player_id: freshPlayer.id,
            effect_type: "shield_gain",
            base_value: shieldVal,
            applied_at_round: newRound,
            duration_rounds: 1,
            card_id: "sloth-endurance-v5"
          });
        }
      }
      await refreshPlayerEnergy(freshPlayer);
      await drawCard(freshPlayer);
    }
  }
  for (const p of allPlayers) {
    await sb.from("game_players").update({ locked_cards: [], consumed_this_round: false }).eq("id", p.id);
  }
  await sb.from("games").update({
    current_round: newRound,
    current_player_index: 0,
    turn_phase: "selection",
    locked_plays: []
  }).eq("id", gameId);
}
async function refreshPlayerEnergy(player) {
  const sb = getServerSupabase();
  const totalEnergy = MAX_ENERGY;
  await sb.from("game_players").update({
    current_energy: totalEnergy,
    max_energy: totalEnergy,
    bonus_energy: 0
  }).eq("id", player.id);
}
async function doubleAllAfflictions(gameId) {
  const sb = getServerSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId);
  if (!effects) return;
  for (const effect of effects) {
    if (["damage", "self_damage"].includes(effect.effect_type) && !effect.doubled) {
      await sb.from("active_effects").update({ base_value: effect.base_value * 2, doubled: true }).eq("id", effect.id);
    }
  }
}
async function resolveActiveEffects(gameId, currentRound) {
  const sb = getServerSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId);
  if (!effects) return;
  for (const effect of effects) {
    if (["shield_gain", "heal_block", "shield_block", "energy_block"].includes(effect.effect_type)) {
      if (effect.effect_type.endsWith("_block")) {
        const roundsActive = currentRound - effect.applied_at_round;
        if (roundsActive > effect.duration_rounds) {
          await sb.from("active_effects").delete().eq("id", effect.id);
        }
      }
      continue;
    }
    const tick = effect.current_tick ?? 0;
    const pattern = effect.compound_pattern || "standard";
    if (tick >= effect.duration_rounds) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }
    const { data: target } = await sb.from("game_players").select("*").eq("id", effect.target_player_id).single();
    if (!target || !target.is_alive) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }
    const tickValue = getCompoundTickValue(effect.base_value, pattern, tick);
    await applyInstantEffect(effect.effect_type, tickValue, target, gameId, effect.source_player_id);
    if (["damage"].includes(effect.effect_type) && effect.source_player_id) {
      const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", effect.source_player_id).eq("game_id", gameId).single();
      if (sourcePlayer && sourcePlayer.chosen_sin === "lust" && sourcePlayer.is_alive) {
        const healAmt = Math.round(tickValue * LUST_TEMPTATION_PCT);
        if (healAmt > 0) {
          await applyInstantEffect("heal_gain", healAmt, sourcePlayer, gameId, effect.source_player_id);
        }
      }
    }
    if (["damage"].includes(effect.effect_type) && tick === GREED_TAX_TICK && effect.source_player_id) {
      const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", effect.source_player_id).eq("game_id", gameId).single();
      if (sourcePlayer && sourcePlayer.chosen_sin === "greed" && sourcePlayer.is_alive) {
        const shieldAmt = Math.round(tickValue * GREED_TAX_PCT);
        if (shieldAmt > 0) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: sourcePlayer.id,
            source_player_id: sourcePlayer.id,
            effect_type: "shield_gain",
            base_value: shieldAmt,
            applied_at_round: currentRound,
            duration_rounds: 1,
            card_id: "greed-tax-v5"
          });
        }
      }
    }
    const nextTick = tick + 1;
    if (nextTick >= effect.duration_rounds) {
      await sb.from("active_effects").delete().eq("id", effect.id);
    } else {
      await sb.from("active_effects").update({ current_tick: nextTick }).eq("id", effect.id);
    }
  }
}

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  /** Discussion comments — threaded community discussion on analysis pages */
  discussion: router({
    /** List all comments for a page context (e.g. "balance") */
    list: publicProcedure.input(z3.object({ pageContext: z3.string().min(1).max(64).default("balance") })).query(async ({ input }) => {
      return getDiscussionComments(input.pageContext);
    }),
    /** Create a new comment or reply */
    create: publicProcedure.input(
      z3.object({
        pageContext: z3.string().min(1).max(64).default("balance"),
        section: z3.string().max(64).optional(),
        parentId: z3.number().int().positive().optional(),
        authorName: z3.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")),
        guestId: z3.string().max(64).optional(),
        content: z3.string().min(1).max(2e3).transform((s) => s.replace(/[<>"']/g, ""))
      })
    ).mutation(async ({ input }) => {
      const result = await createDiscussionComment({
        pageContext: input.pageContext,
        section: input.section ?? null,
        parentId: input.parentId ?? null,
        userId: null,
        // Guest comments for now; wire to ctx.user when auth is active
        authorName: input.authorName,
        guestId: input.guestId ?? null,
        content: input.content
      });
      return result;
    }),
    /** Delete a comment (and its replies) */
    delete: publicProcedure.input(z3.object({ commentId: z3.number().int().positive() })).mutation(async ({ input }) => {
      return deleteDiscussionComment(input.commentId);
    }),
    /** Upvote a comment */
    upvote: publicProcedure.input(z3.object({ commentId: z3.number().int().positive() })).mutation(async ({ input }) => {
      return upvoteDiscussionComment(input.commentId);
    })
  }),
  /** Player deck management — CRUD for custom 30-card decks */
  deck: router({
    /** List all decks for a Supabase user */
    list: publicProcedure.input(z3.object({ supabaseUserId: z3.string().min(1).max(64) })).query(async ({ input }) => {
      return getDecksByUser(input.supabaseUserId);
    }),
    /** Get a single deck by ID */
    get: publicProcedure.input(z3.object({ deckId: z3.number().int().positive() })).query(async ({ input }) => {
      return getDeckById(input.deckId) ?? null;
    }),
    /** Create a new deck (30 cards from a single faction) */
    create: publicProcedure.input(
      z3.object({
        supabaseUserId: z3.string().min(1).max(64),
        faction: z3.string().min(1).max(32),
        name: z3.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")),
        cardIds: z3.string().min(2),
        // JSON array string
        isActive: z3.number().int().min(0).max(1).default(0)
      })
    ).mutation(async ({ input }) => {
      let parsed;
      try {
        parsed = JSON.parse(input.cardIds);
      } catch {
        throw new Error("cardIds must be a valid JSON array");
      }
      if (!Array.isArray(parsed) || parsed.length !== 30) {
        throw new Error("Deck must contain exactly 30 cards");
      }
      return createDeck(input);
    }),
    /** Update an existing deck */
    update: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        supabaseUserId: z3.string().min(1).max(64),
        // for ownership check
        name: z3.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")).optional(),
        cardIds: z3.string().min(2).optional()
      })
    ).mutation(async ({ input }) => {
      const deck = await getDeckById(input.deckId);
      if (!deck || deck.supabaseUserId !== input.supabaseUserId) {
        throw new Error("Deck not found or access denied");
      }
      if (input.cardIds) {
        let parsed;
        try {
          parsed = JSON.parse(input.cardIds);
        } catch {
          throw new Error("cardIds must be a valid JSON array");
        }
        if (!Array.isArray(parsed) || parsed.length !== 30) {
          throw new Error("Deck must contain exactly 30 cards");
        }
      }
      const updateData = {};
      if (input.name) updateData.name = input.name;
      if (input.cardIds) updateData.cardIds = input.cardIds;
      return updateDeck(input.deckId, updateData);
    }),
    /** Delete a deck */
    delete: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        supabaseUserId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      const deck = await getDeckById(input.deckId);
      if (!deck || deck.supabaseUserId !== input.supabaseUserId) {
        throw new Error("Deck not found or access denied");
      }
      return deleteDeck(input.deckId);
    }),
    /** Set a deck as the active deck for a user+faction */
    setActive: publicProcedure.input(
      z3.object({
        supabaseUserId: z3.string().min(1).max(64),
        faction: z3.string().min(1).max(32),
        deckId: z3.number().int().positive()
      })
    ).mutation(async ({ input }) => {
      return setActiveDeck(input.supabaseUserId, input.faction, input.deckId);
    })
  }),
  /** User account management — data purge for GDPR compliance */
  user: router({
    /** Purge ALL user data — decks, comments, game history. Real deletion, not fake. */
    purge: publicProcedure.input(
      z3.object({
        supabaseUserId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      const result = await deleteAllUserData(input.supabaseUserId);
      return {
        success: true,
        ...result,
        message: `Purged ${result.decksDeleted} decks and ${result.commentsDeleted} comments.`
      };
    })
  }),
  /** Blog — public SEO content */
  blog: router({
    /** List paginated blog posts with optional category filter and search */
    list: publicProcedure.input(
      z3.object({
        page: z3.number().int().positive().default(1),
        limit: z3.number().int().min(1).max(100).default(20),
        category: z3.string().max(64).optional(),
        search: z3.string().max(200).optional()
      })
    ).query(async ({ input }) => {
      return getBlogPosts(input);
    }),
    /** Get a single blog post by slug */
    getBySlug: publicProcedure.input(z3.object({ slug: z3.string().min(1).max(255) })).query(async ({ input }) => {
      return getBlogPostBySlug(input.slug) ?? null;
    }),
    /** Get related posts (same category) */
    related: publicProcedure.input(
      z3.object({
        category: z3.string().min(1).max(64),
        excludeSlug: z3.string().min(1).max(255),
        limit: z3.number().int().min(1).max(10).default(5)
      })
    ).query(async ({ input }) => {
      return getRelatedPosts(input.category, input.excludeSlug, input.limit);
    }),
    /** Get category counts for sidebar */
    categories: publicProcedure.query(async () => {
      return getBlogCategoryCounts();
    }),
    /** Get all slugs for sitemap */
    allSlugs: publicProcedure.query(async () => {
      return getAllBlogSlugs();
    })
  }),
  game: router({
    /** Create a new game lobby and get the room code */
    create: publicProcedure.input(z3.object({ username: z3.string().min(1).max(20).transform((s) => s.replace(/[<>"'&]/g, "")), playerId: z3.string().min(1).max(64) })).mutation(async ({ input }) => {
      return createGame(input.playerId, input.username);
    }),
    /** Join an existing game by room code */
    join: publicProcedure.input(
      z3.object({
        roomCode: z3.string().min(4).max(8).regex(/^[A-Z0-9]+$/i),
        username: z3.string().min(1).max(20).transform((s) => s.replace(/[<>"'&]/g, "")),
        playerId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      return joinGame(input.roomCode, input.playerId, input.username);
    }),
    /** Choose your sin (Wrath or Sloth) */
    chooseSin: publicProcedure.input(
      z3.object({
        gameId: z3.string().uuid(),
        sin: z3.enum(["wrath", "sloth", "greed", "envy"]),
        playerId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      await chooseSin(input.gameId, input.playerId, input.sin);
      return { success: true };
    }),
    /** Start the game (requires all players to have chosen sins) */
    start: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).mutation(async ({ input }) => {
      await startGame(input.gameId);
      return { success: true };
    }),
    /** Play a card from hand */
    playCard: publicProcedure.input(
      z3.object({
        gameId: z3.string().uuid(),
        cardId: z3.string().max(64),
        playerId: z3.string().min(1).max(64),
        targetPlayerId: z3.string().max(64).optional()
      })
    ).mutation(async ({ input }) => {
      return playCard(input.gameId, input.playerId, input.cardId, input.targetPlayerId);
    }),
    /** Pass your turn (draws a card) */
    pass: publicProcedure.input(z3.object({ gameId: z3.string().uuid(), playerId: z3.string().min(1).max(64) })).mutation(async ({ input }) => {
      await passTurn(input.gameId, input.playerId);
      return { success: true };
    }),
    /** Consume (banish) a card from hand for +1 energy. Max 1 per round. */
    consume: publicProcedure.input(
      z3.object({
        gameId: z3.string().uuid(),
        playerId: z3.string().min(1).max(64),
        cardId: z3.string().max(64)
      })
    ).mutation(async ({ input }) => {
      return consumeCard(input.gameId, input.playerId, input.cardId);
    }),
    /** Get the full game state */
    getState: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).query(async ({ input }) => {
      return getGameState(input.gameId);
    }),
    /** Get game action log */
    getLog: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).query(async ({ input }) => {
      return getGameLog(input.gameId);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// api/_source.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const slugs = await getAllBlogSlugs();
    const baseUrl = "https://www.7sinscardgame.com";
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/blog", priority: "0.9", changefreq: "daily" },
      { loc: "/collection", priority: "0.8", changefreq: "monthly" },
      { loc: "/balance", priority: "0.7", changefreq: "monthly" },
      { loc: "/matchups", priority: "0.7", changefreq: "monthly" },
      { loc: "/rules", priority: "0.8", changefreq: "monthly" },
      { loc: "/changelog", priority: "0.5", changefreq: "weekly" },
      { loc: "/deck-builder", priority: "0.7", changefreq: "monthly" }
    ];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    for (const page of staticPages) {
      xml += `  <url>
`;
      xml += `    <loc>${baseUrl}${page.loc}</loc>
`;
      xml += `    <changefreq>${page.changefreq}</changefreq>
`;
      xml += `    <priority>${page.priority}</priority>
`;
      xml += `  </url>
`;
    }
    for (const { slug, updatedAt } of slugs) {
      const lastmod = updatedAt ? new Date(updatedAt).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      xml += `  <url>
`;
      xml += `    <loc>${baseUrl}/blog/${slug}</loc>
`;
      xml += `    <lastmod>${lastmod}</lastmod>
`;
      xml += `    <changefreq>monthly</changefreq>
`;
      xml += `    <priority>0.6</priority>
`;
      xml += `  </url>
`;
    }
    xml += `</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).send("Error generating sitemap");
  }
});
app.get("/rss.xml", async (_req, res) => {
  try {
    const posts = await getRecentBlogPosts(50);
    const baseUrl = "https://www.7sinscardgame.com";
    const now = posts.length > 0 && posts[0].publishedAt ? new Date(posts[0].publishedAt).toUTCString() : (/* @__PURE__ */ new Date()).toUTCString();
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
`;
    rss += `<channel>
`;
    rss += `  <title>7 Deadly Sins Card Game - Lore &amp; Strategy</title>
`;
    rss += `  <link>${baseUrl}/blog</link>
`;
    rss += `  <description>Dark fantasy lore, strategy guides, and mythology from the world of the 7 Deadly Sins Card Game.</description>
`;
    rss += `  <language>en-us</language>
`;
    rss += `  <lastBuildDate>${now}</lastBuildDate>
`;
    rss += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;
    rss += `  <image>
`;
    rss += `    <url>https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/og-banner-7a8HHUKyS9YrWQLuM7Cgyi.png</url>
`;
    rss += `    <title>7 Deadly Sins Card Game</title>
`;
    rss += `    <link>${baseUrl}</link>
`;
    rss += `  </image>
`;
    for (const post of posts) {
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : now;
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const desc2 = (post.metaDescription || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const title = (post.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      rss += `  <item>
`;
      rss += `    <title>${title}</title>
`;
      rss += `    <link>${postUrl}</link>
`;
      rss += `    <guid isPermaLink="true">${postUrl}</guid>
`;
      rss += `    <pubDate>${pubDate}</pubDate>
`;
      rss += `    <description>${desc2}</description>
`;
      rss += `    <category>${post.category}</category>
`;
      if (post.featuredImage) {
        rss += `    <enclosure url="${post.featuredImage}" type="image/webp" length="0" />
`;
      }
      rss += `  </item>
`;
    }
    rss += `</channel>
`;
    rss += `</rss>`;
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(rss);
  } catch (err) {
    console.error("RSS feed generation error:", err);
    res.status(500).send("Error generating RSS feed");
  }
});
registerOAuthRoutes(app);
registerChatRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var source_default = app;
export {
  source_default as default
};
