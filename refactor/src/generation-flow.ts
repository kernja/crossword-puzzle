import type { GenerateLegacyPuzzleOptions, LegacyGameObject, WordEntry } from "./types.ts";

type CreateGameObject = (options?: GenerateLegacyPuzzleOptions) => LegacyGameObject;

type PlacementSeed = {
  initialWord: WordEntry;
  initialX: number;
  initialY: number;
};

type GenerationAttempt = {
  attempts: number;
  game: LegacyGameObject;
};

// Mirrors the legacy "first word in the middle" strategy before recursive expansion begins.
export function getInitialPlacementSeed(go: LegacyGameObject): PlacementSeed {
  const initialWord = go.wordPool[0];
  const initialX = Math.floor((go.playfieldSize - initialWord.term.length) * 0.5);
  const initialY = Math.floor((go.playfieldSize - 1) * 0.5);

  return {
    initialWord,
    initialX,
    initialY
  };
}

// Runs one full legacy attempt: create a fresh game, seed the first word, then let recursion take over.
export function runLegacyGenerationAttempt(
  createGameObject: CreateGameObject,
  options: GenerateLegacyPuzzleOptions = {}
): LegacyGameObject {
  const go = createGameObject(options);
  const { initialWord, initialX, initialY } = getInitialPlacementSeed(go);

  go.setWordAtLocation(initialX, initialY, initialWord, 0);

  return go;
}

// Preserves the original retry heuristic: establish a baseline, then keep trying until a run meets it.
export function runLegacyGenerationLoop(
  createGameObject: CreateGameObject,
  options: GenerateLegacyPuzzleOptions = {}
): GenerationAttempt {
  let previousWordCount = 0;
  let currentWordCount = 0;
  let attempts = 0;
  let go!: LegacyGameObject;

  do {
    go = runLegacyGenerationAttempt(createGameObject, options);

    if (previousWordCount < currentWordCount && attempts < 25) previousWordCount = currentWordCount;
    currentWordCount = go.placedWords.length;
    attempts += 1;
  } while (currentWordCount < previousWordCount || attempts < 25);

  return { attempts, game: go };
}
