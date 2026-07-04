import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const games = await db.game.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  return NextResponse.json(games);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { slug, title, description, categoryId, complexity, instructions, status } = body;

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
      status: status ?? "draft",
    },
  });

  return NextResponse.json(game, { status: 201 });
}
