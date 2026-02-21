import { Fragrance, UserPreferences } from "@/types";
import fragrancesData from "@/data/fragrances.json";

const fragrances = fragrancesData as Fragrance[];

export function findMatches(prefs: UserPreferences, limit: number = 5): Fragrance[] {
  const scored = fragrances.map(frag => {
    let score = 0;

    // Gender match (Primary filter)
    if (prefs.gender && frag.gender !== "Unisex" && prefs.gender !== "Unisex") {
        if (frag.gender === prefs.gender) score += 10;
        else score -= 5;
    } else {
        score += 5; // Unisex matches everything
    }

    // Occasion match
    if (prefs.occasion && frag.occasion.includes(prefs.occasion)) {
      score += 5;
    }

    // Outfit match
    if (prefs.outfit && frag.style.includes(prefs.outfit)) {
      score += 5;
    }

    // Mood match
    if (prefs.mood && frag.mood.includes(prefs.mood)) {
      score += 5;
    }

    // Weather match
    if (prefs.weather && frag.weather.includes(prefs.weather)) {
      score += 5;
    }

    // Budget match
    if (prefs.budget && frag.price_range === prefs.budget) {
      score += 3;
    }

    return { frag, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.frag);
}
