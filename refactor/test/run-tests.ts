import assert from "node:assert/strict";
import fixture from "./fixtures/seed-1234-summary.json" with { type: "json" };
import {
  createLegacyGameObject,
  createSeededRng,
  generateLegacyPuzzle,
  summarizePuzzle
} from "../src/legacy-generator.ts";

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
