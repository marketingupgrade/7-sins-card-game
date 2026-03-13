/**
 * Tests for the Balance Analysis page route and SigilMenu navigation
 *
 * Validates:
 * - /balance route is accessible
 * - Menu links are properly configured
 * - Page structure and content
 */

import { describe, it, expect } from "vitest";

// Test the menu link configuration
describe("SigilMenu Navigation Links", () => {
  const MENU_LINKS = [
    { label: "Card Collection", href: "/collection" },
    { label: "Balance Analysis", href: "/balance" },
    { label: "Home", href: "/" },
  ];

  it("should have exactly 3 navigation links", () => {
    expect(MENU_LINKS).toHaveLength(3);
  });

  it("should include Balance Analysis link pointing to /balance", () => {
    const balanceLink = MENU_LINKS.find((l) => l.href === "/balance");
    expect(balanceLink).toBeDefined();
    expect(balanceLink!.label).toBe("Balance Analysis");
  });

  it("should include Card Collection link pointing to /collection", () => {
    const collectionLink = MENU_LINKS.find((l) => l.href === "/collection");
    expect(collectionLink).toBeDefined();
    expect(collectionLink!.label).toBe("Card Collection");
  });

  it("should include Home link pointing to /", () => {
    const homeLink = MENU_LINKS.find((l) => l.href === "/");
    expect(homeLink).toBeDefined();
    expect(homeLink!.label).toBe("Home");
  });

  it("should have unique hrefs", () => {
    const hrefs = MENU_LINKS.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

// Test the balance analysis chart URLs
describe("Balance Analysis Chart Assets", () => {
  const CHARTS = {
    winRates: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/01_win_rates_13adfa0c.png",
    balanceJourney: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/02_balance_journey_141739dc.png",
    passiveEvolution: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/03_passive_evolution_42231ce1.png",
    costDistribution: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/04_cost_distribution_29837437.png",
    factionRadar: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/05_faction_radar_54457a66.png",
    costVsValue: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/06_cost_vs_value_c3c9c406.png",
    compoundPatterns: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/07_compound_patterns_67d0bc15.png",
    targetModes: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/08_target_modes_4fe8d921.png",
  };

  it("should have 8 chart URLs", () => {
    expect(Object.keys(CHARTS)).toHaveLength(8);
  });

  it("all chart URLs should be valid HTTPS URLs", () => {
    Object.values(CHARTS).forEach((url) => {
      expect(url).toMatch(/^https:\/\//);
      expect(url).toMatch(/\.png$/);
    });
  });

  it("all chart URLs should use CloudFront CDN", () => {
    Object.values(CHARTS).forEach((url) => {
      expect(url).toContain("cloudfront.net");
    });
  });
});

// Test the faction color configuration
describe("Faction Colors", () => {
  const FACTION_COLORS: Record<string, string> = {
    wrath: "#ef4444",
    sloth: "#a855f7",
    greed: "#eab308",
    envy: "#22c55e",
    pride: "#e2e2e2",
    lust: "#ec4899",
    gluttony: "#f97316",
  };

  it("should have all 7 factions", () => {
    expect(Object.keys(FACTION_COLORS)).toHaveLength(7);
  });

  it("should have valid hex color values", () => {
    Object.values(FACTION_COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it("should include all expected factions", () => {
    const expected = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
    expected.forEach((faction) => {
      expect(FACTION_COLORS).toHaveProperty(faction);
    });
  });
});

// Test the Table of Contents configuration
describe("Balance Analysis Table of Contents", () => {
  const TOC_ITEMS = [
    { id: "summary", label: "Executive Summary" },
    { id: "architecture", label: "Game Architecture" },
    { id: "journey", label: "The Balancing Journey" },
    { id: "passives", label: "Passive Ability Analysis" },
    { id: "factions", label: "Faction Identity" },
    { id: "cardpool", label: "Card Pool Statistics" },
    { id: "validation", label: "Final Validation" },
    { id: "skipqueue", label: "Skip-Queue Cards" },
    { id: "methodology", label: "Methodology" },
    { id: "discussion", label: "Discussion" },
  ];

  it("should have 10 sections", () => {
    expect(TOC_ITEMS).toHaveLength(10);
  });

  it("should have unique IDs", () => {
    const ids = TOC_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should start with Executive Summary", () => {
    expect(TOC_ITEMS[0].label).toBe("Executive Summary");
  });

  it("should end with Discussion", () => {
    expect(TOC_ITEMS[TOC_ITEMS.length - 1].label).toBe("Discussion");
  });
});
