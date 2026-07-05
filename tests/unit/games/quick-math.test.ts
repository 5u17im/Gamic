import { describe, it, expect } from "vitest";
import { generateProblem, generateOptions, calculateScore } from "@/lib/engines";

describe("Quick Math - Game Logic", () => {
  describe("generateProblem", () => {
    it("generates valid addition", () => {
      const p = generateProblem();
      expect(typeof p.a).toBe("number");
      expect(typeof p.b).toBe("number");
      expect(["+", "-", "×"]).toContain(p.op);
      expect(typeof p.answer).toBe("number");
    });

    it("addition answer is correct", () => {
      for (let i = 0; i < 50; i++) {
        const p = generateProblem();
        if (p.op === "+") {
          expect(p.answer).toBe(p.a + p.b);
        }
      }
    });

    it("multiplication answer is correct", () => {
      for (let i = 0; i < 50; i++) {
        const p = generateProblem();
        if (p.op === "×") {
          expect(p.answer).toBe(p.a * p.b);
        }
      }
    });

    it("subtraction is non-negative", () => {
      for (let i = 0; i < 50; i++) {
        const p = generateProblem();
        if (p.op === "-") {
          expect(p.answer).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe("generateOptions", () => {
    it("includes the correct answer", () => {
      const options = generateOptions(42);
      expect(options).toContain(42);
    });

    it("returns exactly 4 options", () => {
      const options = generateOptions(100);
      expect(options.length).toBe(4);
    });

    it("all options are unique", () => {
      for (let i = 0; i < 20; i++) {
        const options = generateOptions(Math.floor(Math.random() * 100));
        expect(new Set(options).size).toBe(options.length);
      }
    });
  });

  describe("calculateScore", () => {
    it("adds base 10 for correct answer", () => {
      const result = calculateScore(0, 0, true);
      expect(result.score).toBe(10);
      expect(result.streak).toBe(1);
    });

    it("adds streak bonus", () => {
      const result = calculateScore(0, 5, true);
      expect(result.score).toBe(20);
      expect(result.streak).toBe(6);
    });

    it("resets streak on incorrect", () => {
      const result = calculateScore(50, 10, false);
      expect(result.score).toBe(50);
      expect(result.streak).toBe(0);
    });
  });
});
