"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const nickname = form.get("nickname") as string;
    const password = form.get("password") as string;

    if (!name || !email || !nickname || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    startTransition(async () => {
      const result = await registerAction(undefined, form);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.replace("/");
    });
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm items-center px-4 py-16">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary font-heading">
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            &iquest;Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
              Inicia sesi&oacute;n
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text-primary">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-border-focus focus:outline-none focus:ring-3 focus:ring-primary/20 transition-colors"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-border-focus focus:outline-none focus:ring-3 focus:ring-primary/20 transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="nickname" className="mb-1.5 block text-sm font-medium text-text-primary">
              Nickname
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-border-focus focus:outline-none focus:ring-3 focus:ring-primary/20 transition-colors"
              placeholder="Tu nombre de usuario"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-primary">
              Contrase&ntilde;a
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-border-focus focus:outline-none focus:ring-3 focus:ring-primary/20 transition-colors"
              placeholder="M&iacute;nimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
