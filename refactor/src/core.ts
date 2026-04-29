import { generateLegacyPuzzle, numberPlacedWords } from "./legacy-generator.ts";
import { validatePuzzle } from "./placement.ts";
import type {
  CrosswordPuzzle,
  GenerateLegacyPuzzleOptions,
  GridCell,
  LegacyGameObject,
  Orientation,
  PlacedWord,
  ValidationResult,
  WordEntry
} from "./types.ts";

function findWordAtCell(go: LegacyGameObject, x: number, y: number, orientation: Orientation): PlacedWord | null {
  const term = orientation === 0 ? go.grid[x][y].horizontalTerm : go.grid[x][y].verticalTerm;
  if (term === "") return null;

  return go.placedWords.find((word) => word.term === term) ?? null;
}

// Core bridge API: keeps the current legacy behavior, but presents a cleaner entry point to future UI code.
export function generateCrossword(words?: WordEntry[], options: GenerateLegacyPuzzleOptions = {}): CrosswordPuzzle {
  return generateLegacyPuzzle({
    ...options,
    words: words ?? options.words
  });
}

// Returns the current legacy validation result in an object form that is easier to extend later.
export function validateGrid(puzzle: CrosswordPuzzle): ValidationResult {
  return {
    isValid: validatePuzzle(puzzle.game)
  };
}

// Safe cell lookup for UI/navigation code that should not need to know the grid bounds rules directly.
export function getCell(puzzle: CrosswordPuzzle, x: number, y: number): GridCell | null {
  if (puzzle.game.isLocationOutOfBounds(x, y)) return null;

  return puzzle.game.grid[x][y];
}

// Finds the placed word that claims a given cell in the requested direction.
export function getWordAtCell(puzzle: CrosswordPuzzle, x: number, y: number, orientation: Orientation): PlacedWord | null {
  if (puzzle.game.isLocationOutOfBounds(x, y)) return null;

  return findWordAtCell(puzzle.game, x, y, orientation);
}

// Expose numbering through the bridge so future code can stop reaching into the legacy module directly.
export function getNumberedWords(puzzle: CrosswordPuzzle): PlacedWord[] {
  return numberPlacedWords(puzzle.game);
}
