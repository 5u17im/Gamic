import { auth, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await db.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { games: true } } },
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error("admin/categories GET error:", e);
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
    const { name, slug, icon, description, displayOrder } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await db.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Name or slug already exists" }, { status: 409 });
    }

    const category = await db.category.create({
      data: { name, slug, icon, description, displayOrder: displayOrder ?? 0 },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    console.error("admin/categories POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
