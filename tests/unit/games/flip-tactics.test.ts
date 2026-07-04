import { describe, it, expect } from "vitest";

// Flip Tactics core logic
const CARD_COLORS = ["#6C5CE7", "#00CEC9", "#FDCB6E", "#E17055", "#FD79A8", "#00B894", "#0984E3", "#F39C12"];

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createCards(count: number): { pairIdx: number; color: string; flipped: boolean; matched: boolean }[] {
  const pairs = [];
  for (let i = 0; i < count / 2; i++) {
    pairs.push(i, i);
  }
  const shuffled = shuffle(pairs);
  return shuffled.map((pairIdx) => ({
    pairIdx,
    color: CARD_COLORS[pairIdx % CARD_COLORS.length],
    flipped: false,
    matched: false,
  }));
}

function checkMatch(cards: { pairIdx: number; flipped: boolean }[], idx1: number, idx2: number): boolean {
  return cards[idx1].pairIdx === cards[idx2].pairIdx;
}

function calculateFlipScore(hasSpecial: boolean[], multiplier: number): number {
  const base = hasSpecial.reduce((sum, s) => sum + (s ? 100 : 0), 50);
  return base * multiplier;
}

describe("Flip Tactics - Game Logic", () => {
  describe("createCards", () => {
    it("creates correct number of cards", () => {
      const cards = createCards(16);
      expect(cards.length).toBe(16);
    });

    it("creates pairs", () => {
      const cards = createCards(16);
      const counts = new Map<number, number>();
      cards.forEach((c) => counts.set(c.pairIdx, (counts.get(c.pairIdx) || 0) + 1));
      counts.forEach((count) => expect(count).toBe(2));
    });

    it("all cards start unflipped and unmatched", () => {
      const cards = createCards(16);
      cards.forEach((c) => {
        expect(c.flipped).toBe(false);
        expect(c.matched).toBe(false);
      });
    });
  });

  describe("checkMatch", () => {
    it("detects matching cards", () => {
      const cards = [
        { pairIdx: 0, flipped: false },
        { pairIdx: 1, flipped: false },
        { pairIdx: 0, flipped: false },
      ];
      expect(checkMatch(cards, 0, 2)).toBe(true);
      expect(checkMatch(cards, 0, 1)).toBe(false);
    });
  });

  describe("calculateFlipScore", () => {
    it("base score without specials", () => {
      expect(calculateFlipScore([false, false], 1)).toBe(50);
    });

    it("doubles with special cards", () => {
      expect(calculateFlipScore([true, false], 1)).toBe(150);
    });

    it("multiplies score", () => {
      expect(calculateFlipScore([false, false], 3)).toBe(150);
    });
  });

  describe("shuffle", () => {
    it("returns all elements", () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffle(input);
      expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it("does not mutate original", () => {
      const input = [1, 2, 3];
      const result = shuffle(input);
      expect(input).toEqual([1, 2, 3]);
    });
  });
});
