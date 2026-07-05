import { auth, checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeStreakState, getAchievementSlugsForProgress } from "@/lib/progression";
import { logEvent } from "@/lib/observability";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!checkRateLimit(`score:${session.user.id}`, 5, 60000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const { gameSlug, score, duration } = await req.json();

    if (typeof gameSlug !== "string" || !gameSlug.trim()) {
      return NextResponse.json({ error: "Invalid gameSlug" }, { status: 400 });
    }

    if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 1000000) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    if (duration !== undefined && (typeof duration !== "number" || !Number.isFinite(duration) || duration < 0 || duration > 86400)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const game = await db.game.findUnique({ where: { slug: gameSlug.trim() } });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const result = await db.score.create({
      data: {
        userId: session.user.id,
        gameId: game.id,
        score,
        duration: duration ?? null,
      },
    });

    await db.game.update({
      where: { id: game.id },
      data: { playCount: { increment: 1 } },
    });

    const streakRecord = await db.dailyStreak.findUnique({ where: { userId: session.user.id } });
    const nextStreak = computeStreakState(streakRecord, new Date());

    await db.dailyStreak.upsert({
      where: { userId: session.user.id },
      update: {
        currentStreak: nextStreak.currentStreak,
        longestStreak: nextStreak.longestStreak,
        lastPlayedDate: nextStreak.lastPlayedDate,
      },
      create: {
        userId: session.user.id,
        currentStreak: nextStreak.currentStreak,
        longestStreak: nextStreak.longestStreak,
        lastPlayedDate: nextStreak.lastPlayedDate,
      },
    });

    const userAchievements = await db.userAchievement.findMany({ where: { userId: session.user.id } });
    const unlockedSlugs = getAchievementSlugsForProgress({
      scoreCount: await db.score.count({ where: { userId: session.user.id } }),
      score,
      uniqueGames: await db.gameSession.findMany({ where: { userId: session.user.id }, select: { gameId: true } }).then((sessions) => new Set(sessions.map((s) => s.gameId)).size),
      streak: nextStreak.currentStreak,
    });

    for (const slug of unlockedSlugs) {
      const achievement = await db.achievement.findUnique({ where: { slug } });
      if (!achievement) continue;
      const alreadyUnlocked = userAchievements.some((entry) => entry.achievementId === achievement.id);
      if (!alreadyUnlocked) {
        await db.userAchievement.create({ data: { userId: session.user.id, achievementId: achievement.id } });
      }
    }

    await db.gameSession.create({
      data: {
        userId: session.user.id,
        gameId: game.id,
        startTime: new Date(Date.now() - (duration ?? 0) * 1000),
        endTime: new Date(),
        score,
        completed: true,
      },
    });

    logEvent("score_submitted", { gameSlug: game.slug, userId: session.user.id, score });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error("scores POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameSlug = searchParams.get("game");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(Number(searchParams.get("limit")) || 10, 50);

    const where = gameSlug
      ? { game: { slug: gameSlug } }
      : {};

    const [scores, total] = await Promise.all([
      db.score.findMany({
        where,
        orderBy: { score: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, image: true, nickname: true } },
          game: { select: { slug: true, title: true } },
        },
      }),
      db.score.count({ where }),
    ]);

    return NextResponse.json({ scores, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (e) {
    console.error("scores GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
