import { isLocationFilled, isLocationOccupied, isLocationOutOfBounds, isLocationOverlapping } from "./grid.ts";
import type { LegacyGameObject, Orientation, WordEntry } from "./types.ts";

export function isLocationValid(
  go: LegacyGameObject,
  x: number,
  y: number,
  letter: string,
  orientation: Orientation,
  boundsCheckOnly = false
): boolean {
  if (boundsCheckOnly && isLocationOutOfBounds(go, x, y)) return true;

  if (orientation === 0) {
    if (isLocationOutOfBounds(go, x, y)) return false;
    if (isLocationFilled(go, x, y)) return false;
    if (isLocationOverlapping(go, x, y, letter) === false) {
      if (isLocationOccupied(go, x, y - 1)) return false;
      if (isLocationOccupied(go, x, y + 1)) return false;
      if (isLocationOccupied(go, x, y)) return false;
    }
  } else {
    if (isLocationOutOfBounds(go, x, y)) return false;
    if (isLocationFilled(go, x, y)) return false;
    if (isLocationOverlapping(go, x, y, letter) === false) {
      if (isLocationOccupied(go, x - 1, y)) return false;
      if (isLocationOccupied(go, x + 1, y)) return false;
      if (isLocationOccupied(go, x, y)) return false;
    }
  }

  return true;
}

export function setLetterAtLocation(
  go: LegacyGameObject,
  x: number,
  y: number,
  word: WordEntry,
  letter: string,
  orientation: Orientation
): void {
  go.grid[x][y].letter = letter;
  if (orientation === 0) {
    go.grid[x][y].horizontalTerm = word.term;
  } else {
    go.grid[x][y].verticalTerm = word.term;
  }
}

export function validatePuzzle(go: LegacyGameObject): boolean {
  let isValidated = true;
  go.placedWords.forEach((item) => {
    if (item.orientation === 0) {
      if (isLocationOccupied(go, item.x - 1, item.y, true) || isLocationOccupied(go, item.x + item.term.length, item.y, true)) {
        isValidated = false;
      }
    } else if (isLocationOccupied(go, item.x, item.y - 1, true) || isLocationOccupied(go, item.x, item.y + item.term.length, true)) {
      isValidated = false;
    }
  });

  return isValidated;
}
