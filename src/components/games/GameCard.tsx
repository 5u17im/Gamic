import Link from "next/link";

interface GameCardProps {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  description: string;
  complexity: number;
  thumbnail: string | null;
}

export function GameCard({
  slug,
  title,
  category,
  description,
  complexity,
}: GameCardProps) {
  const complexityLabel = ["", "Fácil", "Media", "Difícil"][complexity] ?? "Desconocida";

  return (
    <Link
      href={`/play/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface/90 text-2xl opacity-80 transition-all group-hover:scale-110 group-hover:opacity-100 shadow-md">
          ▶
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {category}
          </span>
          <span className="text-xs text-text-secondary">{complexityLabel}</span>
        </div>
        <h3 className="mt-2 font-semibold text-text-primary group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-text-secondary line-clamp-2">{description}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-text-secondary">
          <span>▶ Jugar ahora</span>
        </div>
      </div>
    </Link>
  );
}
