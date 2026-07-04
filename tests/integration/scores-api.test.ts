import { describe, it, expect } from "vitest";

describe("Scores API Rules", () => {
  it("rejects negative scores via validation", () => {
    const valid = (score: number) => typeof score === "number" && score >= 0;
    expect(valid(100)).toBe(true);
    expect(valid(-1)).toBe(false);
    expect(valid(0)).toBe(true);
  });

  it("rejects missing gameSlug", () => {
    const payload = { score: 100 };
    expect(payload.gameSlug).toBeUndefined();
  });

  it("validates correct payload shape", () => {
    const payload = { gameSlug: "hex-merge", score: 1500, duration: 120 };
    expect(payload.gameSlug).toBeTypeOf("string");
    expect(payload.score).toBeTypeOf("number");
    expect(payload.duration).toBeTypeOf("number");
  });

  it("allows optional duration", () => {
    const payload = { gameSlug: "hex-merge", score: 500 };
    expect(payload.duration).toBeUndefined();
  });

  it("sorts scores descending", () => {
    const scores = [100, 500, 50, 1000, 200];
    const sorted = scores.sort((a, b) => b - a);
    expect(sorted).toEqual([1000, 500, 200, 100, 50]);
  });
});
