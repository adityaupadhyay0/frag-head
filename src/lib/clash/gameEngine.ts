import { Match, Difficulty, ClashFragrance } from "@/types/clash";
import { getRandomFragrance, CLASH_POOL } from "@/data/clashPool";

/**
 * Game Engine Logic for Frag-Head Clash
 */

export function startMatch(difficulty: Difficulty): Match {
  const frag = getRandomFragrance(difficulty);
  return {
    id: Math.random().toString(36).substring(2, 11),
    fragranceId: frag.id,
    difficulty,
    players: [],
    roundNumber: 1,
    startTime: Date.now(),
    hintsUnlocked: [],
    penalty: 0,
    isCompleted: false
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
    penalty: match.penalty + penalty
  };
}

export function checkGuess(match: Match, guess: string): {
  correct: boolean;
  fragrance?: ClashFragrance;
  bonuses: { guessedAccord: boolean; guessedArchetype: boolean }
} {
  const fragrance = CLASH_POOL.find(f => f.id === match.fragranceId);
  if (!fragrance) return { correct: false, bonuses: { guessedAccord: false, guessedArchetype: false } };

  const normalizedGuess = guess.toLowerCase().trim();
  const correct = normalizedGuess === fragrance.name.toLowerCase() ||
                  normalizedGuess === `${fragrance.brand.toLowerCase()} ${fragrance.name.toLowerCase()}`;

  // Check for bonuses (if they guessed keywords in the brand/name input or separate fields)
  // For the demo, we might have separate inputs or just check if the guess contains them
  const guessedAccord = normalizedGuess.includes(fragrance.dna.dominant_accord.toLowerCase());
  const guessedArchetype = normalizedGuess.includes(fragrance.dna.archetype.toLowerCase());

  return {
    correct,
    fragrance,
    bonuses: { guessedAccord, guessedArchetype }
  };
}
