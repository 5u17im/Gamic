import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [gameCount, categoryCount, scoreCount, userCount, topScores] = await Promise.all([
    db.game.count({ where: { status: "published" } }),
    db.category.count(),
    db.score.count(),
    db.user.count(),
    db.score.findMany({
      orderBy: { score: "desc" },
      take: 1,
      select: { score: true },
    }),
  ]);

  const topScore = topScores[0]?.score ?? 0;

  return NextResponse.json({ gameCount, categoryCount, scoreCount, userCount, topScore });
}
