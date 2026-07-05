"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm items-center px-4 py-16">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text-primary font-heading">
            Iniciar sesi&oacute;n
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            &iquest;No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
              Reg&iacute;strate
            </Link>
          </p>
        </div>

        <form action="/api/auth/callback/credentials" method="POST" className="space-y-4">
          <input type="hidden" name="callbackUrl" value="/" />

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
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-primary">
              Contrase&ntilde;a
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-border-focus focus:outline-none focus:ring-3 focus:ring-primary/20 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
