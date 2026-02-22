import { Match, Difficulty, ClashFragrance, RoundResult } from "@/types/clash";
import { getRandomFragrance, CLASH_POOL } from "@/data/clashPool";

/**
 * Game Engine Logic for Frag-Head Clash 2.0
 */

export function startMatch(difficulty: Difficulty): Match {
  return {
    id: Math.random().toString(36).substring(2, 11),
    difficulty,
    currentRound: 1,
    totalRounds: 5,
    startTime: Date.now(),
    hintsUnlocked: [],
    penalty: 0,
    isCompleted: false,
    rounds: [],
    totalScore: 0
  };
}

export function startNextRound(match: Match): Match {
  if (match.currentRound >= match.totalRounds) {
    return { ...match, isCompleted: true };
  }

  return {
    ...match,
    currentRound: match.currentRound + 1,
    startTime: Date.now(),
    hintsUnlocked: [],
    penalty: 0
  };
}

export function calculateScore(
  match: Match,
  endTime: number,
  guessedCorrectly: boolean,
  bonuses: { guessedAccord?: boolean; guessedArchetype?: boolean } = {}
): number {
  if (!guessedCorrectly) return 0;

  const base_score = 1000;
  const seconds = Math.max(0, (endTime - match.startTime) / 1000);
  const time_penalty = (seconds * 5) + (match.penalty || 0);

  const multipliers: Record<Difficulty, number> = {
    "Easy": 1.0,
    "Medium": 1.5,
    "Hard": 2.0
  };

  const difficulty_multiplier = multipliers[match.difficulty];

  let bonusPoints = 0;
  if (bonuses.guessedAccord) bonusPoints += 100;
  if (bonuses.guessedArchetype) bonusPoints += 50;

  const final_score = Math.max(100, (base_score - time_penalty) * difficulty_multiplier) + bonusPoints;
  return Math.round(final_score);
}

export function getHint(match: Match, hintType: string, penalty: number = 0): Match {
  if (match.hintsUnlocked.includes(hintType)) return match;

  return {
    ...match,
    hintsUnlocked: [...match.hintsUnlocked, hintType],
    penalty: (match.penalty || 0) + penalty
  };
}

export function checkGuess(
  match: Match,
  fragranceId: string,
  guess: string,
  bonusGuesses: { accord?: string, archetype?: string } = {}
): {
  correct: boolean;
  fragrance?: ClashFragrance;
  bonuses: { guessedAccord: boolean; guessedArchetype: boolean }
} {
  const fragrance = CLASH_POOL.find(f => f.id === fragranceId);
  if (!fragrance) return { correct: false, bonuses: { guessedAccord: false, guessedArchetype: false } };

  const normalizedGuess = guess.toLowerCase().trim();
  const correct = normalizedGuess === fragrance.name.toLowerCase() ||
                  normalizedGuess === `${fragrance.brand.toLowerCase()} ${fragrance.name.toLowerCase()}`;

  // Check for bonuses
  const guessedAccord = bonusGuesses.accord?.toLowerCase().trim() === fragrance.dna.dominant_accord.toLowerCase();
  const guessedArchetype = bonusGuesses.archetype?.toLowerCase().trim() === fragrance.dna.archetype.toLowerCase();

  return {
    correct,
    fragrance,
    bonuses: { guessedAccord, guessedArchetype }
  };
}

export function getAptitude(rounds: RoundResult[]): { [key: string]: number } {
  const aptitude: { [key: string]: number } = {};

  rounds.forEach(r => {
    const frag = CLASH_POOL.find(f => f.id === r.fragranceId);
    if (!frag || !r.guessedCorrectly) return;

    const family = frag.family || "Unknown";
    aptitude[family] = (aptitude[family] || 0) + 20; // 20% boost per correct guess in family

    frag.accords.forEach(a => {
        aptitude[a] = (aptitude[a] || 0) + 10;
    });
  });

  // Cap at 100
  Object.keys(aptitude).forEach(k => {
    aptitude[k] = Math.min(100, aptitude[k]);
  });

  return aptitude;
}
