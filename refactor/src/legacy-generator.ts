import { DEFAULT_WORDS } from "./default-words.ts";
import {
  createEmptyGrid,
  isLocationFilled as checkLocationFilled,
  isLocationOccupied as checkLocationOccupied,
  isLocationOutOfBounds as checkLocationOutOfBounds,
  isLocationOverlapping as checkLocationOverlapping
} from "./grid.ts";
import { numberPlacedWords } from "./numbering.ts";
import {
  isLocationValid as checkLocationValid,
  setLetterAtLocation as writeLetterAtLocation,
  validatePuzzle as validateLegacyPuzzle
} from "./placement.ts";
import { createSeededRng, sortLikeLegacy } from "./random.ts";
import { summarizePuzzle } from "./summary.ts";
import type {
  CreateLegacyGameObjectOptions,
  GenerateLegacyPuzzleOptions,
  GeneratedLegacyPuzzle,
  LegacyGameObject,
  Orientation,
  PlacedWord,
  WordEntry
} from "./types.ts";

export function createLegacyGameObject(options: CreateLegacyGameObjectOptions = {}): LegacyGameObject {
  const playfieldSize = options.playfieldSize ?? 15;
  const allAvailableWords = [...(options.words ?? DEFAULT_WORDS)];
  const rng = options.rng ?? Math.random;

  const go = {
    allAvailableWords,
    wordPool: [] as WordEntry[],
    placedWords: [] as PlacedWord[],
    playfieldSize,
    grid: [] as GridCell[][]
  } as LegacyGameObject;

  go.grid = createEmptyGrid(go.playfieldSize);
  go.wordPool = sortLikeLegacy(go.allAvailableWords, rng).filter((word) => word.term.length < go.playfieldSize);

  go.isLocationOutOfBounds = function isLocationOutOfBounds(x: number, y: number): boolean {
    return checkLocationOutOfBounds(this, x, y);
  };

  go.isLocationOccupied = function isLocationOccupied(x: number, y: number, ignoreBounds = false): boolean {
    return checkLocationOccupied(this, x, y, ignoreBounds);
  };

  go.isLocationFilled = function isLocationFilled(x: number, y: number): boolean {
    return checkLocationFilled(this, x, y);
  };

  go.isLocationOverlapping = function isLocationOverlapping(x: number, y: number, letter = ""): boolean {
    return checkLocationOverlapping(this, x, y, letter);
  };

  go.isLocationValid = function isLocationValid(
    x: number,
    y: number,
    letter: string,
    orientation: Orientation,
    boundsCheckOnly = false
  ): boolean {
    return checkLocationValid(this, x, y, letter, orientation, boundsCheckOnly);
  };

  go.setLetterAtLocation = function setLetterAtLocation(
    x: number,
    y: number,
    word: WordEntry,
    letter: string,
    orientation: Orientation
  ): void {
    writeLetterAtLocation(this, x, y, word, letter, orientation);
  };

  go.setWordAtLocation = function setWordAtLocation(x: number, y: number, word: WordEntry, orientation: Orientation): void {
    this.placedWords.push({ x, y, term: word.term, definition: word.definition, orientation, number: 0 });
    this.wordPool = sortLikeLegacy(
      this.wordPool.filter((candidate) => candidate.term !== word.term),
      rng
    );

    for (let i = 0; i < word.term.length; i += 1) {
      if (orientation === 0) {
        this.setLetterAtLocation(x + i, y, word, word.term[i], orientation);
      } else {
        this.setLetterAtLocation(x, y + i, word, word.term[i], orientation);
      }
    }

    for (let i = 0; i < word.term.length; i += 1) {
      if (orientation === 0) {
        if (this.isLocationFilled(x + i, y) === false) this.testWordsAtLocation(x + i, y, word.term[i], 1);
      } else if (this.isLocationFilled(x, y + i) === false) {
        this.testWordsAtLocation(x, y + i, word.term[i], 0);
      }
    }
  };

  go.testWordsAtLocation = function testWordsAtLocation(
    x: number,
    y: number,
    letter: string,
    orientation: Orientation
  ): void {
    const potentialWords = this.wordPool.filter((word) => word.term.indexOf(letter) >= 0);
    if (potentialWords.length === 0) return;

    let placedWord = false;

    for (let wi = 0; wi < potentialWords.length && placedWord === false; wi += 1) {
      const word = potentialWords[wi];
      let li = word.term.indexOf(letter);

      while (li !== -1 && placedWord === false) {
        const offset = 0 - li;
        let canPlaceWord = true;

        if (orientation === 0) {
          if (this.isLocationValid(x + offset - 1, y, "!", orientation, true) === false) canPlaceWord = false;
          if (this.isLocationValid(x + offset + word.term.length, y, "!", orientation, true) === false) {
            canPlaceWord = false;
          }
        } else {
          if (this.isLocationValid(x, y + offset - 1, "!", orientation, true) === false) canPlaceWord = false;
          if (this.isLocationValid(x, y + offset + word.term.length, "!", orientation, true) === false) {
            canPlaceWord = false;
          }
        }

        for (let i = 0; i < word.term.length && canPlaceWord === true; i += 1) {
          if (orientation === 0) {
            if (this.isLocationValid(x + offset + i, y, word.term[i], orientation) === false) canPlaceWord = false;
          } else if (this.isLocationValid(x, y + offset + i, word.term[i], orientation) === false) {
            canPlaceWord = false;
          }
        }

        if (canPlaceWord) {
          if (orientation === 0) {
            this.setWordAtLocation(x + offset, y, word, orientation);
          } else {
            this.setWordAtLocation(x, y + offset, word, orientation);
          }

          placedWord = true;
        }

        li = word.term.indexOf(letter, li + 1);
      }
    }
  };

  go.validatePuzzle = function validatePuzzle(): boolean {
    return validateLegacyPuzzle(this);
  };

  return go;
}

export function generateLegacyPuzzle(options: GenerateLegacyPuzzleOptions = {}): GeneratedLegacyPuzzle {
  let previousWordCount = 0;
  let currentWordCount = 0;
  let attempts = 0;
  let go!: LegacyGameObject;

  do {
    go = createLegacyGameObject(options);

    const initialWord = go.wordPool[0];
    const initialX = Math.floor((go.playfieldSize - initialWord.term.length) * 0.5);
    const initialY = Math.floor((go.playfieldSize - 1) * 0.5);
    go.setWordAtLocation(initialX, initialY, initialWord, 0);

    if (previousWordCount < currentWordCount && attempts < 25) previousWordCount = currentWordCount;
    currentWordCount = go.placedWords.length;
    attempts += 1;
  } while (currentWordCount < previousWordCount || attempts < 25);

  return {
    game: go,
    isValid: go.validatePuzzle(),
    numberedWords: numberPlacedWords(go),
    attempts
  };
}

export { DEFAULT_WORDS, createSeededRng, numberPlacedWords, summarizePuzzle };
