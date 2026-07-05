import { describe, expect, it } from "vitest";
import { computeStreakState, getAchievementSlugsForProgress } from "@/lib/progression";

describe("progression helpers", () => {
  it("resets or advances the streak based on the time gap", () => {
    const initial = { currentStreak: 2, longestStreak: 3, lastPlayedDate: new Date("2026-07-03T10:00:00.000Z") };
    const next = computeStreakState(initial, new Date("2026-07-04T10:00:00.000Z"));

    expect(next.currentStreak).toBe(3);
    expect(next.longestStreak).toBe(3);

    const reset = computeStreakState(initial, new Date("2026-07-06T10:00:00.000Z"));
    expect(reset.currentStreak).toBe(1);
  });

  it("returns the right achievements for a new score", () => {
    const slugs = getAchievementSlugsForProgress({
      scoreCount: 1,
      score: 1500,
      uniqueGames: 1,
      streak: 1,
    });

    expect(slugs).toEqual(expect.arrayContaining(["first-score", "score-1000"]));
    expect(slugs).not.toContain("score-5000");
  });
});
