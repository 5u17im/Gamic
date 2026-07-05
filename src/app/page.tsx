import Link from "next/link";
import { GameCard } from "@/components/games/GameCard";
import { getPublishedGames, getCategories } from "@/lib/data";

export default async function HomePage() {
  const [games, categories] = await Promise.all([
    getPublishedGames(),
    getCategories(),
  ]);

  const totalGames = games.length;

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
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories?cat=${cat.slug}`}
              className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <span className="text-2xl">{cat.icon ?? "🎮"}</span>
              <span className="text-xs font-medium text-text-primary">{cat.name}</span>
              <span className="text-xs text-text-secondary">{cat._count.games} juegos</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="destacados" className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Juegos
          </h2>
          <Link
            href="/categories"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Ver todos &rarr;
          </Link>
        </div>
        {games.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <p className="text-text-secondary">No hay juegos disponibles a&uacute;n.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {games.map((game) => (
              <GameCard
                key={game.slug}
                slug={game.slug}
                title={game.title}
                category={game.category.name}
                categorySlug={game.category.slug}
                description={game.description ?? ""}
                complexity={game.complexity}
                thumbnail={null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
