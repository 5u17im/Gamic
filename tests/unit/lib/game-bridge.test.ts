import { describe, it, expect } from "vitest";
import { GameBridge, createGameBridgeUrl } from "@/lib/game-bridge";

describe("GameBridge", () => {
  describe("parseScore", () => {
    it("parses score from score message", () => {
      const result = GameBridge.parseScore({
        type: "score",
        payload: { score: 100 },
        timestamp: Date.now(),
      });
      expect(result).toEqual({ score: 100, duration: 0, metadata: undefined });
    });

    it("parses score from gameover message", () => {
      const result = GameBridge.parseScore({
        type: "gameover",
        payload: { score: 500, duration: 120 },
        timestamp: Date.now(),
      });
      expect(result).toEqual({ score: 500, duration: 120, metadata: undefined });
    });

    it("returns null for non-score messages", () => {
      const result = GameBridge.parseScore({
        type: "ready",
        timestamp: Date.now(),
      });
      expect(result).toBeNull();
    });

    it("returns null if payload is missing", () => {
      const result = GameBridge.parseScore({
        type: "score",
        timestamp: Date.now(),
      });
      expect(result).toBeNull();
    });
  });
});

describe("createGameBridgeUrl", () => {
  it("creates loader URL for game slug", () => {
    expect(createGameBridgeUrl("hex-merge")).toBe("/api/games/hex-merge/loader");
  });
});
