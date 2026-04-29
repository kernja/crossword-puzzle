import { DEFAULT_WORDS } from "./default-words.ts";
import { numberPlacedWords } from "./numbering.ts";
import { createSeededRng, sortLikeLegacy } from "./random.ts";
import { summarizePuzzle } from "./summary.ts";
import type {
  CreateLegacyGameObjectOptions,
  GenerateLegacyPuzzleOptions,
  GeneratedLegacyPuzzle,
  GridCell,
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

  go.grid = Array.from({ length: go.playfieldSize }, () =>
    Array(go.playfieldSize)
      .fill(null)
      .map(
        (): GridCell => ({
          letter: "",
          horizontalTerm: "",
          verticalTerm: ""
        })
      )
  );
  go.wordPool = sortLikeLegacy(go.allAvailableWords, rng).filter((word) => word.term.length < go.playfieldSize);

  go.isLocationOutOfBounds = function isLocationOutOfBounds(x: number, y: number): boolean {
    if (x < 0) return true;
    if (x >= this.playfieldSize) return true;
    if (y < 0) return true;
    if (y >= this.playfieldSize) return true;

    return false;
  };

  go.isLocationOccupied = function isLocationOccupied(x: number, y: number, ignoreBounds = false): boolean {
    if (this.isLocationOutOfBounds(x, y) && ignoreBounds === true) return false;
    if (this.isLocationOutOfBounds(x, y)) return true;
    if (this.grid[x][y].letter === "") return false;

    return true;
  };

  go.isLocationFilled = function isLocationFilled(x: number, y: number): boolean {
    if (this.isLocationOutOfBounds(x, y)) return true;

    return this.grid[x][y].horizontalTerm !== "" && this.grid[x][y].verticalTerm !== "";
  };

  go.isLocationOverlapping = function isLocationOverlapping(x: number, y: number, letter = ""): boolean {
    if (this.grid[x][y].letter === "") return false;
    if (this.grid[x][y].letter === letter) return true;

    return false;
  };

  go.isLocationValid = function isLocationValid(
    x: number,
    y: number,
    letter: string,
    orientation: Orientation,
    boundsCheckOnly = false
  ): boolean {
    if (boundsCheckOnly && this.isLocationOutOfBounds(x, y)) return true;

    if (orientation === 0) {
      if (this.isLocationOutOfBounds(x, y)) return false;
      if (this.isLocationFilled(x, y)) return false;
      if (this.isLocationOverlapping(x, y, letter) === false) {
        if (this.isLocationOccupied(x, y - 1)) return false;
        if (this.isLocationOccupied(x, y + 1)) return false;
        if (this.isLocationOccupied(x, y)) return false;
      }
    } else {
      if (this.isLocationOutOfBounds(x, y)) return false;
      if (this.isLocationFilled(x, y)) return false;
      if (this.isLocationOverlapping(x, y, letter) === false) {
        if (this.isLocationOccupied(x - 1, y)) return false;
        if (this.isLocationOccupied(x + 1, y)) return false;
        if (this.isLocationOccupied(x, y)) return false;
      }
    }

    return true;
  };

  go.setLetterAtLocation = function setLetterAtLocation(
    x: number,
    y: number,
    word: WordEntry,
    letter: string,
    orientation: Orientation
  ): void {
    this.grid[x][y].letter = letter;
    if (orientation === 0) {
      this.grid[x][y].horizontalTerm = word.term;
    } else {
      this.grid[x][y].verticalTerm = word.term;
    }
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
    let isValidated = true;
    this.placedWords.forEach((item) => {
      if (item.orientation === 0) {
        if (go.isLocationOccupied(item.x - 1, item.y, true) || go.isLocationOccupied(item.x + item.term.length, item.y, true)) {
          isValidated = false;
        }
      } else if (go.isLocationOccupied(item.x, item.y - 1, true) || go.isLocationOccupied(item.x, item.y + item.term.length, true)) {
        isValidated = false;
      }
    });

    return isValidated;
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
