import Link from "next/link";
import { GamePlayer } from "@/components/games/GamePlayer";

const GAMES_MAP: Record<string, { title: string; description: string; category: string }> = {
  "hex-merge": { title: "Hex Merge", description: "Fusiona fichas hexagonales del mismo color en un tablero panal.", category: "Puzzle" },
  "asteroid-sweep": { title: "Asteroid Sweep", description: "Nave que orbita un planeta mientras esquiva asteroides.", category: "Arcade" },
  "pivot": { title: "Pivot", description: "Gira la plataforma para que la bola no caiga.", category: "Habilidad" },
  "quick-math": { title: "Quick Math", description: "Operaciones aritméticas contrarreloj.", category: "Educativos" },
  "flip-tactics": { title: "Flip Tactics", description: "Memoria con habilidades especiales.", category: "Cartas" },
};

export default async function PlayPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const game = GAMES_MAP[slug];

  if (!game) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Juego no encontrado</h1>
        <p className="mt-2 text-text-secondary">El juego que buscas no existe.</p>
        <Link href="/categories" className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-text-on-primary">Explorar juegos</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/categories" className="text-sm text-text-secondary hover:text-text-primary transition-colors">&larr; Volver</Link>
        <span className="text-text-secondary">/</span>
        <span className="text-sm text-text-secondary">{game.category}</span>
        <span className="text-text-secondary">/</span>
        <h1 className="text-lg font-semibold text-text-primary">{game.title}</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="aspect-video w-full bg-black">
          <GamePlayer slug={slug} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-text-primary">{game.title}</h2>
        <p className="mt-1 text-text-secondary">{game.description}</p>
      </div>
    </div>
  );
}
