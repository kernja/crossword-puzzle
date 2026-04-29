# Crossword Puzzle Modernization Plan

## Repo Snapshot

Current repository contents are intentionally small and static:

- `src/index.html` bootstraps the page and loads jQuery from a CDN.
- `src/script.js` contains generation logic, puzzle validation, word numbering, and DOM rendering in one file.
- `src/style.css` provides basic board styling.

The current app works as a browser-opened HTML page with no build step. The generator already has a few traits that matter for the migration:

- Puzzle generation is stateful and mutable.
- Core logic is embedded in a `generateEmptyGameObject()` factory with methods attached to the returned object.
- Rendering is tightly coupled to the puzzle data structure.
- Validation is partial and currently warns with `alert(...)` after generation.
- The UI still uses `<input>` per playable cell, which conflicts with the mobile-first direction.

## What The Current Code Is Doing

The existing flow is:

`word list -> shuffled pool -> recursive placement by intersections -> validation warning -> DOM render`

Important behavior worth preserving before refactoring:

- The first word is placed horizontally near the middle of the grid.
- Additional words are placed by scanning letters and trying candidate intersections.
- Orientation alternates through recursive expansion rather than global search.
- The generator prefers "more placed words" by retrying puzzle generation several times.
- Start-of-word numbering is computed during render, not during generation.

These details should be captured by tests before the implementation changes.

## Recommendation

Use `Vite + React + TypeScript`, not `Vite + Vue`.

Why this is the better fit here:

- Your day job stack is already `Node.js + TypeScript + React`, which lowers maintenance cost.
- The future larger project will likely benefit from shared component patterns, state models, and testing conventions that match your in-house work.
- React is a strong fit for a controlled, state-driven crossword board where selection, cursor direction, soft keyboard input, and revealed/entered letters all live in app state.
- Vite gives you the modern dev/build/test baseline without imposing a larger framework architecture too early.

Vue would also work technically, but it introduces an extra framework choice without a clear upside for this repo's stated direction.

## Target Architecture

Suggested structure:

```text
src/
  app/
    App.tsx
    routes-or-screens/
  core/
    crossword-types.ts
    generate-crossword.ts
    validate-grid.ts
    numbering.ts
    cell-queries.ts
    answer-checking.ts
  features/crossword/
    components/
      CrosswordBoard.tsx
      CrosswordCell.tsx
      SoftKeyboard.tsx
      ClueList.tsx
    hooks/
      useCrosswordGame.ts
      useGridNavigation.ts
    state/
      crossword-state.ts
  test/
    fixtures/
```

Design rules:

- `core/` contains pure functions only.
- No DOM access, browser globals, jQuery, or React in `core/`.
- UI state and puzzle state are separated.
- The board renders semantic buttons/divs, not form inputs per cell.
- Character handling is string-based and Unicode-safe.

## Migration Phases

## Phase 1: Lock Down Existing Behavior

Goal: preserve the current generator while making change safe.

Work:

- Add a project toolchain with `TypeScript`, `Vite`, and `Vitest`.
- Add characterization tests around the current generator behavior before rewriting it.
- Freeze at least one or two deterministic fixtures by replacing `Math.random()` during tests with a seeded source.
- Add tests for:
  - grid dimensions
  - placed words are within bounds
  - placed word letters appear correctly in the grid
  - intersections preserve matching letters
  - initial word placement is centered as today
  - validation catches known invalid side-by-side cases

Notes:

- Because the current code shuffles with `Math.random()`, test reliability will improve if randomness is injected rather than called globally.
- This phase is about protecting behavior, not yet improving algorithm quality.

## Phase 2: Extract A Pure Crossword Engine

Goal: move puzzle logic out of the UI and into testable modules.

Proposed public API:

```ts
type Direction = "across" | "down";

type WordEntry = {
  term: string;
  definition: string;
};

type Cell = {
  solution: string;
  entry: string;
  acrossTerm?: string;
  downTerm?: string;
  number?: number;
};

type CrosswordPuzzle = {
  size: number;
  cells: Cell[][];
  placedWords: PlacedWord[];
};

function generateCrossword(words: WordEntry[], options?: GenerateOptions): CrosswordPuzzle;
function validateGrid(puzzle: CrosswordPuzzle): ValidationResult;
function getCell(puzzle: CrosswordPuzzle, row: number, col: number): Cell | null;
function getWordAtCell(puzzle: CrosswordPuzzle, row: number, col: number, direction: Direction): PlacedWord | null;
function checkAnswer(puzzle: CrosswordPuzzle, row: number, col: number, value: string): CheckResult;
```

Extraction steps:

- Convert the mutable `go` object methods into named module functions.
- Normalize coordinates to `row/col` or `x/y` consistently everywhere.
- Separate solution letters from player-entered letters.
- Move numbering logic out of render and into a pure `numbering` step.
- Replace `alert(...)` with returned validation results.

This phase should keep the current generation algorithm mostly intact, even if the internals are cleaned up.

## Phase 3: Introduce The Modern App Shell

Goal: replace the static HTML page with a typed, component-based app shell.

Suggested setup:

- `Vite`
- `React`
- `TypeScript`
- `Vitest`
- `Testing Library`
- `ESLint`
- `Prettier`

Optional but useful soon:

