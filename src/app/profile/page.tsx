"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ScoreEntry {
  id: string; score: number; duration: number | null; timestamp: string;
  game: { slug: string; title: string };
}

interface UserStats {
  totalScores: number;
  averageScore: number;
  totalPlayTime: number;
  uniqueGames: number;
  completedSessions: number;
  currentStreak: number;
  longestStreak: number;
  achievements: number;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setNickname((session.user as any).nickname ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

  useEffect(() => {
    fetch("/api/profile/scores")
      .then((r) => r.json())
      .then((data) => { setScores(data); setScoresLoading(false); })
      .catch(() => setScoresLoading(false));

    fetch("/api/profile/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setStatsLoading(false); })
      .catch(() => setStatsLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nickname, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg({ ok: true, text: "Perfil actualizado" });
        update();
      } else {
        setSaveMsg({ ok: false, text: data.error ?? "Error al guardar" });
      }
    } catch {
      setSaveMsg({ ok: false, text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPw(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ ok: true, text: "Contraseña actualizada" });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPwMsg({ ok: false, text: data.error ?? "Error" });
      }
    } catch {
      setPwMsg({ ok: false, text: "Error de conexión" });
    } finally {
      setChangingPw(false);
    }
  };

  if (status === "loading") {
    return <div className="mx-auto max-w-2xl px-4 py-16"><p className="text-text-secondary">Cargando...</p></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 space-y-8">
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading">{session?.user?.name}</h1>
            <p className="text-sm text-text-secondary">@{nickname || (session?.user as any)?.nickname}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Nickname</label>
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-text-secondary">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
          </div>

          {saveMsg && (
            <p className={`text-sm ${saveMsg.ok ? "text-emerald-400" : "text-red-400"}`}>{saveMsg.text}</p>
          )}

          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-bold font-heading">Cambiar contraseña</h2>

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Contraseña actual</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Nueva contraseña</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" required />
            </div>
          </div>

          {pwMsg && (
            <p className={`text-sm ${pwMsg.ok ? "text-emerald-400" : "text-red-400"}`}>{pwMsg.text}</p>
          )}

          <button type="submit" disabled={changingPw} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50">
            {changingPw ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-bold font-heading">Sesión</h2>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">Estado</span>
            <span className="text-sm font-medium text-emerald-400">Activa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">Método</span>
            <span className="text-sm text-text-primary">JWT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">Email</span>
            <span className="text-sm text-text-primary">{session?.user?.email}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            Cerrar sesión
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-bold font-heading">Estadísticas</h2>
        {statsLoading ? (
          <p className="mt-4 text-sm text-text-secondary">Cargando...</p>
        ) : stats ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-bg/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.totalScores}</p>
              <p className="text-xs text-text-secondary">Partidas</p>
            </div>
            <div className="rounded-lg bg-bg/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.uniqueGames}</p>
              <p className="text-xs text-text-secondary">Juegos distintos</p>
            </div>
            <div className="rounded-lg bg-bg/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.averageScore.toLocaleString("es-CO")}</p>
              <p className="text-xs text-text-secondary">Puntaje promedio</p>
            </div>
            <div className="rounded-lg bg-bg/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{Math.floor(stats.totalPlayTime / 60)} min</p>
              <p className="text-xs text-text-secondary">Tiempo total</p>
            </div>
            <div className="rounded-lg bg-bg/50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.currentStreak}</p>
              <p className="text-xs text-text-secondary">Racha actual</p>
            </div>
            <div className="rounded-lg bg-bg/50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.longestStreak}</p>
              <p className="text-xs text-text-secondary">Mejor racha</p>
            </div>
            <div className="rounded-lg bg-bg/50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.achievements}</p>
              <p className="text-xs text-text-secondary">Logros</p>
            </div>
            <div className="rounded-lg bg-bg/50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.completedSessions}</p>
              <p className="text-xs text-text-secondary">Completadas</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-bold font-heading">Mis puntuaciones</h2>

        {scoresLoading ? (
          <p className="mt-4 text-sm text-text-secondary">Cargando...</p>
        ) : scores.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">Aún no has jugado. <Link href="/categories" className="text-primary hover:underline">Explorar juegos</Link></p>
        ) : (
          <div className="mt-4 space-y-2">
            {scores.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-bg/50 px-4 py-3">
                <div>
                  <Link href={`/play/${s.game.slug}`} className="text-sm font-medium hover:text-primary transition-colors">{s.game.title}</Link>
                  <p className="text-xs text-text-secondary">{new Date(s.timestamp).toLocaleDateString("es-CO")}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-primary">{s.score.toLocaleString("es-CO")}</span>
                  {s.duration && <p className="text-xs text-text-secondary">{s.duration}s</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
