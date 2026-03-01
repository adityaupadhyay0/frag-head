import { Fragrance } from "@/types";

export interface ScentDNA {
  warmth: number;       // 0-100
  sweetness: number;    // 0-100
  projection: number;   // 0-100
  complexity: number;   // 0-100
  freshness: number;    // 0-100
  mystery: number;      // 0-100
}

const NOTE_WEIGHTS: Record<string, Partial<ScentDNA>> = {
  // Fresh/Citrus
  "Bergamot": { freshness: 15, warmth: -5 },
  "Lemon": { freshness: 20, warmth: -10 },
  "Orange": { freshness: 15, sweetness: 5 },
  "Grapefruit": { freshness: 18, complexity: 2 },
  "Sea Water": { freshness: 25, mystery: 5 },

  // Sweet/Gourmand
  "Vanilla": { sweetness: 25, warmth: 10 },
  "Caramel": { sweetness: 30, warmth: 15 },
  "Tonka Bean": { sweetness: 20, warmth: 15, mystery: 5 },
  "Honey": { sweetness: 25, complexity: 5 },

  // Woody/Warm
  "Cedar": { warmth: 15, freshness: 5 },
  "Sandalwood": { warmth: 20, sweetness: 5, complexity: 10 },
  "Oud": { warmth: 30, mystery: 30, complexity: 25 },
  "Patchouli": { warmth: 15, mystery: 15, complexity: 15 },
  "Vetiver": { freshness: 5, warmth: 10, mystery: 10 },

  // Floral
  "Rose": { sweetness: 10, complexity: 10, freshness: 5 },
  "Jasmine": { sweetness: 10, mystery: 10, complexity: 5 },
  "Lavender": { freshness: 15, warmth: 5 },

  // Spicy
  "Pink Pepper": { projection: 10, freshness: 5 },
  "Cardamom": { warmth: 15, sweetness: 5, complexity: 10 },
  "Cinnamon": { warmth: 20, sweetness: 10 },
  "Saffron": { mystery: 20, complexity: 15 },

  // Animalic/Musky
  "Musk": { mystery: 10, warmth: 10 },
  "Amber": { warmth: 25, sweetness: 10, mystery: 10 },
  "Leather": { warmth: 20, mystery: 25, complexity: 20 },
};

export function calculateDNA(fragrance: Fragrance): ScentDNA {
  const dna: ScentDNA = {
    warmth: 50,
    sweetness: 30,
    projection: 50,
    complexity: 40,
    freshness: 40,
    mystery: 30
  };

  const allNotes = [
    ...fragrance.notes.top,
    ...fragrance.notes.mid,
    ...fragrance.notes.base
  ];

  allNotes.forEach(note => {
    // Basic normalization: lower case and find substring
    const normalizedNote = note.toLowerCase();
    const match = Object.keys(NOTE_WEIGHTS).find(k =>
      normalizedNote.includes(k.toLowerCase()) || k.toLowerCase().includes(normalizedNote)
    );

    const weights = match ? NOTE_WEIGHTS[match] : {};
    Object.entries(weights).forEach(([key, val]) => {
      (dna as any)[key] = Math.max(0, Math.min(100, (dna as any)[key] + (val as number)));
    });
  });

  // Projection logic based on base notes and sillage
  if (fragrance.sillage.toLowerCase().includes("strong")) dna.projection += 20;
  if (fragrance.longevity.toLowerCase().includes("long")) dna.complexity += 15;

  return dna;
}

export function calculateClashScore(dna1: ScentDNA, dna2: ScentDNA): number {
  // A "Clash Score" represents how much these two scents compete or contrast.
  // Higher score means more intense "Clash".
  const diffs = Object.keys(dna1).map(key =>
    Math.abs((dna1 as any)[key] - (dna2 as any)[key])
  );
  return Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
}
