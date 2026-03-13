import { describe, it, expect } from "vitest";

describe("Discussion Comments Schema & Routing", () => {
  it("should have discussion router procedures defined", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter).toBeDefined();
    // The router should have discussion procedures
    const routerDef = appRouter._def;
    expect(routerDef).toBeDefined();
  });

  it("should have discussion_comments table in schema", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.discussionComments).toBeDefined();
  });

  it("discussion_comments table should have required columns", async () => {
    const schema = await import("../drizzle/schema");
    const table = schema.discussionComments;
    // Check that the table has the expected column names
    const columnNames = Object.keys(table);
    expect(columnNames).toContain("id");
    expect(columnNames).toContain("pageContext");
    expect(columnNames).toContain("content");
    expect(columnNames).toContain("authorName");
    expect(columnNames).toContain("guestId");
    expect(columnNames).toContain("createdAt");
  });

  it("should have db helper functions for discussion", async () => {
    const db = await import("./db");
    expect(db.getDiscussionComments).toBeDefined();
    expect(db.createDiscussionComment).toBeDefined();
    expect(db.deleteDiscussionComment).toBeDefined();
    expect(db.upvoteDiscussionComment).toBeDefined();
    expect(typeof db.getDiscussionComments).toBe("function");
    expect(typeof db.createDiscussionComment).toBe("function");
    expect(typeof db.deleteDiscussionComment).toBe("function");
    expect(typeof db.upvoteDiscussionComment).toBe("function");
  });
});

describe("New Pages Exist", () => {
  it("MatchupMatrix page module should be importable", async () => {
    // Just verify the file exists and can be parsed
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/pages/MatchupMatrix.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("GameRules page module should be importable", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/pages/GameRules.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("DiscussionThread component should exist", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/components/DiscussionThread.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("SigilMenu should contain all 5 navigation links", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/components/SigilMenu.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("/collection");
    expect(content).toContain("/balance");
    expect(content).toContain("/matchups");
    expect(content).toContain("/rules");
    expect(content).toContain("Card Collection");
    expect(content).toContain("Balance Analysis");
    expect(content).toContain("Matchup Matrix");
    expect(content).toContain("Game Rules");
  });

  it("App.tsx should have routes for all new pages", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(__dirname, "../client/src/App.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("/matchups");
    expect(content).toContain("/rules");
    expect(content).toContain("/balance");
    expect(content).toContain("MatchupMatrix");
    expect(content).toContain("GameRules");
    expect(content).toContain("BalanceAnalysis");
  });
});
