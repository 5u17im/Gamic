import { auth, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const games = await db.game.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json(games);
  } catch (e) {
    console.error("admin/games GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { slug, title, description, categoryId, complexity, instructions, controls, status } = body;

    if (!slug || !title || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const game = await db.game.create({
      data: {
        slug,
        title,
        description,
        categoryId,
        complexity: complexity ?? 1,
        instructions,
        controls: controls ?? null,
        status: status ?? "draft",
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (e) {
    console.error("admin/games POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
