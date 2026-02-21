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
  gender: Gender;
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
  occasion: Occasion[];
  style: Outfit[];
  mood: Mood[];
  weather: Weather[];
  price_range: PriceRange;
  colors: string[];
}

export interface UserPreferences {
  occasion?: Occasion;
  outfit?: Outfit;
  mood?: Mood;
  weather?: Weather;
  gender?: Gender;
  budget?: PriceRange;
}
