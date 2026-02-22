import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ClassificationResult } from '../../types';

// ─── Point system ─────────────────────────────────────────────────────────────

export const pointsByCategory: Record<string, number> = {
  plastic:    15,
  paper:      10,
  glass:      20,
  metal:      25,
  organic:     8,
  electronic: 30,
  hazardous:  20,
  textile:    12,
  general:     5,
};

// ─── Classification prompt ────────────────────────────────────────────────────

const CLASSIFY_PROMPT = `You are an expert AI waste classification system for a smart waste management app.

Analyze the image and classify the waste item shown. Respond ONLY with a valid JSON object, no markdown or extra text.

JSON format:
{
  "wasteType": "specific name of the item (e.g., Plastic Water Bottle)",
  "category": "one of: plastic, paper, glass, metal, organic, electronic, hazardous, textile, general",
  "recyclable": true or false,
  "confidence": percentage number 0-100,
  "color": "hex color representing this waste type (e.g., #3B82F6 for plastic)",
  "instructions": ["step 1 instruction", "step 2 instruction", "step 3 instruction"],
  "tips": "one short eco-tip related to this item",
  "binColor": "which bin to use (e.g., Blue Recycling Bin, Green Compost Bin, Black General Waste)"
}

Categories:
- plastic: bottles, bags, containers, packaging
- paper: newspapers, cardboard, office paper, books
- glass: bottles, jars, broken glass
- metal: cans, foil, appliances, wires
- organic: food waste, garden waste, biodegradable items
- electronic: phones, batteries, computers, cables
- hazardous: chemicals, paint, medicine, fluorescent bulbs
- textile: clothing, fabric, shoes
- general: non-recyclable mixed waste

If no waste item is visible, return: {"error": "No waste item detected in image"}`;

// ─── Classify function ────────────────────────────────────────────────────────

export const classifyWaste = async (
  image: string
): Promise<ClassificationResult> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw Object.assign(new Error('GEMINI_API_KEY not configured'), { statusCode: 500 });
  }

  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  const mimeType   = image.match(/^data:(image\/\w+);base64,/)?.[1] ?? 'image/jpeg';

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent([
    CLASSIFY_PROMPT,
    { inlineData: { mimeType, data: base64Data } },
  ]);

  const text      = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw Object.assign(new Error('Could not parse AI response. Please try again.'), { statusCode: 422 });
  }

  const classification = JSON.parse(jsonMatch[0]) as ClassificationResult;

  if (classification.error) {
    throw Object.assign(new Error(classification.error), { statusCode: 422 });
  }

  const category = (classification.category ?? 'general').toLowerCase();
  classification.points = pointsByCategory[category] ?? 5;

  return classification;
};
