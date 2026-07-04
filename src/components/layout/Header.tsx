"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Search, LogOut, User as UserIcon } from "lucide-react";

const categories = [
  { name: "Arcade", slug: "arcade" },
  { name: "Puzzle", slug: "puzzle" },
  { name: "Estrategia", slug: "estrategia" },
  { name: "Habilidad", slug: "habilidad" },
  { name: "Aventura", slug: "aventura" },
  { name: "Deportes", slug: "deportes" },
  { name: "Cartas", slug: "cartas" },
  { name: "Educativos", slug: "educativos" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: session } = useSession();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-text-on-primary">
            G
          </span>
          <span className="hidden sm:inline font-heading">Gamic</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories?cat=${cat.slug}`}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(`/categories?cat=${cat.slug}`)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/categories"
            className="rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
          >
            Ver más
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
            aria-label="Buscar juegos"
          >
            <Search className="h-5 w-5" />
          </button>

          {session?.user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {session.user.name?.[0]?.toUpperCase() ?? <UserIcon className="h-4 w-4" />}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover"
            >
              Iniciar sesión
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover md:hidden transition-colors"
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Buscar juegos..."
                className="w-full rounded-lg border border-border bg-bg py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-border-focus focus:outline-none focus:ring-3 focus:ring-primary/20 transition-colors"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            <Link
              href="/ranking"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
            >
              Ranking
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories?cat=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive(`/categories?cat=${cat.slug}`)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text-secondary hover:bg-surface-hover"
                }`}
              >
                {cat.name}
              </Link>
            ))}
            {session?.user ? (
              <button
                onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-text-on-primary"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-text-on-primary"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
