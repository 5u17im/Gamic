import Link from "next/link";
import { db } from "@/lib/db";

interface ScoreEntry {
  id: string;
  score: number;
  duration: number | null;
  timestamp: string;
  user: { id: string; name: string | null; image: string | null; nickname: string };
  game: { slug: string; title: string };
}

async function getScores(game?: string): Promise<ScoreEntry[]> {
  try {
    const where = game ? { game: { slug: game } } : {};
    const scores = await db.score.findMany({
      where,
      orderBy: { score: "desc" },
      take: 20,
      include: {
        user: { select: { id: true, name: true, image: true, nickname: true } },
        game: { select: { slug: true, title: true } },
      },
    });
    return scores as unknown as ScoreEntry[];
  } catch {
    return [];
  }
}

async function getRankingGames() {
  return db.game.findMany({
    where: { status: "published" },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });
}

export default async function RankingPage(props: { searchParams: Promise<{ game?: string }> }) {
  const { game } = await props.searchParams;
  const [scores, games] = await Promise.all([
    getScores(game),
    getRankingGames(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary font-heading">Ranking</h1>
        <p className="mt-1 text-text-secondary">Las mejores puntuaciones de la comunidad</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/ranking"
          className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            !game ? "bg-primary text-text-on-primary" : "bg-surface text-text-secondary hover:bg-surface-hover border border-border"
          }`}
        >
          Todos
        </Link>
        {games.map((g) => (
          <Link
            key={g.slug}
            href={`/ranking?game=${g.slug}`}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              game === g.slug ? "bg-primary text-text-on-primary" : "bg-surface text-text-secondary hover:bg-surface-hover border border-border"
            }`}
          >
            {g.title}
          </Link>
        ))}
      </div>

      {scores.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="text-lg font-medium text-text-primary">Sin puntuaciones aún</p>
          <p className="mt-1 text-sm text-text-secondary">
            {game ? "Juega para ser el primero en aparecer aquí" : "Juega cualquier juego para ver el ranking"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/50">
                <th className="px-4 py-3 font-medium text-text-secondary">#</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Jugador</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Juego</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">Puntuación</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right hidden sm:table-cell">Duración</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, i) => (
                <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-surface-hover/30">
                  <td className="px-4 py-3">
                    <span className={`font-mono text-sm ${i < 3 ? "text-score-gold" : "text-text-secondary"}`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-text-primary">{entry.user.nickname || entry.user.name || "Anónimo"}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{entry.game.title}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">{entry.score.toLocaleString("es-CO")}</td>
                  <td className="px-4 py-3 text-right font-mono text-text-secondary hidden sm:table-cell">
                    {entry.duration ? `${Math.floor(entry.duration / 60)}:${(entry.duration % 60).toString().padStart(2, "0")}` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
