import { describe, it, expect } from "vitest";

// Asteroid Sweep core logic
function createBullet(x: number, y: number, angle: number) {
  const speed = 300;
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 60 };
}

function createAsteroid(x: number, y: number, size: number) {
  return { x, y, size, vx: 0, vy: 0, rotation: 0, rotSpeed: 0, vertices: 10 };
}

function checkCollision(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy < (ar + br) * (ar + br);
}

function calculateScore(size: number): number {
  return Math.ceil(100 / size * 30);
}

describe("Asteroid Sweep - Game Logic", () => {
  describe("createBullet", () => {
    it("creates bullet with correct trajectory", () => {
      const b = createBullet(100, 100, 0);
      expect(b.x).toBe(100);
      expect(b.y).toBe(100);
      expect(b.vx).toBe(300);
      expect(b.vy).toBe(0);
      expect(b.life).toBe(60);
    });

    it("creates bullet with vertical trajectory", () => {
      const b = createBullet(100, 100, -Math.PI / 2);
      expect(b.vx).toBeCloseTo(0);
      expect(b.vy).toBe(-300);
    });
  });

  describe("checkCollision", () => {
    it("detects overlapping circles", () => {
      expect(checkCollision(0, 0, 10, 5, 5, 10)).toBe(true);
    });

    it("detects non-overlapping circles", () => {
      expect(checkCollision(0, 0, 10, 100, 100, 10)).toBe(false);
    });

    it("detects almost touching circles", () => {
      expect(checkCollision(0, 0, 10, 19, 0, 10)).toBe(true);
    });
  });

  describe("calculateScore", () => {
    it("gives more points for smaller asteroids", () => {
      const small = calculateScore(20);
      const large = calculateScore(50);
      expect(small).toBeGreaterThan(large);
    });

    it("returns at least 60 points", () => {
      expect(calculateScore(50)).toBeGreaterThanOrEqual(60);
    });
  });
});
