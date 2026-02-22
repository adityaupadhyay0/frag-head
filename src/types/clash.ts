import { Fragrance } from "./index";

export interface FragranceDNA {
  warmth: number; // 0–100
  sweetness: number; // 0–100
  projection: number; // 1–5
  longevity: number; // 1–5
  dominant_accord: string;
  archetype: string;
  season_vector: number[]; // [Spring, Summer, Autumn, Winter] 0-100 scores
  mass_appeal_score: number; // 0-100
  polarization_score: number; // 0-100
}

export interface ClashFragrance extends Fragrance {
  year?: number;
  family?: string;
  dna: FragranceDNA;
}

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Match {
  id: string;
  fragranceId: string;
  difficulty: Difficulty;
  players: string[];
  roundNumber: number;
  startTime: number; // timestamp
  hintsUnlocked: string[];
  penalty: number;
  isCompleted: boolean;
  score?: number;
}

export interface GameState {
  currentMatch: Match | null;
  history: Match[];
  totalScore: number;
}
