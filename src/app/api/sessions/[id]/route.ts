import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const { score, completed } = await req.json();

    const gameSession = await db.gameSession.findUnique({ where: { id } });
    if (!gameSession || gameSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.gameSession.update({
      where: { id },
      data: {
        endTime: new Date(),
        ...(score !== undefined ? { score } : {}),
        ...(completed !== undefined ? { completed } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("sessions PUT error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
