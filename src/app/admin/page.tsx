"use client";

import { useEffect, useState } from "react";
import { Gamepad2, Tags, Trophy, Users } from "lucide-react";
import Link from "next/link";

interface Stats {
  gameCount: number;
  categoryCount: number;
  scoreCount: number;
  userCount: number;
  topScore: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Juegos", value: stats?.gameCount ?? 0, icon: Gamepad2, href: "/admin/games", color: "text-blue-400" },
    { label: "Categorías", value: stats?.categoryCount ?? 0, icon: Tags, href: "/admin/categories", color: "text-emerald-400" },
    { label: "Puntuaciones", value: stats?.scoreCount ?? 0, icon: Trophy, href: "/admin/scores", color: "text-amber-400" },
    { label: "Usuarios", value: stats?.userCount ?? 0, icon: Users, href: "/admin", color: "text-violet-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
      <p className="mt-1 text-sm text-text-secondary">Resumen de la plataforma</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
          >
            <div className="flex items-center justify-between">
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="mt-3 text-2xl font-bold">
              {loading ? (
                <span className="inline-block h-6 w-12 animate-pulse rounded bg-surface-hover" />
              ) : (
                card.value.toLocaleString("es-CO")
              )}
            </p>
            <p className="mt-1 text-sm text-text-secondary">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-text-secondary">Mejor puntuación global</h2>
        <p className="mt-1 text-3xl font-bold text-primary">
          {loading ? (
            <span className="inline-block h-8 w-24 animate-pulse rounded bg-surface-hover" />
          ) : (
            stats?.topScore.toLocaleString("es-CO") ?? "—"
          )}
        </p>
      </div>
    </div>
  );
}
