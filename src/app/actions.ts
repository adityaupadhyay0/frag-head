"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Fragrance, UserPreferences } from "@/types";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const MODEL_NAME = "gemini-1.5-pro"; // Using a valid stable model

export async function getScentStoryAction(fragrance: Fragrance, prefs: UserPreferences) {
  if (!apiKey) {
    return {
      story: "The air hums with the scent of " + fragrance.name + ". A perfect match for your " + (prefs.occasion || "day") + ".",
      outfitSuggestions: "Pairs perfectly with your " + (prefs.outfit || "selected") + " style.",
      emotionalDescription: "Evokes a " + fragrance.vibe + " atmosphere."
    };
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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

export async function predictLayeringAction(
  frag1: { name: string; brand?: string; notes?: any },
  frag2: { name: string; brand?: string; notes?: any }
) {
    if (!apiKey) {
        return {
          outcome: "A complex intersection of " + frag1.name + " and " + frag2.name + ".",
          vibe: "Experimental and unique.",
          risk: "Safe",
          accords: ["Fresh", "Woody"],
          colors: ["#a855f7", "#06b6d4", "#ffffff", "#000000", "#444444"],
          notes: { top: [], mid: [], base: [] }
        };
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const frag1Desc = frag1.notes ?
        `${frag1.brand} ${frag1.name} (Notes: ${frag1.notes.top?.join(", ")}, ${frag1.notes.mid?.join(", ")}, ${frag1.notes.base?.join(", ")})` :
        frag1.name;

    const frag2Desc = frag2.notes ?
        `${frag2.brand} ${frag2.name} (Notes: ${frag2.notes.top?.join(", ")}, ${frag2.notes.mid?.join(", ")}, ${frag2.notes.base?.join(", ")})` :
        frag2.name;

    const prompt = `
    You are a master perfumer for "Frag-Head".
    Predict the outcome of layering these two fragrances:
    1. ${frag1Desc}
    2. ${frag2Desc}

    Provide a detailed prediction in JSON format:
    {
      "outcome": "3-4 lines describing the olfactory result",
      "vibe": "Short vibe description",
      "risk": "Safe" | "Experimental" | "Chaotic",
      "accords": string[], // top 5 predicted accords
      "colors": string[], // 5 hex colors representing the new scent aura
      "notes": {
        "top": string[],
        "mid": string[],
        "base": string[]
      }
    }

    Return ONLY the JSON.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("Invalid AI response");
    } catch (error) {
        return {
          outcome: "A daring combination for the bold. The intersection of these two scents creates a unique, unrepeatable aura.",
          vibe: "Complex & Unique",
          risk: "Experimental",
          accords: ["Mixed", "Atmospheric"],
          colors: ["#a855f7", "#06b6d4", "#ffffff", "#000000", "#444444"],
          notes: { top: ["Discovery"], mid: ["Mystery"], base: ["Depth"] }
        };
    }
}

export async function searchInternetFragrancesAction(prefs: UserPreferences) {
    if (!apiKey) {
      return [];
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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

      Find 3-5 unique and matching fragrances that are NOT typically in a basic starter kit. Focus on niche, artistic, or high-tier designer scents that align perfectly with the user's mood and weather.

      For EACH fragrance, you must ALSO generate:
      1. A cinematic micro-story (3-4 lines) that captures the "vibe" in a noir, atmospheric style. Focus on sensory details like light, shadow, texture, and emotion.
      2. Specific outfit pairing suggestions that complement the scent's weight and the user's style.
      3. An emotional description of the scent's impact on the wearer and others.

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
        aiStory: {
          story: string;
          outfitSuggestions: string;
          emotionalDescription: string;
        };
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

export async function searchInternetFragrancesStreamAction(prefs: UserPreferences) {
    if (!apiKey) {
       // Mock streaming response for testing/missing key
       const mockResults = [
        {
          id: "mock-1",
          name: "Sample Discovery",
          brand: "Frag-Head Lab",
          gender: "Unisex",
          accords: ["Fresh", "Woody", "Citrus"],
          vibe: "Clean and Professional",
          notes: {
            top: ["Bergamot", "Lemon"],
            mid: ["Lavender", "Jasmine"],
            base: ["Cedar", "Musk"]
          },
          season: "Spring",
          longevity: "Long-lasting",
          sillage: "Moderate",
          occasion: ["Office", "Daily"],
          style: ["Minimal"],
          mood: ["Intellectual"],
          weather: ["Spring"],
          price_range: "Designer",
          colors: ["#a855f7", "#06b6d4", "#ffffff", "#000000", "#444444"],
          aiStory: {
            story: "A crisp morning in a digital garden. The scent of fresh data and binary blossoms.",
            outfitSuggestions: "A sharp white linen shirt and tech-fabric trousers.",
            emotionalDescription: "Empowering and focused."
          }
        }
      ];

      return {
        stream: (async function* () {
          yield { text: () => JSON.stringify(mockResults) };
        })()
      };
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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
      For EACH fragrance, you must ALSO generate:
      1. A cinematic micro-story (3-4 lines) that captures the "vibe". No cringe.
      2. Specific outfit pairing suggestions based on the user's style preference.
      3. An emotional description of how this scent feels.

      Return the results as a JSON array of objects following this exact structure:

      {
        "id": string, // unique slug
        "name": string,
        "brand": string,
        "gender": "Men" | "Women" | "Unisex",
        "accords": string[],
        "vibe": string,
        "notes": {
          "top": string[],
          "mid": string[],
          "base": string[]
        },
        "season": string,
        "longevity": string,
        "sillage": string,
        "occasion": string[],
        "style": string[],
        "mood": string[],
        "weather": string[],
        "price_range": "Designer" | "Luxury",
        "colors": string[], // 5 hex colors that represent the scent vibe
        "aiStory": {
          "story": string,
          "outfitSuggestions": string,
          "emotionalDescription": string
        }
      }

      Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.
    `;

    return model.generateContentStream(prompt);
}
