"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface GameWithCategory {
  id: string; slug: string; title: string; description: string | null;
  category: { id: string; name: string; slug: string };
  complexity: number; status: string; playCount: number; createdAt: string;
}

export default function AdminGames() {
  const [games, setGames] = useState<GameWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ slug: "", title: "", description: "", categoryId: "", complexity: 1, instructions: "", controls: "", status: "draft" });

  const fetchGames = () => {
    fetch("/api/admin/games")
      .then((r) => r.json())
      .then((data) => { setGames(data); setLoading(false); });
  };

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data));
  };

  useEffect(() => { fetchGames(); fetchCategories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ slug: "", title: "", description: "", categoryId: "", complexity: 1, instructions: "", controls: "", status: "draft" });
    fetchGames();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este juego?")) return;
    await fetch(`/api/admin/games/${id}`, { method: "DELETE" });
    fetchGames();
  };

  if (loading) return <p className="text-sm text-text-secondary">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Juegos</h1>
          <p className="mt-1 text-sm text-text-secondary">{games.length} juegos registrados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nuevo juego"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-secondary">Slug *</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">Título *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-text-secondary">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-text-secondary">Controles</label>
              <input value={form.controls} onChange={(e) => setForm({ ...form, controls: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" placeholder="⬆️⬇️⬅️➡️: mover | ␣: acción" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-text-secondary">Instrucciones</label>
              <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">Categoría *</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required>
                <option value="">Seleccionar...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">Complejidad (1-5)</label>
              <input type="number" min={1} max={5} value={form.complexity} onChange={(e) => setForm({ ...form, complexity: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover">Crear juego</button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {games.map((game) => (
          <div key={game.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{game.title}</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{game.category.name}</span>
                <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${game.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{game.status}</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary truncate">
                {game.slug} · {game.playCount} jugadas
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Link href={`/admin/games/${game.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary">
                <Pencil className="h-4 w-4" />
              </Link>
              <button onClick={() => handleDelete(game.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-red-500/10 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {games.length === 0 && <p className="text-center text-sm text-text-secondary">No hay juegos registrados</p>}
      </div>
    </div>
  );
}
