import type { GeneratedLegacyPuzzle, PuzzleSummary } from "./types.ts";

export function summarizePuzzle(result: GeneratedLegacyPuzzle): PuzzleSummary {
  return {
    size: result.game.playfieldSize,
    attempts: result.attempts,
    isValid: result.isValid,
    placedWordCount: result.game.placedWords.length,
    firstWord: result.game.placedWords[0],
    words: result.numberedWords.map((word) => ({
      term: word.term,
      x: word.x,
      y: word.y,
      orientation: word.orientation,
      number: word.number
    }))
  };
}
