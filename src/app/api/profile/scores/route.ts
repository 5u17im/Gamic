import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
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
}
