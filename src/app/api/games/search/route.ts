import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() ?? "";

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const results = await db.game.findMany({
      where: {
        status: "published",
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      },
      select: {
        slug: true,
        title: true,
        description: true,
        category: { select: { name: true, slug: true } },
        complexity: true,
      },
    });

    return NextResponse.json(results);
  } catch (e) {
    console.error("games/search GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
