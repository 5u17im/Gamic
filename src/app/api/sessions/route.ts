import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    const sessions = await db.gameSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: "desc" },
      take: limit,
      include: {
        game: { select: { slug: true, title: true, thumbnail: true } },
      },
    });

    return NextResponse.json(sessions);
  } catch (e) {
    console.error("sessions GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameSlug } = await req.json();

    if (!gameSlug) {
      return NextResponse.json({ error: "gameSlug is required" }, { status: 400 });
    }

    const game = await db.game.findUnique({ where: { slug: gameSlug } });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const gameSession = await db.gameSession.create({
      data: {
        userId: session.user.id,
        gameId: game.id,
        startTime: new Date(),
      },
    });

    return NextResponse.json(gameSession, { status: 201 });
  } catch (e) {
    console.error("sessions POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
