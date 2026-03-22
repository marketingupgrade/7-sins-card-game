/**
 * Gemini API Key Validation Test
 *
 * Validates that the GOOGLE_GENERATIVE_AI_API_KEY env var is set
 * and can successfully call the Gemini API.
 */
import { describe, it, expect } from "vitest";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

describe("Gemini API Key Validation", () => {
  it("should have GOOGLE_GENERATIVE_AI_API_KEY set", () => {
    expect(process.env.GOOGLE_GENERATIVE_AI_API_KEY).toBeDefined();
    expect(process.env.GOOGLE_GENERATIVE_AI_API_KEY!.length).toBeGreaterThan(10);
  });

  it("should successfully call Gemini API", async () => {
    const model = google("gemini-2.0-flash");
    const { text } = await generateText({
      model,
      prompt: "Reply with exactly one word: hello",
      maxOutputTokens: 10,
    });
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(0);
  }, 15000); // 15s timeout for API call
});
