/**
 * Faction Portrait CDN URLs
 * AI-generated dark fantasy character portraits for each sin faction.
 * Used in Lobby faction selection, player panels, and game-over screen.
 */

import type { SinType } from "@shared/gameTypes";

export const FACTION_PORTRAITS: Record<SinType, string> = {
  wrath: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/portrait-wrath-UUdSq7eRDqV7smwTmjBD5E.webp",
  sloth: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/portrait-sloth-CQAwa24NWgatVTM9dXsyn4.webp",
  greed: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/portrait-greed-mC5SaVDaKPwEMeiezc9J2y.webp",
  envy: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/portrait-envy-j56DHX69cHjWm4otQECCqS.webp",
};

/** Full-resolution versions for hero/detail views */
export const FACTION_PORTRAITS_HD: Record<SinType, string> = {
  wrath: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/portrait-wrath-7KfkEmib2nUuBmYHSQg3Hm.png",
  sloth: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/portrait-sloth-NEqdcvpaUczw2L9TYc8C8H.png",
  greed: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/portrait-greed-jSFJWxFcaGcVYqaNandndy.png",
  envy: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/portrait-envy-YEYyKe3bq2NYsdByx3SdL5.png",
};
