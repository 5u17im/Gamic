import { describe, it, expect } from "vitest";
import { shuffle, createCards, checkMatch, calculateFlipScore } from "@/lib/engines";

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
