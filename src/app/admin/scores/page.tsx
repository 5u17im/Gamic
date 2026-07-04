"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ScoreEntry {
  id: string; score: number; duration: number | null; timestamp: string;
  user: { id: string; name: string | null; nickname: string };
  game: { slug: string; title: string };
}

export default function AdminScores() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchScores = () => {
    const url = filter ? `/api/scores?game=${filter}&limit=100` : "/api/scores?limit=100";
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setScores(data); setLoading(false); });
  };

  useEffect(() => { fetchScores(); }, [filter]);

  if (loading) return <p className="text-sm text-text-secondary">Cargando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading">Puntuaciones</h1>
      <p className="mt-1 text-sm text-text-secondary">{scores.length} registros</p>

      <div className="mt-4">
        <input
          placeholder="Filtrar por slug de juego..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-text-secondary">
              <th className="pb-3 pr-4">Jugador</th>
              <th className="pb-3 pr-4">Juego</th>
              <th className="pb-3 pr-4 text-right">Puntos</th>
              <th className="pb-3 pr-4 text-right">Duración</th>
              <th className="pb-3 text-right">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.id} className="border-b border-border/50">
                <td className="py-3 pr-4">
                  <span className="font-medium">{s.user.name ?? s.user.nickname}</span>
                </td>
                <td className="py-3 pr-4 text-text-secondary">
                  <Link href={`/play/${s.game.slug}`} className="hover:text-primary transition-colors">{s.game.title}</Link>
                </td>
                <td className="py-3 pr-4 text-right font-mono font-medium">{s.score.toLocaleString("es-CO")}</td>
                <td className="py-3 pr-4 text-right text-text-secondary">
                  {s.duration ? `${s.duration}s` : "—"}
                </td>
                <td className="py-3 text-right text-text-secondary">
                  {new Date(s.timestamp).toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {scores.length === 0 && <p className="mt-6 text-center text-sm text-text-secondary">No hay puntuaciones</p>}
      </div>
    </div>
  );
}
