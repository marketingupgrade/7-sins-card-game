/**
 * Chronicle Cover Art Generator
 *
 * Generates unique AI illustrations for each chronicle using Google Imagen 4.0.
 * Art style is themed to the civilization type and rarity tier.
 *
 * Pipeline:
 *   1. Build a detailed art prompt from chronicle metadata
 *   2. Generate image via Imagen 4.0 API
 *   3. Upload to S3 storage
 *   4. Save URL to Supabase chronicles table
 *
 * Graceful fallback: if generation fails, chronicle works without cover art.
 */

import { GoogleGenAI } from "@google/genai";
import { storagePut } from "./storage";
import type { CivilizationType, ChronicleRarity } from "../shared/chronicleTypes";
import type { SinType } from "../shared/gameTypes";

// ---- Imagen Client ----

function getImagenClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not configured");
  }
  return new GoogleGenAI({ apiKey });
}

// ---- Art Style System ----

/**
 * Each civilization type has a distinct visual language.
 * These map to art direction keywords for the image model.
 */
const CIVILIZATION_ART_STYLES: Record<CivilizationType, {
  palette: string;
  medium: string;
  atmosphere: string;
  motifs: string[];
}> = {
  warrior_empire: {
    palette: "deep crimson, burnt umber, iron grey, blood orange, charcoal black",
    medium: "oil painting on weathered canvas, dramatic chiaroscuro lighting",
    atmosphere: "smoke rising from distant battlefields, ominous storm clouds, shafts of red sunlight",
    motifs: ["broken swords", "siege towers", "war banners", "fortress walls", "marching armies"],
  },
  enlightened_republic: {
    palette: "celestial blue, ivory white, gold leaf, soft violet, pearl grey",
    medium: "Renaissance fresco style, luminous and ethereal, sfumato technique",
    atmosphere: "golden hour light streaming through marble columns, clear skies with cirrus clouds",
    motifs: ["towering libraries", "astronomical instruments", "laurel wreaths", "open scrolls", "domed temples"],
  },
  merchant_federation: {
    palette: "rich amber, deep emerald, burnished gold, mahogany brown, sapphire blue",
    medium: "Dutch Golden Age painting style, rich textures, warm candlelight",
    atmosphere: "bustling harbor at sunset, ships with billowing sails, lantern-lit counting houses",
    motifs: ["overflowing treasure chests", "merchant ships", "scales and weights", "silk caravans", "market squares"],
  },
  balanced: {
    palette: "muted earth tones, twilight purple, aged bronze, sage green, dusty rose",
    medium: "mixed media illustration, combining woodcut and watercolor, layered textures",
    atmosphere: "twilight at a crossroads, where four paths meet under an ancient tree",
    motifs: ["intertwined roots", "balanced scales", "four-faced monuments", "winding rivers", "ancient maps"],
  },
};

/**
 * Rarity tiers add visual intensity modifiers.
 * Higher rarity = more dramatic, more detailed, more luminous.
 */
const RARITY_ART_MODIFIERS: Record<ChronicleRarity, {
  intensity: string;
  detail: string;
  specialEffect: string;
}> = {
  common: {
    intensity: "subdued, understated",
    detail: "clean composition, moderate detail",
    specialEffect: "none",
  },
  rare: {
    intensity: "vivid, striking",
    detail: "intricate details, rich textures",
    specialEffect: "subtle golden light emanating from the horizon",
  },
  epic: {
    intensity: "dramatic, awe-inspiring",
    detail: "highly detailed, masterwork quality, every surface textured",
    specialEffect: "ethereal purple aurora in the sky, mystical energy radiating from the center",
  },
  legendary: {
    intensity: "transcendent, mythic, overwhelming",
    detail: "museum-quality detail, photorealistic textures with painterly composition",
    specialEffect: "divine golden light breaking through storm clouds, celestial phenomena, the sky itself seems alive",
  },
};

/**
 * Faction-specific visual elements that can appear in the art
 * based on which factions dominated the match.
 */
const FACTION_VISUAL_ELEMENTS: Record<SinType, string> = {
  wrath: "flames and destruction, shattered armor, a blood-red sun",
  sloth: "overgrown ruins, creeping vines, a civilization frozen in amber",
  greed: "mountains of gold coins, jeweled crowns, overflowing vaults",
  envy: "shadowy figures watching from mirrors, green-tinted fog, stolen crowns",
  pride: "impossibly tall towers reaching into clouds, golden thrones, radiant monuments",
  lust: "intertwined roses and thorns, silk banners, moonlit gardens",
  gluttony: "overflowing banquet tables, expanding borders on a map, consumed landscapes",
};

// ---- Prompt Builder ----

/**
 * Builds a detailed image generation prompt from chronicle metadata.
 * The prompt is designed to produce a book-cover-quality illustration
 * that captures the essence of the alternate history.
 */
