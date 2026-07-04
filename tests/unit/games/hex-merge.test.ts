import { describe, it, expect } from "vitest";

// Hex Merge core logic extracted for testing
const COLS = 6;
const ROWS = 7;
const COLORS = ["#6C5CE7", "#00CEC9", "#FD79A8", "#FDCB6E", "#E17055", "#00B894"];

function getNeighbors(r: number, c: number): { r: number; c: number }[] {
  const dirs =
    r % 2 === 0
      ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
      : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
  return dirs
    .map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
    .filter((n) => n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS);
}

function hasMoves(grid: (number | null)[][]): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === null) return true;
    }
  }
  return false;
}

function checkMerge(grid: (number | null)[][], row: number, col: number): { merged: boolean; score: number; cleared: { r: number; c: number }[] } {
  const color = grid[row][col];
  if (color === null) return { merged: false, score: 0, cleared: [] };

  const neighbors = getNeighbors(row, col);
  const same = neighbors.filter((n) => grid[n.r][n.c] === color);

  if (same.length >= 2) {
    const cleared = [{ r: row, c: col }, ...same];
    cleared.forEach((n) => { grid[n.r][n.c] = null; });
    const score = (same.length + 1) * 10;
    return { merged: true, score, cleared };
  }
  return { merged: false, score: 0, cleared: [] };
}

function createEmptyGrid(): (number | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

describe("Hex Merge - Game Logic", () => {
  describe("getNeighbors", () => {
    it("returns neighbors for even row", () => {
      const ns = getNeighbors(0, 0);
      expect(ns.length).toBe(2);
      expect(ns).toContainEqual({ r: 0, c: 1 });
      expect(ns).toContainEqual({ r: 1, c: 0 });
    });

    it("returns neighbors for odd row", () => {
      const ns = getNeighbors(1, 0);
      expect(ns.length).toBe(5);
    });

    it("returns max neighbors for center cell", () => {
      const ns = getNeighbors(3, 3);
      expect(ns.length).toBe(6);
    });

    it("clamps neighbors at edges", () => {
      const ns = getNeighbors(0, 0);
      ns.forEach((n) => {
        expect(n.r).toBeGreaterThanOrEqual(0);
        expect(n.r).toBeLessThan(ROWS);
        expect(n.c).toBeGreaterThanOrEqual(0);
        expect(n.c).toBeLessThan(COLS);
      });
    });
  });

  describe("hasMoves", () => {
    it("returns true when grid has empty cells", () => {
      const grid = createEmptyGrid();
      grid[2][3] = 0;
      expect(hasMoves(grid)).toBe(true);
    });

    it("returns false when grid is full", () => {
      const grid = createEmptyGrid();
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          grid[r][c] = 0;
        }
      }
      expect(hasMoves(grid)).toBe(false);
    });
  });

  describe("checkMerge", () => {
    it("does not merge 1 neighbor", () => {
      const grid = createEmptyGrid();
      grid[0][0] = 0;
      grid[0][1] = 0;
      const result = checkMerge(grid, 0, 0);
      expect(result.merged).toBe(false);
    });

    it("merges 2+ same-color neighbors", () => {
      const grid = createEmptyGrid();
      grid[1][1] = 0;
      grid[1][2] = 0;
      grid[2][1] = 0;
      grid[2][2] = 0;
      const result = checkMerge(grid, 1, 1);
      expect(result.merged).toBe(true);
      expect(result.score).toBe(40);
      expect(result.cleared.length).toBe(4);
      result.cleared.forEach(({ r, c }) => {
        expect(grid[r][c]).toBeNull();
      });
    });

    it("does nothing with null cell", () => {
      const grid = createEmptyGrid();
      const result = checkMerge(grid, 0, 0);
      expect(result.merged).toBe(false);
      expect(result.score).toBe(0);
    });
  });
});
