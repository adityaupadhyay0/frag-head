import { Fragrance, UserPreferences } from "@/types";
import { getScentStoryAction, predictLayeringAction } from "@/app/actions";

export async function generateScentStory(fragrance: Fragrance, prefs: UserPreferences) {
  return await getScentStoryAction(fragrance, prefs);
}

export async function predictLayering(frag1: Fragrance, frag2: Fragrance) {
  return await predictLayeringAction(frag1, frag2);
}
