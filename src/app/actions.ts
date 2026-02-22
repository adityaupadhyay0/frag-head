"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Fragrance, UserPreferences } from "@/types";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function getScentStoryAction(fragrance: Fragrance, prefs: UserPreferences) {
  if (!apiKey) {
    return {
      story: "The air hums with the scent of " + fragrance.name + ". A perfect match for your " + (prefs.occasion || "day") + ".",
      outfitSuggestions: "Pairs perfectly with your " + (prefs.outfit || "selected") + " style.",
      emotionalDescription: "Evokes a " + fragrance.vibe + " atmosphere."
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert fragrance storyteller for "Frag-Head".
    Given a fragrance and user context, generate:
    1. A cinematic micro-story (3-4 lines) that captures the "vibe". No cringe.
    2. Specific outfit pairing suggestions based on the user's style preference.
    3. An emotional description of how this scent feels.

    Fragrance: ${fragrance.brand} - ${fragrance.name}
    Notes: ${fragrance.notes.top.join(", ")}, ${fragrance.notes.mid.join(", ")}, ${fragrance.notes.base.join(", ")}
    User Occasion: ${prefs.occasion}
    User Outfit Style: ${prefs.outfit}
    User Mood: ${prefs.mood}

    Format the response as JSON with keys: story, outfitSuggestions, emotionalDescription.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { story: text, outfitSuggestions: "", emotionalDescription: "" };
  } catch (error) {
    return {
      story: "An atmospheric blend that defines your unique presence.",
      outfitSuggestions: "Enhance the look with textures that mirror the scent's depth.",
      emotionalDescription: "A sophisticated aura that lingers in the memory of others."
    };
  }
}

export async function predictLayeringAction(frag1: Fragrance, frag2: Fragrance) {
    if (!apiKey) {
        return {
          outcome: "A complex intersection of " + frag1.name + " and " + frag2.name + ".",
          vibe: "Experimental and unique.",
          risk: "Safe"
        };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Predict the outcome of layering these two fragrances:
    1. ${frag1.brand} ${frag1.name} (Notes: ${frag1.notes.top.join(", ")}, ${frag1.notes.mid.join(", ")}, ${frag1.notes.base.join(", ")})
    2. ${frag2.brand} ${frag2.name} (Notes: ${frag2.notes.top.join(", ")}, ${frag2.notes.mid.join(", ")}, ${frag2.notes.base.join(", ")})

    Provide:
    1. What vibe emerges?
    2. Which notes dominate the combination?
    3. Risk level (Safe / Experimental / Chaotic).

    Format the response as JSON with keys: outcome, vibe, risk.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return { outcome: text, vibe: "", risk: "Experimental" };
    } catch (error) {
        return { outcome: "A daring combination for the bold.", vibe: "Complex", risk: "Experimental" };
    }
}

export async function searchInternetFragrancesAction(prefs: UserPreferences) {
    if (!apiKey) {
      return [];
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a world-class fragrance expert and scout for "Frag-Head".
      The user is looking for new fragrances across the entire world (internet knowledge) based on their profile.

      User Profile:
      - Occasion: ${prefs.occasion}
      - Outfit Style: ${prefs.outfit}
      - Mood/Vibe: ${prefs.mood}
      - Weather: ${prefs.weather}
      - Gender: ${prefs.gender}
      - Budget: ${prefs.budget}
      - Extra Notes: ${prefs.extraNotes}

      Find 3-5 unique and matching fragrances that are NOT typically in a basic starter kit.
      Return the results as a JSON array of objects following this exact structure:

      {
        id: string; // unique slug
        name: string;
        brand: string;
        gender: "Men" | "Women" | "Unisex";
        accords: string[];
        vibe: string;
        notes: {
          top: string[];
          mid: string[];
          base: string[];
        };
        season: string;
        longevity: string;
        sillage: string;
        occasion: string[];
        style: string[];
        mood: string[];
        weather: string[];
        price_range: "Designer" | "Luxury";
        colors: string[]; // 5 hex colors that represent the scent vibe
      }

      Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // Try to find array in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
          const cleanJson = jsonMatch[0].replace(/```json|```/g, "");
          return JSON.parse(cleanJson) as Fragrance[];
      }
      return [];
    } catch (error) {
      console.error("Error searching internet fragrances:", error);
      return [];
    }
  }

export async function rankLocalMatchesAction(prefs: UserPreferences, fragrances: Fragrance[]) {
    if (!apiKey) return fragrances.slice(0, 5);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // We only send a subset of data to avoid token limits
    const fragList = fragrances.map(f => ({
        id: f.id,
        name: f.name,
        brand: f.brand,
        notes: f.notes,
        vibe: f.vibe
    }));

    const prompt = `
    You are a fragrance matching AI. Rank the following local fragrances based on the user preferences.

    User Preferences:
    - Occasion: ${prefs.occasion}
    - Style: ${prefs.outfit}
    - Mood: ${prefs.mood}
    - Weather: ${prefs.weather}
    - Extra Notes: ${prefs.extraNotes}

    Fragrances to rank:
    ${JSON.stringify(fragList)}

    Return a JSON array of fragrance IDs in order of best match to worst. Return ONLY the JSON array.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            const ids = JSON.parse(jsonMatch[0]) as string[];
            return ids.map(id => fragrances.find(f => f.id === id)).filter(Boolean) as Fragrance[];
        }
        return fragrances.slice(0, 5);
    } catch (error) {
        return fragrances.slice(0, 5);
    }
}
