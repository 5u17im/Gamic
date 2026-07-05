import { GameCard } from "@/components/games/GameCard";
import { getPublishedGames, getCategories } from "@/lib/data";

export default async function CategoriesPage(props: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const [games, categories] = await Promise.all([
    getPublishedGames(),
    getCategories(),
  ]);

  const { cat, q } = await props.searchParams;

  let filtered = games;

  if (cat && cat !== "Todos") {
    filtered = filtered.filter((g) => g.category.slug === cat.toLowerCase());
  }

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (g) => g.title.toLowerCase().includes(query) || (g.description ?? "").toLowerCase().includes(query)
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary font-heading">Explorar juegos</h1>
        <p className="mt-1 text-text-secondary">
          {filtered.length} juego{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <a
          href="/categories"
          className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            !cat ? "bg-primary text-text-on-primary" : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border"
          }`}
        >
          Todos
        </a>
        {categories.map((catItem) => (
          <a
            key={catItem.slug}
            href={`/categories?cat=${catItem.slug}`}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              cat === catItem.slug ? "bg-primary text-text-on-primary" : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border"
            }`}
          >
            {catItem.icon ?? "🎮"} {catItem.name}
          </a>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="text-text-secondary">No se encontraron juegos con esos criterios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((game) => (
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
    </div>
  );
}
