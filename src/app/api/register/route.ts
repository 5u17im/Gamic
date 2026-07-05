import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logEvent } from "@/lib/observability";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, nickname, password } = await req.json();

    if (!name || !email || !nickname || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { nickname }] },
    });

    if (existing) {
      if (existing.email === email) {
        return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
      }
      return NextResponse.json({ error: "El nickname ya está en uso" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: { name, email, nickname, password: hashedPassword },
    });

    logEvent("login", { email });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("register POST error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
