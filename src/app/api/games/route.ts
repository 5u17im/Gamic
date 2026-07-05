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

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const [games, total] = await Promise.all([
      db.game.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      db.game.count({ where }),
    ]);

    const res = NextResponse.json({ games, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
    res.headers.set("X-Cache-TTL", "60");
    return res;
  } catch (e) {
    console.error("games GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
