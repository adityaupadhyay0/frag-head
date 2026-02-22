import { Fragrance, UserPreferences } from "@/types";
import { getScentStoryAction, predictLayeringAction, searchInternetFragrancesAction, rankLocalMatchesAction } from "@/app/actions";

export async function generateScentStory(fragrance: Fragrance, prefs: UserPreferences) {
  return await getScentStoryAction(fragrance, prefs);
}

export async function predictLayering(frag1: Fragrance, frag2: Fragrance) {
  return await predictLayeringAction(frag1, frag2);
}

export async function searchInternetFragrances(prefs: UserPreferences) {
  return await searchInternetFragrancesAction(prefs);
}

export async function rankLocalMatches(prefs: UserPreferences, fragrances: Fragrance[]) {
  return await rankLocalMatchesAction(prefs, fragrances);
}
