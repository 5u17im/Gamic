export const COLS = 6;
export const ROWS = 7;
export const COLORS = ["#6C5CE7", "#00CEC9", "#FD79A8", "#FDCB6E", "#E17055", "#00B894"];

export function getNeighbors(r: number, c: number): { r: number; c: number }[] {
  const dirs =
    r % 2 === 0
      ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
      : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
  return dirs
    .map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
    .filter((n) => n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS);
}

export function hasMoves(grid: (number | null)[][]): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === null) return true;
    }
  }
  return false;
}

export function checkMerge(grid: (number | null)[][], row: number, col: number): { merged: boolean; score: number; cleared: { r: number; c: number }[] } {
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

export function createEmptyGrid(): (number | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}
