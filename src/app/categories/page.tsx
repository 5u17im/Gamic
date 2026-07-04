import { GameCard } from "@/components/games/GameCard";

const GAMES = [
  { slug: "hex-merge", title: "Hex Merge", category: "Puzzle", categorySlug: "puzzle", description: "Fusiona fichas hexagonales del mismo color en un tablero panal.", complexity: 1, thumbnail: null },
  { slug: "asteroid-sweep", title: "Asteroid Sweep", category: "Arcade", categorySlug: "arcade", description: "Nave que orbita un planeta mientras esquiva y destruye asteroides.", complexity: 2, thumbnail: null },
  { slug: "pivot", title: "Pivot", category: "Habilidad", categorySlug: "habilidad", description: "Gira la plataforma en el momento exacto para que la bola no caiga.", complexity: 1, thumbnail: null },
  { slug: "quick-math", title: "Quick Math", category: "Educativos", categorySlug: "educativos", description: "Operaciones aritméticas contrarreloj.", complexity: 1, thumbnail: null },
  { slug: "flip-tactics", title: "Flip Tactics", category: "Cartas", categorySlug: "cartas", description: "Memoria con habilidades especiales.", complexity: 2, thumbnail: null },
];

const CATEGORIES = ["Todos", "Arcade", "Puzzle", "Estrategia", "Habilidad", "Aventura", "Deportes", "Cartas", "Educativos"];

export default async function CategoriesPage(props: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const { cat, q } = await props.searchParams;

  let filtered = GAMES;

  if (cat && cat !== "Todos") {
    filtered = filtered.filter((g) => g.categorySlug === cat.toLowerCase());
  }

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter((g) => g.title.toLowerCase().includes(query) || g.description.toLowerCase().includes(query));
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
        {CATEGORIES.map((catName) => {
          const isActive = (!cat && catName === "Todos") || cat === catName.toLowerCase();
          return (
            <a
              key={catName}
              href={catName === "Todos" ? "/categories" : `/categories?cat=${catName.toLowerCase()}`}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-text-on-primary" : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border"
              }`}
            >
              {catName}
            </a>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="text-text-secondary">No se encontraron juegos con esos criterios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((game) => (
            <GameCard key={game.slug} {...game} />
          ))}
        </div>
      )}
    </div>
  );
}
