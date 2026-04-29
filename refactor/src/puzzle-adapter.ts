import { getNumberedWords } from "./core.ts";
import type { CoreCell, CorePlacedWord, CorePuzzle, CrosswordPuzzle, Orientation, PlacedWord } from "./types.ts";

function toDirection(orientation: Orientation): "across" | "down" {
  return orientation === 0 ? "across" : "down";
}

function toCoreWord(word: PlacedWord): CorePlacedWord {
  return {
    term: word.term,
    definition: word.definition,
    x: word.x,
    y: word.y,
    direction: toDirection(word.orientation),
    number: word.number
  };
}

// Adapts the locked legacy puzzle into a UI-friendly shape with explicit blocks, solution text, and directions.
export function toCorePuzzle(puzzle: CrosswordPuzzle): CorePuzzle {
  const cells: CoreCell[][] = [];

  for (let x = 0; x < puzzle.game.playfieldSize; x += 1) {
    const column: CoreCell[] = [];

    for (let y = 0; y < puzzle.game.playfieldSize; y += 1) {
      const legacyCell = puzzle.game.grid[x][y];
      const isBlock = legacyCell.letter === "";

      column.push({
        x,
        y,
        solution: legacyCell.letter,
        entry: "",
        isBlock,
        acrossTerm: legacyCell.horizontalTerm === "" ? null : legacyCell.horizontalTerm,
        downTerm: legacyCell.verticalTerm === "" ? null : legacyCell.verticalTerm
      });
    }

    cells.push(column);
  }

  return {
    size: puzzle.game.playfieldSize,
    cells,
    words: getNumberedWords(puzzle).map(toCoreWord),
    isValid: puzzle.isValid
  };
}
