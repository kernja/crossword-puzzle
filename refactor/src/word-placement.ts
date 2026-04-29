import { sortLikeLegacy } from "./random.ts";
import type { LegacyGameObject, Orientation, WordEntry } from "./types.ts";

// Places a full word, then immediately tries to branch from each non-intersection cell.
export function setWordAtLocation(
  go: LegacyGameObject,
  x: number,
  y: number,
  word: WordEntry,
  orientation: Orientation,
  rng: () => number
): void {
  go.placedWords.push({ x, y, term: word.term, definition: word.definition, orientation, number: 0 });
  go.wordPool = sortLikeLegacy(
    go.wordPool.filter((candidate) => candidate.term !== word.term),
    rng
  );

  for (let i = 0; i < word.term.length; i += 1) {
    if (orientation === 0) {
      go.setLetterAtLocation(x + i, y, word, word.term[i], orientation);
    } else {
      go.setLetterAtLocation(x, y + i, word, word.term[i], orientation);
    }
  }

  for (let i = 0; i < word.term.length; i += 1) {
    if (orientation === 0) {
      if (go.isLocationFilled(x + i, y) === false) go.testWordsAtLocation(x + i, y, word.term[i], 1);
    } else if (go.isLocationFilled(x, y + i) === false) {
      go.testWordsAtLocation(x, y + i, word.term[i], 0);
    }
  }
}

// Tries candidate words that share a letter with the current cell until one fits.
export function testWordsAtLocation(
  go: LegacyGameObject,
  x: number,
  y: number,
  letter: string,
  orientation: Orientation
): void {
  const potentialWords = go.wordPool.filter((word) => word.term.indexOf(letter) >= 0);
  if (potentialWords.length === 0) return;

  let placedWord = false;

  for (let wordIndex = 0; wordIndex < potentialWords.length && placedWord === false; wordIndex += 1) {
    const word = potentialWords[wordIndex];
    let letterIndex = word.term.indexOf(letter);

    while (letterIndex !== -1 && placedWord === false) {
      const offset = 0 - letterIndex;
      let canPlaceWord = true;

      // Require a blank boundary before and after the candidate word.
      if (orientation === 0) {
        if (go.isLocationValid(x + offset - 1, y, "!", orientation, true) === false) canPlaceWord = false;
        if (go.isLocationValid(x + offset + word.term.length, y, "!", orientation, true) === false) {
          canPlaceWord = false;
        }
      } else {
        if (go.isLocationValid(x, y + offset - 1, "!", orientation, true) === false) canPlaceWord = false;
        if (go.isLocationValid(x, y + offset + word.term.length, "!", orientation, true) === false) {
          canPlaceWord = false;
        }
      }

      for (let i = 0; i < word.term.length && canPlaceWord === true; i += 1) {
        if (orientation === 0) {
          if (go.isLocationValid(x + offset + i, y, word.term[i], orientation) === false) canPlaceWord = false;
        } else if (go.isLocationValid(x, y + offset + i, word.term[i], orientation) === false) {
          canPlaceWord = false;
        }
      }

      if (canPlaceWord) {
        if (orientation === 0) {
          go.setWordAtLocation(x + offset, y, word, orientation);
        } else {
          go.setWordAtLocation(x, y + offset, word, orientation);
        }

        placedWord = true;
      }

      letterIndex = word.term.indexOf(letter, letterIndex + 1);
    }
  }
}
