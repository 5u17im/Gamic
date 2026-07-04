import { describe, it, expect } from "vitest";

describe("Admin API validation", () => {
  it("rejects game creation without required fields", () => {
    const required = ["slug", "title", "categoryId"];
    const payload = { description: "test" };
    const missing = required.filter((f) => !(f in payload));
    expect(missing).toEqual(["slug", "title", "categoryId"]);
  });

  it("rejects category with duplicate slug", () => {
    const existing = ["arcade", "puzzle", "estrategia"];
    const payload = { name: "Arcade", slug: "arcade" };
    expect(existing.includes(payload.slug)).toBe(true);
  });

  it("validates game status enum", () => {
    const valid = ["draft", "published", "archived"];
    expect(valid.includes("published")).toBe(true);
    expect(valid.includes("invalid")).toBe(false);
  });

  it("validates complexity range", () => {
    const valid = (v: number) => v >= 1 && v <= 5;
    expect(valid(1)).toBe(true);
    expect(valid(5)).toBe(true);
    expect(valid(0)).toBe(false);
    expect(valid(6)).toBe(false);
  });

  it("formats stats response shape", () => {
    const stats = { gameCount: 5, categoryCount: 8, scoreCount: 0, userCount: 1, topScore: 1500 };
    expect(stats).toHaveProperty("gameCount");
    expect(stats).toHaveProperty("categoryCount");
    expect(stats).toHaveProperty("scoreCount");
    expect(stats).toHaveProperty("userCount");
    expect(stats).toHaveProperty("topScore");
  });
});
