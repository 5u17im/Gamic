import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, nickname, email } = await req.json();

    if (!name || !nickname) {
      return NextResponse.json({ error: "Name and nickname are required" }, { status: 400 });
    }

    const existing = await db.user.findFirst({
      where: {
        OR: [{ nickname }, email ? { email } : {}].filter(Boolean) as any,
        NOT: { id: session.user.id },
      },
    });

    if (existing) {
      if (existing.nickname === nickname) return NextResponse.json({ error: "Nickname ya en uso" }, { status: 409 });
      if (existing.email === email) return NextResponse.json({ error: "Email ya registrado" }, { status: 409 });
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name, nickname, ...(email ? { email } : {}) },
      select: { id: true, name: true, nickname: true, email: true },
    });

    return NextResponse.json(user);
  } catch (e) {
    console.error("profile PUT error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
