export type Gender = "Men" | "Women" | "Unisex" | "All";
export type Occasion = "Date" | "Interview" | "Club" | "Wedding" | "Daily";
export type Outfit = "Minimal" | "Streetwear" | "Formal" | "Linen Summer" | "Vintage" | "Athletic";
export type Mood = "Mysterious" | "Dominant" | "Soft" | "Playful" | "Intellectual";
export type Weather = "Hot Humid" | "Winter" | "AC Office" | "Spring" | "Autumn" | "Sunny" | "Cold";
export type PriceRange = "Designer" | "Luxury";

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  gender: Gender | string;
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
  occasion: (Occasion | string)[];
  style: (Outfit | string)[];
  mood: (Mood | string)[];
  weather: (Weather | string)[];
  price_range: PriceRange | string;
  colors: string[];
  aiStory?: {
    story: string;
    outfitSuggestions: string;
    emotionalDescription: string;
  };
}

export interface UserPreferences {
  occasion?: Occasion | string;
  outfit?: Outfit | string;
  mood?: Mood | string;
  weather?: Weather | string;
  gender?: Gender | string;
  budget?: PriceRange | string;
  extraNotes?: string;
  _autoGlobal?: boolean;
}

export interface LayeringResult {
  outcome: string;
  vibe: string;
  risk: "Safe" | "Experimental" | "Chaotic";
  accords: string[];
  colors: string[];
  notes: {
    top: string[];
    mid: string[];
    base: string[];
  };
}
