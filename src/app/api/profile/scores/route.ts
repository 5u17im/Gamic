import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scores = await db.score.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: "desc" },
      take: 50,
      include: {
        game: { select: { slug: true, title: true } },
      },
    });

    return NextResponse.json(scores);
  } catch (e) {
    console.error("profile/scores GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
