import { auth, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const game = await db.game.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (!game) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (e) {
    console.error("admin/games/[id] GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { slug, title, description, categoryId, complexity, instructions, controls, status } = body;

    if (!slug || !title || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const game = await db.game.update({
      where: { id },
      data: { slug, title, description, categoryId, complexity, instructions, controls: controls ?? null, status },
    });

    return NextResponse.json(game);
  } catch (e) {
    console.error("admin/games/[id] PUT error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await db.game.update({ where: { id }, data: { status: "archived" } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin/games/[id] DELETE error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
