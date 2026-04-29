import assert from "node:assert/strict";
import fixture from "./fixtures/seed-1234-summary.json" with { type: "json" };
import { generateCrossword, getCell, getWordAtCell, validateGrid } from "../src/core.ts";
import {
  createLegacyGameObject,
  createSeededRng,
  generateLegacyPuzzle,
  summarizePuzzle
} from "../src/legacy-generator.ts";
import { toCorePuzzle } from "../src/puzzle-adapter.ts";

type TestCase = {
  name: string;
  fn: () => void;
};

const tests: TestCase[] = [];

function test(name: string, fn: () => void): void {
  tests.push({ name, fn });
}

test("legacy generator creates a 15x15 grid by default", () => {
  const go = createLegacyGameObject({ rng: createSeededRng(1234) });

  assert.equal(go.grid.length, 15);
  assert.equal(go.grid[0].length, 15);
});

test("legacy generator places the initial word centered horizontally", () => {
  const rng = createSeededRng(1234);
  const result = generateLegacyPuzzle({ rng });
  const initialWord = result.game.placedWords[0];
  const expectedX = Math.floor((result.game.playfieldSize - initialWord.term.length) * 0.5);
  const expectedY = Math.floor((result.game.playfieldSize - 1) * 0.5);

  assert.equal(initialWord.orientation, 0);
  assert.equal(initialWord.x, expectedX);
  assert.equal(initialWord.y, expectedY);
});

test("legacy generator keeps all placed letters within bounds and matching the grid", () => {
  const result = generateLegacyPuzzle({ rng: createSeededRng(1234) });

  result.game.placedWords.forEach((word) => {
    for (let i = 0; i < word.term.length; i += 1) {
      const x = word.orientation === 0 ? word.x + i : word.x;
      const y = word.orientation === 0 ? word.y : word.y + i;

      assert.equal(result.game.isLocationOutOfBounds(x, y), false);
      assert.equal(result.game.grid[x][y].letter, word.term[i]);
    }
  });
});

test("legacy generator produces consistent overlaps for intersecting cells", () => {
  const result = generateLegacyPuzzle({ rng: createSeededRng(1234) });

  for (let x = 0; x < result.game.playfieldSize; x += 1) {
    for (let y = 0; y < result.game.playfieldSize; y += 1) {
      const cell = result.game.grid[x][y];
      if (cell.horizontalTerm !== "" && cell.verticalTerm !== "") {
        assert.notEqual(cell.letter, "");
      }
    }
  }
});

test("legacy validation flags words that touch end-to-end when they should not", () => {
  const go = createLegacyGameObject({ rng: createSeededRng(1) });
  go.grid[1][1].letter = "a";
  go.grid[1][1].verticalTerm = "alpha";
  go.placedWords.push({ x: 1, y: 2, term: "beta", definition: "", orientation: 1, number: 0 });
  go.grid[1][2].letter = "b";
  go.grid[1][2].verticalTerm = "beta";

  assert.equal(go.validatePuzzle(), false);
});

test("seeded puzzle summary stays stable for regression tracking", () => {
  const summary = summarizePuzzle(generateLegacyPuzzle({ rng: createSeededRng(1234) }));

  assert.deepEqual(summary, fixture.summary);
});

test("core generateCrossword preserves the legacy seeded puzzle behavior", () => {
  const summary = summarizePuzzle(generateCrossword(undefined, { rng: createSeededRng(1234) }));

  assert.deepEqual(summary, fixture.summary);
});

test("core helpers can read cells and words without direct legacy object access", () => {
  const puzzle = generateCrossword(undefined, { rng: createSeededRng(1234) });
  const cell = getCell(puzzle, 3, 7);
  const acrossWord = getWordAtCell(puzzle, 3, 7, 0);
  const downWord = getWordAtCell(puzzle, 3, 7, 1);

  assert.notEqual(cell, null);
  assert.equal(cell?.letter, "l");
  assert.equal(acrossWord?.term, "lawnmower");
  assert.equal(downWord?.term, "elephant");
});

test("core validateGrid matches the legacy validation result", () => {
  const puzzle = generateCrossword(undefined, { rng: createSeededRng(1234) });

  assert.deepEqual(validateGrid(puzzle), { isValid: true });
});

test("puzzle adapter exposes a UI-friendly core puzzle shape", () => {
  const puzzle = generateCrossword(undefined, { rng: createSeededRng(1234) });
  const corePuzzle = toCorePuzzle(puzzle);
  const lawnmower = corePuzzle.words.find((word) => word.term === "lawnmower");

  assert.equal(corePuzzle.size, 15);
  assert.equal(corePuzzle.isValid, true);
  assert.equal(corePuzzle.cells[3][7].solution, "l");
  assert.equal(corePuzzle.cells[3][7].isBlock, false);
  assert.equal(corePuzzle.cells[14][14].solution, "");
  assert.equal(corePuzzle.cells[14][14].isBlock, true);
  assert.notEqual(lawnmower, undefined);
  assert.equal(lawnmower?.direction, "across");
});

let failed = 0;

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
}

console.log(`\n${tests.length} test(s) passed.`);
