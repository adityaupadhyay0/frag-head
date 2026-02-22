import { FragranceDNA } from "@/types/clash";

/**
 * DNA Engine (Manual Rule Engine)
 * Calculates structured DNA scores for a fragrance based on its notes and accords.
 */
export function calculateDNA(
  notes: { top: string[]; mid: string[]; base: string[] },
  accords: string[]
): FragranceDNA {
  const allNotes = [
    ...(notes.top || []),
    ...(notes.mid || []),
    ...(notes.base || [])
  ].map(n => n.toLowerCase());

  const lowerAccords = (accords || []).map(a => a.toLowerCase());

  // Helper to check for keywords in notes or accords
  const has = (keywords: string[]) =>
    keywords.some(k =>
        allNotes.some(n => n.includes(k)) ||
        lowerAccords.some(a => a.includes(k))
    );

  // 1. Warmth (0-100)
  let warmth = 50;
  if (has(['oud', 'leather', 'amber', 'tobacco', 'incense', 'spice', 'cinnamon', 'pepper', 'sandalwood'])) warmth += 25;
  if (has(['citrus', 'lemon', 'bergamot', 'mint', 'aquatic', 'marine', 'water', 'sea', 'ice', 'ozonic'])) warmth -= 25;
  warmth = Math.max(5, Math.min(95, warmth));

  // 2. Sweetness (0-100)
  let sweetness = 30;
  if (has(['vanilla', 'tonka', 'caramel', 'honey', 'sugar', 'chocolate', 'praline', 'benzoin'])) sweetness += 45;
  if (has(['fruity', 'peach', 'berry', 'cherry', 'apple', 'pear'])) sweetness += 20;
  if (has(['vetiver', 'oakmoss', 'cedar', 'leather', 'dry', 'smoke', 'bitter'])) sweetness -= 15;
  sweetness = Math.max(0, Math.min(100, sweetness));

  // 3. Projection (1-5)
  let projection = 3;
  if (has(['oud', 'tuberose', 'beast', 'projection', 'intense', 'spice', 'civet', 'animalic'])) projection += 1;
  if (has(['extrait', 'elixir'])) projection += 1;
  if (has(['citrus', 'tea', 'musk', 'clean', 'soft', 'skin scent', 'office'])) projection -= 1;
  projection = Math.max(1, Math.min(5, projection));

  // 4. Longevity (1-5)
  let longevity = 3;
  if (has(['oud', 'amber', 'musk', 'sandalwood', 'patchouli', 'oakmoss', 'vanilla'])) longevity += 1;
  if (has(['citrus', 'neroli', 'eau de cologne', 'volatile', 'mint'])) longevity -= 1;
  longevity = Math.max(1, Math.min(5, longevity));

  // 5. Dominant Accord
  const dominant_accord = accords && accords.length > 0 ? accords[0] : "Atmospheric";

  // 6. Archetype
  let archetype = "The Explorer";
  if (has(['leather', 'vetiver', 'cedar', 'tobacco'])) archetype = "The CEO";
  if (has(['vanilla', 'rose', 'jasmine', 'white floral'])) archetype = "The Romantic";
  if (has(['oud', 'smoke', 'incense', 'dark'])) archetype = "The Rebel";
  if (has(['musk', 'ambroxan', 'linen', 'clean'])) archetype = "The Minimalist";
  if (has(['sea', 'salt', 'citrus', 'aquatic'])) archetype = "The Adventurer";
  if (has(['gourmand', 'caramel', 'chocolate', 'sweet'])) archetype = "The Bon Vivant";

  // 7. Season Vector [Spring, Summer, Autumn, Winter]
  let spring = 50, summer = 50, autumn = 50, winter = 50;
  if (has(['floral', 'green', 'neroli', 'grass', 'spring'])) spring += 30;
  if (has(['citrus', 'aquatic', 'marine', 'coconut', 'summer'])) summer += 30;
  if (has(['wood', 'spice', 'patchouli', 'cardamom', 'autumn'])) autumn += 30;
  if (has(['amber', 'vanilla', 'oud', 'honey', 'winter'])) winter += 30;

  // Inverse relationships
  if (winter > 70) summer -= 20;
  if (summer > 70) winter -= 20;

  const season_vector = [
    Math.max(10, Math.min(90, spring)),
    Math.max(10, Math.min(90, summer)),
    Math.max(10, Math.min(90, autumn)),
    Math.max(10, Math.min(90, winter))
  ];

  // 8. Mass Appeal & Polarization
  let mass_appeal_score = 65;
  if (has(['vanilla', 'citrus', 'lavender', 'musk', 'ambroxan', 'blue'])) mass_appeal_score += 20;
  if (has(['oud', 'civet', 'castoreum', 'animalic', 'heavy smoke', 'skanky', 'dirty'])) mass_appeal_score -= 30;
  mass_appeal_score = Math.max(5, Math.min(95, mass_appeal_score));

  let polarization_score = 25;
  if (has(['oud', 'leather', 'tuberose', 'animalic', 'incense', 'challenging'])) polarization_score += 45;
  if (has(['clean', 'fresh', 'citrus', 'white musk', 'soapy'])) polarization_score -= 10;
  polarization_score = Math.max(5, Math.min(95, polarization_score));

  return {
    warmth,
    sweetness,
    projection,
    longevity,
    dominant_accord,
    archetype,
    season_vector,
    mass_appeal_score,
    polarization_score
  };
}
