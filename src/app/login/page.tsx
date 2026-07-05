"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { useSession } from "next-auth/react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const router = useRouter();
  const { update } = useSession();

  useEffect(() => {
    if (state?.success) {
      update().then(() => router.push("/"));
    }
  }, [state, update, router]);

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

        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
              {state.error}
            </div>
          )}

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
            disabled={pending}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
