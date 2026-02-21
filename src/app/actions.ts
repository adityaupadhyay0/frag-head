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
