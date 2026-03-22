# Imagen API Research

## REST Endpoint
POST https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict
Header: x-goog-api-key: $GEMINI_API_KEY

## Request Body
```json
{
  "instances": [{ "prompt": "..." }],
  "parameters": {
    "sampleCount": 1,
    "aspectRatio": "16:9"
  }
}
```

## Response
Returns base64 encoded image bytes in generatedImages array.

## JavaScript SDK
```js
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});
const response = await ai.models.generateImages({
  model: 'imagen-4.0-generate-001',
  prompt: 'Robot holding a red skateboard',
  config: { numberOfImages: 1 },
});
// response.generatedImages[0].image.imageBytes (base64)
```

## Config Options
- numberOfImages: 1-4 (default 4)
- aspectRatio: "1:1", "3:4", "4:3", "9:16", "16:9" (default "1:1")
- personGeneration: "dont_allow", "allow_adult"

## Key: uses GOOGLE_GENERATIVE_AI_API_KEY (same key as Gemini text)
