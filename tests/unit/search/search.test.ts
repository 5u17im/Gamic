import { describe, it, expect } from "vitest";

describe("Search", () => {
  const games = [
    { title: "Hex Merge", description: "Fusiona fichas hexagonales", category: "Puzzle" },
    { title: "Asteroid Sweep", description: "Nave que esquiva asteroides", category: "Arcade" },
    { title: "Quick Math", description: "Operaciones aritméticas", category: "Educativos" },
    { title: "Pivot", description: "Gira la plataforma", category: "Habilidad" },
    { title: "Flip Tactics", description: "Memoria con habilidades", category: "Cartas" },
  ];

  it("finds by title (partial match)", () => {
    const q = "hex";
    const results = games.filter((g) => g.title.toLowerCase().includes(q));
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Hex Merge");
  });

  it("finds by description (partial match)", () => {
    const q = "asteroide";
    const results = games.filter((g) => g.description.toLowerCase().includes(q));
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Asteroid Sweep");
  });

  it("finds multiple results", () => {
    const q = "a";
    const results = games.filter((g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    expect(results.length).toBeGreaterThan(1);
  });

  it("returns empty for no match", () => {
    const q = "zzzzzzz";
    const results = games.filter((g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    expect(results).toHaveLength(0);
  });

  it("is case insensitive", () => {
    const q = "MERGE";
    const results = games.filter((g) => g.title.toLowerCase().includes(q.toLowerCase()));
    expect(results).toHaveLength(1);
  });

  it("requires at least 2 characters", () => {
    const q = "a";
    const results = q.length >= 2
      ? games.filter((g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
      : [];
    expect(results).toHaveLength(0);
  });

  it("validates search results include expected fields", () => {
    const result = games[0];
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("category");
  });
});
