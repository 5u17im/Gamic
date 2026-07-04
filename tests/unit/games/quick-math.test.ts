import { describe, it, expect } from "vitest";

// Quick Math core logic extracted for testing
const OPERATORS = ["+", "-", "×"];

function generateProblem(): { a: number; b: number; op: string; answer: number } {
  const op = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
  let a: number, b: number, answer: number;
  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      break;
    default:
      throw new Error("Unknown operator");
  }
  return { a, b, op, answer };
}

function generateOptions(answer: number, count = 4): number[] {
  const options = new Set([answer]);
  while (options.size < count) {
    const offset = Math.floor(Math.random() * 10) + 1;
    const variant = Math.random() > 0.5 ? answer + offset : answer - offset;
    if (variant > 0) options.add(variant);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

function calculateScore(score: number, streak: number, correct: boolean): { score: number; streak: number } {
  if (correct) {
    return { score: score + 10 + streak * 2, streak: streak + 1 };
  }
  return { score, streak: 0 };
}

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
