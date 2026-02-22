import { ClashFragrance } from "@/types/clash";
import { calculateDNA } from "@/lib/clash/dnaEngine";

const rawPool = [
  {
    id: "creed-aventus",
    name: "Aventus",
    brand: "Creed",
    year: 2010,
    family: "Fruity Chypre",
    gender: "Men",
    accords: ["Fruity", "Sweet", "Leather", "Smoky", "Woody"],
    notes: {
      top: ["Pineapple", "Bergamot", "Black Currant", "Apple"],
      mid: ["Birch", "Patchouli", "Moroccan Jasmine", "Rose"],
      base: ["Musk", "Oakmoss", "Ambergris", "Vanille"]
    },
    vibe: "Success and Power",
    season: "All seasons",
    longevity: "Long-lasting",
    sillage: "Strong",
    occasion: ["Daily", "Interview", "Wedding"],
    style: ["Formal", "Minimal"],
    mood: ["Dominant", "Intellectual"],
    weather: ["Sunny", "Spring", "Autumn"],
    price_range: "Luxury",
    colors: ["#ffffff", "#000000", "#444444", "#cccccc", "#888888"]
  },
  {
    id: "br-540",
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    year: 2015,
    family: "Amber Floral",
    gender: "Unisex",
    accords: ["Woody", "Amber", "Warm Spicy", "Fresh Spicy", "Aromatic"],
    notes: {
      top: ["Saffron", "Jasmine"],
      mid: ["Amberwood", "Ambergris"],
      base: ["Fir Resin", "Cedar"]
    },
    vibe: "Ethereal Radiance",
    season: "All seasons",
    longevity: "Eternal",
    sillage: "Strong",
    occasion: ["Daily", "Date", "Club"],
    style: ["Minimal", "Vintage"],
    mood: ["Mysterious", "Soft"],
    weather: ["Winter", "Autumn", "Spring"],
    price_range: "Luxury",
    colors: ["#ff0000", "#ffd700", "#ffffff", "#000000", "#8b0000"]
  },
  {
    id: "tf-ombre-leather",
    name: "Ombré Leather",
    brand: "Tom Ford",
    year: 2018,
    family: "Leather",
    gender: "Unisex",
    accords: ["Leather", "Animalic", "White Floral", "Warm Spicy", "Amber"],
    notes: {
      top: ["Cardamom"],
      mid: ["Leather", "Jasmine Sambac"],
      base: ["Amber", "Moss", "Patchouli"]
    },
    vibe: "Rugged Sophistication",
    season: "Winter/Autumn",
    longevity: "Long-lasting",
    sillage: "Strong",
    occasion: ["Date", "Club"],
    style: ["Streetwear", "Vintage"],
    mood: ["Dominant", "Mysterious"],
    weather: ["Cold", "Winter", "Autumn"],
    price_range: "Luxury",
    colors: ["#000000", "#444444", "#ffffff", "#8b4513", "#222222"]
  },
  {
    id: "mm-by-the-fireplace",
    name: "By the Fireplace",
    brand: "Maison Margiela",
    year: 2015,
    family: "Amber Woody",
    gender: "Unisex",
    accords: ["Woody", "Vanilla", "Warm Spicy", "Amber", "Powdery"],
    notes: {
      top: ["Cloves", "Pink Pepper", "Orange Blossom"],
      mid: ["Chestnut", "Guaiac Wood", "Juniper"],
      base: ["Vanilla", "Peru Balsam", "Cashmeran"]
    },
    vibe: "Cozy Winter Night",
    season: "Winter",
    longevity: "Long-lasting",
    sillage: "Moderate",
    occasion: ["Daily", "Date"],
    style: ["Vintage", "Linen Summer"], // Linen summer is probably wrong but used for contrast
    mood: ["Soft", "Playful"],
    weather: ["Winter", "Cold"],
    price_range: "Luxury",
    colors: ["#ffa500", "#8b4513", "#000000", "#ff4500", "#555555"]
  },
  {
    id: "nasomatto-black-afgano",
    name: "Black Afgano",
    brand: "Nasomatto",
    year: 2009,
    family: "Amber Woody",
    gender: "Unisex",
    accords: ["Amber", "Smoky", "Oud", "Cannabis", "Woody"],
    notes: {
      top: ["Cannabis", "Green Notes"],
      mid: ["Resins", "Woody Notes", "Tobacco", "Coffee"],
      base: ["Agarwood (Oud)", "Incense"]
    },
    vibe: "Hypnotic Darkness",
    season: "Winter",
    longevity: "Eternal",
    sillage: "Enormous",
    occasion: ["Club", "Mysterious Event"],
    style: ["Streetwear", "Vintage"],
    mood: ["Mysterious", "Dominant"],
    weather: ["Winter", "Cold"],
    price_range: "Luxury",
    colors: ["#000000", "#1a1a1a", "#006400", "#4b3621", "#333333"]
  },
  {
    id: "molecule-01",
    name: "Molecule 01",
    brand: "Escentric Molecules",
    year: 2006,
    family: "Woody Musk",
    gender: "Unisex",
    accords: ["Musk", "Woody", "Amber"],
    notes: {
      top: ["ISO E Super"],
      mid: ["ISO E Super"],
      base: ["ISO E Super"]
    },
    vibe: "Hyper-Minimalist",
    season: "All seasons",
    longevity: "Moderate",
    sillage: "Intimate",
    occasion: ["Daily", "Interview"],
    style: ["Minimal"],
    mood: ["Intellectual", "Soft"],
    weather: ["Spring", "Sunny", "AC Office"],
    price_range: "Luxury",
    colors: ["#f5f5dc", "#ffffff", "#d3d3d3", "#e0e0e0", "#ffffff"]
  }
];

export const CLASH_POOL: ClashFragrance[] = rawPool.map(f => ({
  ...f,
  dna: calculateDNA(f.notes, f.accords)
}));

export const EASY_POOL = CLASH_POOL.filter(f => ["creed-aventus", "br-540"].includes(f.id));
export const MEDIUM_POOL = CLASH_POOL.filter(f => ["tf-ombre-leather", "mm-by-the-fireplace"].includes(f.id));
export const HARD_POOL = CLASH_POOL.filter(f => ["nasomatto-black-afgano", "molecule-01"].includes(f.id));

export function getRandomFragrance(difficulty: "Easy" | "Medium" | "Hard"): ClashFragrance {
  const pool = difficulty === "Easy" ? EASY_POOL : difficulty === "Medium" ? MEDIUM_POOL : HARD_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}
