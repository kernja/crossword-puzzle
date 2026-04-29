import type { GridCell, LegacyGameObject } from "./types.ts";

export function createEmptyGrid(playfieldSize: number): GridCell[][] {
  // Each cell tracks both the solution letter and which across/down terms claim it.
  return Array.from({ length: playfieldSize }, () =>
    Array(playfieldSize)
      .fill(null)
      .map(
        (): GridCell => ({
          letter: "",
          horizontalTerm: "",
          verticalTerm: ""
        })
      )
  );
}

export function isLocationOutOfBounds(go: LegacyGameObject, x: number, y: number): boolean {
  // The legacy generator treats any coordinate outside the playfield as blocked.
  if (x < 0) return true;
  if (x >= go.playfieldSize) return true;
  if (y < 0) return true;
  if (y >= go.playfieldSize) return true;

  return false;
}

export function isLocationOccupied(go: LegacyGameObject, x: number, y: number, ignoreBounds = false): boolean {
  // Some boundary checks intentionally treat out-of-bounds as empty "padding".
  if (isLocationOutOfBounds(go, x, y) && ignoreBounds === true) return false;
  if (isLocationOutOfBounds(go, x, y)) return true;
  if (go.grid[x][y].letter === "") return false;

  return true;
}

export function isLocationFilled(go: LegacyGameObject, x: number, y: number): boolean {
  // A filled location is an intersection already claimed by both directions.
  if (isLocationOutOfBounds(go, x, y)) return true;

  return go.grid[x][y].horizontalTerm !== "" && go.grid[x][y].verticalTerm !== "";
}

export function isLocationOverlapping(go: LegacyGameObject, x: number, y: number, letter = ""): boolean {
  // Overlap is only valid when the existing letter matches the candidate letter.
  if (go.grid[x][y].letter === "") return false;
  if (go.grid[x][y].letter === letter) return true;

  return false;
}
