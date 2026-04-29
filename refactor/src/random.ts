import type { WordEntry } from "./types.ts";

export function sortLikeLegacy(items: WordEntry[], rng: () => number): WordEntry[] {
  return [...items].sort(() => 0.5 - rng());
}

export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;

  return function seededRandom() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
