import { describe, it, expect } from "vitest";
import { getNeighbors, hasMoves, checkMerge, createEmptyGrid, COLS, ROWS } from "@/lib/engines";

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
