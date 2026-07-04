export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatScore(score: number): string {
  return score.toLocaleString("es-CO");
}

export function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function getComplexityLabel(level: number): string {
  const labels = ["", "Fácil", "Media", "Difícil", "Experto", "Maestro"];
  return labels[level] ?? "Desconocida";
}

export function getComplexityColor(level: number): string {
  const colors = ["", "text-accent", "text-secondary", "text-danger", "text-danger", "text-danger"];
  return colors[level] ?? "text-text-secondary";
}