- `Zod` for validating imported word/clue sets
- `i18next` or `react-intl` once you start true localization work

App responsibilities:

- load word data
- generate or regenerate puzzle
- own selection state
- own player entry state
- render board, clues, status, and keyboard

## Phase 4: Replace Inputs With Controlled Grid Cells

Goal: make the board feel like a game board rather than a form.

Implementation direction:

- Render each playable square as a `button` or focusable `div`.
- Keep the selected cell in app state.
- Keep entered letters in state, not in DOM inputs.
- Use one top-level keyboard handler for hardware keyboards.
- Use on-screen controls for mobile and touch-first input.

Suggested state:

```ts
type Selection = {
  row: number;
  col: number;
  direction: "across" | "down";
};

type GameState = {
  puzzle: CrosswordPuzzle;
  selection: Selection | null;
  mode: "alpha" | "special";
};
```

This change directly addresses the mobile keyboard issues and gives you full control over navigation.

## Phase 5: Add Cursor And Navigation Rules

Goal: make interaction predictable and puzzle-native.

Behavior to support:

- arrow keys move the current selection
- tap a cell to select it
- tap the selected cell to toggle `across/down`
- typing a letter fills the current cell and advances
- backspace clears the current cell, then moves backward when appropriate
- selecting a cell prefers the active word direction when possible

Implementation advice:

- Keep navigation logic in a dedicated hook or controller such as `useGridNavigation`.
- Base movement on the current word path, not just the next physical square.
- Distinguish between blocked cells, playable cells, and clue starts.

Testing:

- unit test navigation helpers
- component test keyboard interaction
- mobile/touch smoke test in browser

## Phase 6: Add A Soft Keyboard

Goal: support touch-first play and language-flexible entry.

Key constraints from your plan that are worth keeping:

- Do not rebuild a full QWERTY keyboard.
- Provide a compact alpha keyboard plus a special-character mode.
- Include directional controls and backspace.

Suggested design:

- primary letter bank: `A-Z`
- alternate bank: language-specific characters such as `A-acute`, `N-tilde`, `C-cedilla`, `A-tilde`, `O-tilde`
- controls: arrows, backspace, direction toggle

Future-friendly direction:

- make the special key set data-driven per language pack
- keep character input Unicode-safe from the start

## Phase 7: Mobile-First Layout

Goal: make the experience feel like a handheld puzzle app.

Layout priorities:

- fixed main play area
- large tap targets
- responsive board sizing based on viewport
- no browser text input focus requirements
- no accidental zoom triggers
- clue list and controls positioned for thumb reach on small screens

CSS approach:

- CSS Grid for the board
- CSS custom properties for tile sizing and theme
- `aspect-ratio` for cells
- viewport-aware sizing with sensible min/max constraints

## Phase 8: Language-Flexible Tile Rendering

Goal: support accented and non-basic Latin characters cleanly.

Replace the current image-like tile assumptions with text-driven tiles:

- cell contents rendered as text nodes
- font chosen for clear accented-character support
- uppercase/lowercase behavior defined intentionally per language
- avoid assumptions that one cell always equals one ASCII character

This is also where future localization becomes easier:

- clue text can be translated independently
- special character sets can vary per puzzle language
- theming becomes pure CSS rather than asset-based

## Testing Strategy

Recommended test layers:

1. Core unit tests
   - generator helpers
   - validation
   - numbering
   - answer checking

2. Characterization tests
   - current algorithm behavior under seeded randomness

3. Component tests
   - board rendering
   - selection and direction toggling
   - soft keyboard input

4. End-to-end smoke tests
   - generate puzzle
   - fill letters
   - navigate on desktop and mobile viewport

Potential tooling:

- `Vitest` for unit/component tests
- `@testing-library/react`
- `Playwright` for interaction smoke tests

## Risks And Technical Notes

Known risks in the current implementation:

- randomness is not deterministic, which makes regressions hard to detect
- generator, validation, and rendering are tightly coupled
- current validation does not fully prove crossword correctness
- `x/y` indexing is easy to misread because grid access uses `grid[x][y]`
- the generated puzzle may still be invalid even after retry attempts

Recommended mitigation:

- inject a random source into the generator
- add fixtures and seeded test runs early
- separate "preserve current behavior" from "improve generation quality"
- define a stable puzzle data model before building the new UI

## Suggested Implementation Order

1. Set up `Vite + React + TypeScript + Vitest`.
2. Port the existing generator into TypeScript with minimal behavior change.
3. Add tests around generation, validation, and numbering.
4. Extract `core/` modules and pure types.
5. Build the new board UI with controlled cells.
6. Add navigation and selection behavior.
7. Add soft keyboard and mobile-first layout.
8. Reintroduce clues, answer checking, and future i18n hooks.
9. Only after behavior is stable, consider improving the generation algorithm itself.

## Nice Follow-Up Deliverables

After this planning step, the next most useful concrete artifacts would be:

- a `TECH_SPEC.md` for the puzzle data model
- a seeded test fixture for the current generator
- a Vite React TypeScript scaffold
- a first-pass `core/generate-crossword.ts` port

## Bottom Line

Modernize in two tracks:

- first, preserve and isolate the generator
- second, rebuild the interaction layer as a controlled, mobile-first React app

That path gives you the safest migration now and the best runway for a future language-learning product.
