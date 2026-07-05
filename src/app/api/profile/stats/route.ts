import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [scoreAgg, gameSessions, streak, achievementCount] = await Promise.all([
      db.score.aggregate({
        where: { userId },
        _count: true,
        _avg: { score: true },
        _sum: { duration: true },
      }),
      db.gameSession.findMany({
        where: { userId },
        select: { id: true, gameId: true, completed: true },
      }),
      db.dailyStreak.findUnique({
        where: { userId },
        select: { currentStreak: true, longestStreak: true },
      }),
      db.userAchievement.count({ where: { userId } }),
    ]);

    const uniqueGames = new Set(gameSessions.map((s) => s.gameId)).size;
    const completedSessions = gameSessions.filter((s) => s.completed).length;

    return NextResponse.json({
      totalScores: scoreAgg._count,
      averageScore: Math.round(scoreAgg._avg.score ?? 0),
      totalPlayTime: scoreAgg._sum.duration ?? 0,
      uniqueGames,
      completedSessions,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      achievements: achievementCount,
    });
  } catch (e) {
    console.error("profile/stats GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
