export type Orientation = 0 | 1;

export type WordEntry = {
  term: string;
  definition: string;
};

export type GridCell = {
  letter: string;
  horizontalTerm: string;
  verticalTerm: string;
};

export type PlacedWord = {
  x: number;
  y: number;
  term: string;
  definition: string;
  orientation: Orientation;
  number: number;
};

export type LegacyGameObject = {
  allAvailableWords: WordEntry[];
  wordPool: WordEntry[];
  placedWords: PlacedWord[];
  playfieldSize: number;
  grid: GridCell[][];
  isLocationOutOfBounds(x: number, y: number): boolean;
  isLocationOccupied(x: number, y: number, ignoreBounds?: boolean): boolean;
  isLocationFilled(x: number, y: number): boolean;
  isLocationOverlapping(x: number, y: number, letter?: string): boolean;
  isLocationValid(x: number, y: number, letter: string, orientation: Orientation, boundsCheckOnly?: boolean): boolean;
  setLetterAtLocation(x: number, y: number, word: WordEntry, letter: string, orientation: Orientation): void;
  setWordAtLocation(x: number, y: number, word: WordEntry, orientation: Orientation): void;
  testWordsAtLocation(x: number, y: number, letter: string, orientation: Orientation): void;
  validatePuzzle(): boolean;
};

export type CreateLegacyGameObjectOptions = {
  playfieldSize?: number;
  words?: WordEntry[];
  rng?: () => number;
};

export type GenerateLegacyPuzzleOptions = CreateLegacyGameObjectOptions;

export type GeneratedLegacyPuzzle = {
  game: LegacyGameObject;
  isValid: boolean;
  numberedWords: PlacedWord[];
  attempts: number;
};

// This is the bridge type for the future core API.
// For now it intentionally wraps the locked legacy shape rather than inventing a new model too early.
export type CrosswordPuzzle = GeneratedLegacyPuzzle;

export type ValidationResult = {
  isValid: boolean;
};

export type CoreCell = {
  x: number;
  y: number;
  solution: string;
  entry: string;
  isBlock: boolean;
  acrossTerm: string | null;
  downTerm: string | null;
};

export type CorePlacedWord = {
  term: string;
  definition: string;
  x: number;
  y: number;
  direction: "across" | "down";
  number: number;
};

export type CorePuzzle = {
  size: number;
  cells: CoreCell[][];
  words: CorePlacedWord[];
  isValid: boolean;
};

export type PuzzleSummary = {
  size: number;
  attempts: number;
  isValid: boolean;
  placedWordCount: number;
  firstWord: PlacedWord | undefined;
  words: Array<{
    term: string;
    x: number;
    y: number;
    orientation: Orientation;
    number: number;
  }>;
};