export function buildCoverArtPrompt(params: {
  title: string;
  civilizationType: CivilizationType;
  rarityTier: ChronicleRarity;
  dominantFactions: SinType[];
  turningPointRound: number;
  totalEliminations: number;
  excerpt?: string;
}): string {
  const civStyle = CIVILIZATION_ART_STYLES[params.civilizationType];
  const rarityMod = RARITY_ART_MODIFIERS[params.rarityTier];

  // Pick 2-3 motifs from the civilization style
  const motifs = civStyle.motifs
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .join(", ");

  // Add faction visual elements for dominant factions (max 2)
  const factionVisuals = params.dominantFactions
    .slice(0, 2)
    .map((f) => FACTION_VISUAL_ELEMENTS[f])
    .join("; ");

  // Determine the era feel based on turning point
  const eraFeel = params.turningPointRound <= 7
    ? "ancient and primordial, stone and bronze"
    : params.turningPointRound <= 14
      ? "medieval to industrial, iron and steam"
      : "modern to futuristic, glass and light";

  const prompt = [
    // Core subject
    `A dramatic book cover illustration for an alternate history chronicle titled "${params.title}".`,
    // Art style
    `Art style: ${civStyle.medium}. ${rarityMod.intensity}.`,
    // Color palette
    `Color palette: ${civStyle.palette}.`,
    // Atmosphere
    `Atmosphere: ${civStyle.atmosphere}.`,
    // Key visual elements
    `Key elements in the composition: ${motifs}.`,
    // Faction influence
    factionVisuals ? `Visual influences: ${factionVisuals}.` : "",
    // Era feel
    `The overall era feel is ${eraFeel}.`,
    // Detail level
    `Detail level: ${rarityMod.detail}.`,
    // Special effects for higher rarities
    rarityMod.specialEffect !== "none" ? `Special visual effect: ${rarityMod.specialEffect}.` : "",
    // Composition rules
    "Composition: wide cinematic aspect ratio, rule of thirds, strong focal point in the center.",
    "No text, no letters, no words, no watermarks. Pure illustration.",
    // Quality
    "Professional quality, suitable for a published book cover.",
  ]
    .filter(Boolean)
    .join(" ");

  return prompt;
}

// ---- Image Generation ----

/**
 * Generate cover art for a chronicle.
 * Returns the base64 image bytes, or null if generation fails.
 */
async function generateCoverImage(prompt: string): Promise<Buffer | null> {
  try {
    const ai = getImagenClient();
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "16:9",
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) {
      console.warn("[CoverArt] No image bytes returned from Imagen API");
      return null;
    }

    return Buffer.from(imageBytes, "base64");
  } catch (error: any) {
    console.error("[CoverArt] Image generation failed:", error?.message || error);
    return null;
  }
}

// ---- Upload & Save ----

/**
 * Upload cover art to S3 and return the public URL.
 */
async function uploadCoverArt(imageBuffer: Buffer, gameId: string): Promise<string | null> {
  try {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileKey = `chronicle-covers/${gameId}-${randomSuffix}.png`;
    const { url } = await storagePut(fileKey, imageBuffer, "image/png");
    return url;
  } catch (error: any) {
    console.error("[CoverArt] Upload failed:", error?.message || error);
    return null;
  }
}

/**
 * Save the cover art URL to the Supabase chronicles table.
 */
async function saveCoverArtUrl(gameId: string, coverUrl: string): Promise<void> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
  );

  const { error } = await supabase
    .from("chronicles")
    .update({ cover_image_url: coverUrl })
    .eq("game_id", gameId);

  if (error) {
    console.error("[CoverArt] Failed to save URL to database:", error);
  }
}

// ---- Public API ----

/**
 * Generate and save cover art for a chronicle.
 * This is the main entry point called from the chronicle assembly pipeline.
 *
 * Fire-and-forget: never blocks gameplay. Failures are logged but not thrown.
 *
 * @returns The cover art URL, or null if generation failed.
 */
export async function generateAndSaveCoverArt(params: {
  gameId: string;
  title: string;
  civilizationType: CivilizationType;
  rarityTier: ChronicleRarity;
  dominantFactions: SinType[];
  turningPointRound: number;
  totalEliminations: number;
  excerpt?: string;
}): Promise<string | null> {
  const startTime = Date.now();

  try {
    // Step 1: Build the prompt
    const prompt = buildCoverArtPrompt(params);
    console.log(`[CoverArt] Generating cover for game ${params.gameId} (${params.civilizationType}, ${params.rarityTier})`);

    // Step 2: Generate the image
    const imageBuffer = await generateCoverImage(prompt);
    if (!imageBuffer) {
      console.warn(`[CoverArt] No image generated for game ${params.gameId}`);
      return null;
    }

    console.log(`[CoverArt] Image generated (${imageBuffer.length} bytes) in ${Date.now() - startTime}ms`);

    // Step 3: Upload to S3
    const coverUrl = await uploadCoverArt(imageBuffer, params.gameId);
    if (!coverUrl) {
      console.warn(`[CoverArt] Upload failed for game ${params.gameId}`);
      return null;
    }

    // Step 4: Save URL to database
    await saveCoverArtUrl(params.gameId, coverUrl);

    console.log(`[CoverArt] Cover art saved for game ${params.gameId}: ${coverUrl}`);
    return coverUrl;
  } catch (error: any) {
    console.error(`[CoverArt] Failed for game ${params.gameId}:`, error?.message || error);
    return null;
  }
}
