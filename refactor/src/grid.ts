import type { GridCell, LegacyGameObject } from "./types.ts";

export function createEmptyGrid(playfieldSize: number): GridCell[][] {
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
  if (x < 0) return true;
  if (x >= go.playfieldSize) return true;
  if (y < 0) return true;
  if (y >= go.playfieldSize) return true;

  return false;
}

export function isLocationOccupied(go: LegacyGameObject, x: number, y: number, ignoreBounds = false): boolean {
  if (isLocationOutOfBounds(go, x, y) && ignoreBounds === true) return false;
  if (isLocationOutOfBounds(go, x, y)) return true;
  if (go.grid[x][y].letter === "") return false;

  return true;
}

export function isLocationFilled(go: LegacyGameObject, x: number, y: number): boolean {
  if (isLocationOutOfBounds(go, x, y)) return true;

  return go.grid[x][y].horizontalTerm !== "" && go.grid[x][y].verticalTerm !== "";
}

export function isLocationOverlapping(go: LegacyGameObject, x: number, y: number, letter = ""): boolean {
  if (go.grid[x][y].letter === "") return false;
  if (go.grid[x][y].letter === letter) return true;

  return false;
}
