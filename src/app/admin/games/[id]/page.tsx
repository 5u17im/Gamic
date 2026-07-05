"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditGame() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ slug: "", title: "", description: "", categoryId: "", complexity: 1, instructions: "", controls: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories);
    fetch(`/api/admin/games/${id}`)
      .then((r) => r.json())
      .then((g) => {
        setForm({ slug: g.slug, title: g.title, description: g.description ?? "", categoryId: g.categoryId, complexity: g.complexity, instructions: g.instructions ?? "", controls: g.controls ?? "", status: g.status });
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/admin/games/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    router.push("/admin/games");
  };

  if (loading) return <p className="text-sm text-text-secondary">Cargando...</p>;

  return (
    <div>
      <Link href="/admin/games" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a juegos
      </Link>
      <h1 className="mt-4 text-2xl font-bold font-heading">Editar juego</h1>

      <form onSubmit={handleSave} className="mt-6 rounded-xl border border-border bg-surface p-5 space-y-4">
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
          <div>
            <label className="block text-xs font-medium text-text-secondary">Categoría *</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary">Complejidad</label>
            <input type="number" min={1} max={5} value={form.complexity} onChange={(e) => setForm({ ...form, complexity: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
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
            <label className="block text-xs font-medium text-text-secondary">Estado</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <Link href="/admin/games" className="rounded-lg border border-border px-5 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
