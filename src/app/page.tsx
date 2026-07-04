import Link from "next/link";
import { GameCard } from "@/components/games/GameCard";

const FEATURED_GAMES = [
  {
    slug: "hex-merge",
    title: "Hex Merge",
    category: "Puzzle",
    categorySlug: "puzzle",
    description: "Fusiona fichas hexagonales del mismo color en un tablero panal.",
    complexity: 1,
    thumbnail: null,
  },
  {
    slug: "asteroid-sweep",
    title: "Asteroid Sweep",
    category: "Arcade",
    categorySlug: "arcade",
    description: "Nave que orbita un planeta mientras esquiva y destruye asteroides.",
    complexity: 2,
    thumbnail: null,
  },
  {
    slug: "pivot",
    title: "Pivot",
    category: "Habilidad",
    categorySlug: "habilidad",
    description: "Gira la plataforma en el momento exacto para que la bola no caiga.",
    complexity: 1,
    thumbnail: null,
  },
  {
    slug: "quick-math",
    title: "Quick Math",
    category: "Educativos",
    categorySlug: "educativos",
    description: "Operaciones aritméticas contrarreloj. Cada acierto suma tiempo.",
    complexity: 1,
    thumbnail: null,
  },
  {
    slug: "flip-tactics",
    title: "Flip Tactics",
    category: "Cartas",
    categorySlug: "cartas",
    description: "Memoria con habilidades especiales. Voltea pares y activa poderes.",
    complexity: 2,
    thumbnail: null,
  },
];

const CATEGORIES = [
  { name: "Arcade", slug: "arcade", icon: "🎯", count: 1 },
  { name: "Puzzle", slug: "puzzle", icon: "🧩", count: 1 },
  { name: "Estrategia", slug: "estrategia", icon: "🧠", count: 0 },
  { name: "Habilidad", slug: "habilidad", icon: "🎮", count: 1 },
  { name: "Aventura", slug: "aventura", icon: "🗺️", count: 0 },
  { name: "Deportes", slug: "deportes", icon: "⚽", count: 0 },
  { name: "Cartas", slug: "cartas", icon: "🃏", count: 1 },
  { name: "Educativos", slug: "educativos", icon: "📐", count: 1 },
  { name: "Todos", slug: "", icon: "🎮", count: 5 },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-10 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-8 sm:p-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl font-heading">
            Juegos originales, diversi&oacute;n sin l&iacute;mites
          </h1>
          <p className="mt-3 text-lg text-text-secondary">
            Descubre nuestra colecci&oacute;n de minijuegos. Todos creados por nosotros,
            para ti. Gratis, r&aacute;pidos y sin descargas.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/categories"
              className="inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover"
            >
              Explorar juegos
            </Link>
            <Link
              href="#destacados"
              className="inline-flex h-12 items-center rounded-lg border border-border bg-surface px-6 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
            >
              Ver destacados
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Categor&iacute;as
          </h2>
          <Link
            href="/categories"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Ver todas &rarr;
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories?cat=${cat.slug}`}
              className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-medium text-text-primary">{cat.name}</span>
              <span className="text-xs text-text-secondary">{cat.count} juegos</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="destacados" className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Pr&oacute;ximamente
          </h2>
          <Link
            href="/categories"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Ver todos &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {FEATURED_GAMES.map((game) => (
            <GameCard
              key={game.slug}
              slug={game.slug}
              title={game.title}
              category={game.category}
              categorySlug={game.categorySlug}
              description={game.description}
              complexity={game.complexity}
              thumbnail={game.thumbnail}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
