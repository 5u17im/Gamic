"use client";

import { useCallback, useState } from "react";
import { useGame } from "@/hooks/useGame";

export function GamePlayer({ slug }: { slug: string }) {
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleScore = useCallback((score: number) => {
    setLastScore(score);
  }, []);

  const handleGameOver = useCallback(async (score: number) => {
    setLastScore(score);
    setSubmitted(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug: slug, score }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // Silent fail — score is saved locally regardless
    } finally {
      setSubmitting(false);
    }
  }, [slug]);

  const { iframeRef, isLoaded, isLoading, error, start, pause, resume, restart } = useGame({
    slug,
    onScore: handleScore,
    onGameOver: handleGameOver,
  });

  const gameUrl = `/games/${slug}/index.html`;

  if (!gameUrl) {
    return (
      <div className="flex h-full items-center justify-center text-text-secondary">
        Juego no disponible
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <span className="text-sm text-text-secondary">Cargando juego...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={restart} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm text-text-on-primary">
              Reintentar
            </button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={gameUrl}
        className="h-full w-full"
        sandbox="allow-scripts allow-same-origin"
        title="Game"
      />

      {lastScore !== null && (
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-surface/90 px-3 py-1.5 text-sm text-text-primary shadow-md backdrop-blur-sm">
          <span className="font-mono font-bold">{lastScore.toLocaleString("es-CO")}</span>
          <span className="text-text-secondary">pts</span>
          {submitting && <span className="text-xs text-text-secondary">guardando...</span>}
          {submitted && <span className="text-xs text-accent">✓ guardado</span>}
        </div>
      )}

      {isLoaded && (
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <button onClick={start} className="rounded-lg bg-primary/90 px-3 py-1.5 text-xs text-text-on-primary hover:bg-primary">Iniciar</button>
          <button onClick={pause} className="rounded-lg bg-surface/90 px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover">Pausa</button>
          <button onClick={resume} className="rounded-lg bg-surface/90 px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover">Reanudar</button>
          <button onClick={restart} className="rounded-lg bg-surface/90 px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover">Reiniciar</button>
        </div>
      )}
    </div>
  );
}
