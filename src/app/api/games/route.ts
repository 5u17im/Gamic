import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() ?? "";
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { status: "published" };

    if (q && q.length >= 2) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    const games = await db.game.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json(games);
  } catch (e) {
    console.error("games GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
