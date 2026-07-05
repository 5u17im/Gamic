"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

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

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, nickname, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrarse");
        return;
      }

      // Submit login form programmatically — full page POST
      const loginForm = document.createElement("form");
      loginForm.method = "POST";
      loginForm.action = "/api/auth/callback/credentials";

      const fields = { email, password, callbackUrl: "/" };
      for (const [k, v] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        loginForm.appendChild(input);
      }

      document.body.appendChild(loginForm);
      loginForm.submit();
    } catch {
      setError("Error de conexión");
    }
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
            className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover"
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
