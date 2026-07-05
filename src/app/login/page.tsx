"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex min-h-[60vh] max-w-sm items-center px-4 py-16">
        <p className="text-text-secondary">Cargando...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
