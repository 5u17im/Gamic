"use server";

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return { error: "Credenciales inválidas" };
  }

  redirect("/");
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const nickname = formData.get("nickname") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !nickname || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { nickname }] },
  });

  if (existing) {
    if (existing.email === email) return { error: "El email ya está registrado" };
    return { error: "El nickname ya está en uso" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: { name, email, nickname, password: hashedPassword },
  });

  await signIn("credentials", { email, password, redirect: false });

  redirect("/");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/");
}
