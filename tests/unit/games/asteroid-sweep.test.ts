import { describe, it, expect } from "vitest";
import { createBullet, createAsteroid, checkCollision, calculateAsteroidScore } from "@/lib/engines";

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

  describe("calculateAsteroidScore", () => {
    it("gives more points for smaller asteroids", () => {
      const small = calculateAsteroidScore(20);
      const large = calculateAsteroidScore(50);
      expect(small).toBeGreaterThan(large);
    });

    it("returns at least 60 points", () => {
      expect(calculateAsteroidScore(50)).toBeGreaterThanOrEqual(60);
    });
  });
});
