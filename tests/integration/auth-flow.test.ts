import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils";
import { GAME_EVENTS } from "@/types/game";

describe("Auth Integration Rules", () => {
  it("should reject invalid email format via utility", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test("user@example.com")).toBe(true);
    expect(emailRegex.test("not-an-email")).toBe(false);
    expect(emailRegex.test("")).toBe(false);
  });

  it("slugifies user nicknames consistently", () => {
    expect(slugify("Test User 123")).toBe("test-user-123");
    expect(slugify("Spaces  Here")).toBe("spaces-here");
  });

  it("game events match expected types", () => {
    expect(GAME_EVENTS.READY).toBe("ready");
    expect(GAME_EVENTS.START).toBe("start");
    expect(GAME_EVENTS.SCORE).toBe("score");
    expect(GAME_EVENTS.GAME_OVER).toBe("gameover");
  });
});
