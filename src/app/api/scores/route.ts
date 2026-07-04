import { auth, checkRateLimit } from "@/lib/auth";
import { db } from "@/lib/db";
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

    if (!gameSlug || typeof score !== "number" || score < 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const game = await db.game.findUnique({ where: { slug: gameSlug } });
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
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    const where = gameSlug
      ? { game: { slug: gameSlug } }
      : {};

    const scores = await db.score.findMany({
      where,
      orderBy: { score: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, image: true, nickname: true } },
        game: { select: { slug: true, title: true } },
      },
    });

    return NextResponse.json(scores);
  } catch (e) {
    console.error("scores GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
