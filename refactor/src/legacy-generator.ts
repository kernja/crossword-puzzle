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
import { setWordAtLocation as placeWordAtLocation, testWordsAtLocation as expandFromLocation } from "./word-placement.ts";
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

  // Keep the single mutable game object shape so the legacy flow stays easy to compare to src/script.js.
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
    placeWordAtLocation(this, x, y, word, orientation, rng);
  };

  go.testWordsAtLocation = function testWordsAtLocation(
    x: number,
    y: number,
    letter: string,
    orientation: Orientation
  ): void {
    expandFromLocation(this, x, y, letter, orientation);
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
    // Each attempt starts from a fresh shuffled game object, matching the current retry strategy.
    go = createLegacyGameObject(options);

    const initialWord = go.wordPool[0];
    const initialX = Math.floor((go.playfieldSize - initialWord.term.length) * 0.5);
    const initialY = Math.floor((go.playfieldSize - 1) * 0.5);
    // Seed the first word near the center to maximize follow-up placement opportunities.
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
