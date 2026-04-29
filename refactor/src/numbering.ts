import type { LegacyGameObject, PlacedWord } from "./types.ts";

export function numberPlacedWords(go: LegacyGameObject): PlacedWord[] {
  const placedWords = [...go.placedWords].sort((a, b) => a.y - b.y || a.x - b.x);
  let wordCount = 0;

  for (let y = 0; y < go.playfieldSize; y += 1) {
    for (let x = 0; x < go.playfieldSize; x += 1) {
      const filteredWords = placedWords.filter((word) => word.x === x && word.y === y);
      if (filteredWords.length > 0) {
        wordCount += 1;
        filteredWords.forEach((word) => {
          word.number = wordCount;
        });
      }
    }
  }

  return placedWords;
}
