import { auth, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  } catch (e) {
    console.error("admin/stats GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
