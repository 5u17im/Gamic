export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: Date;
}

export interface ProgressSummary {
  scoreCount: number;
  score: number;
  uniqueGames: number;
  streak: number;
}

export function computeStreakState(previous: StreakState | null | undefined, playedAt: Date): StreakState {
  const now = new Date(playedAt);
  const previousDate = previous?.lastPlayedDate ? new Date(previous.lastPlayedDate) : null;
  const diffDays = previousDate ? Math.floor((now.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)) : 1;

  let currentStreak = 1;
  if (previousDate && diffDays === 1) {
    currentStreak = (previous?.currentStreak ?? 0) + 1;
  } else if (previousDate && diffDays === 0) {
    currentStreak = previous?.currentStreak ?? 1;
  }

  return {
    currentStreak,
    longestStreak: Math.max(previous?.longestStreak ?? 0, currentStreak),
    lastPlayedDate: now,
  };
}

export function getAchievementSlugsForProgress(summary: ProgressSummary): string[] {
  const slugs: string[] = [];
  if (summary.scoreCount >= 1) slugs.push("first-score");
  if (summary.score >= 1000) slugs.push("score-1000");
  if (summary.score >= 5000) slugs.push("score-5000");
  if (summary.uniqueGames >= 3) slugs.push("explorer");
  if (summary.streak >= 3) slugs.push("streak-3");
  return slugs;
}
