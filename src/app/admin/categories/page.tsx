"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface CategoryWithCount {
  id: string; name: string; slug: string; icon: string | null;
  description: string | null; displayOrder: number;
  _count: { games: number };
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", description: "", displayOrder: 0 });

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => { setCategories(data); setLoading(false); });
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: "", slug: "", icon: "", description: "", displayOrder: 0 });
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría? Los juegos asociados quedarán huérfanos.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  if (loading) return <p className="text-sm text-text-secondary">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Categorías</h1>
          <p className="mt-1 text-sm text-text-secondary">{categories.length} categorías</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nueva categoría"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-secondary">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">Slug *</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">Icono (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">Orden</label>
              <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-text-secondary">Descripción</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
          </div>
          <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover">Crear categoría</button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xl">{cat.icon ?? "📁"}</span>
              <div>
                <span className="font-medium">{cat.name}</span>
                <p className="text-xs text-text-secondary">
                  {cat.slug} · {cat._count.games} juegos
                </p>
              </div>
            </div>
            <button onClick={() => handleDelete(cat.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-red-500/10 hover:text-red-400 shrink-0 ml-4">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-center text-sm text-text-secondary">No hay categorías</p>}
      </div>
    </div>
  );
}
