import { NextRequest, NextResponse } from "next/server";

const GAMES = [
  { slug: "hex-merge", title: "Hex Merge", category: "Puzzle", categorySlug: "puzzle", description: "Fusiona fichas hexagonales del mismo color en un tablero panal.", complexity: 1 },
  { slug: "asteroid-sweep", title: "Asteroid Sweep", category: "Arcade", categorySlug: "arcade", description: "Nave que orbita un planeta mientras esquiva y destruye asteroides.", complexity: 2 },
  { slug: "pivot", title: "Pivot", category: "Habilidad", categorySlug: "habilidad", description: "Gira la plataforma en el momento exacto para que la bola no caiga.", complexity: 1 },
  { slug: "quick-math", title: "Quick Math", category: "Educativos", categorySlug: "educativos", description: "Operaciones aritméticas contrarreloj.", complexity: 1 },
  { slug: "flip-tactics", title: "Flip Tactics", category: "Cartas", categorySlug: "cartas", description: "Memoria con habilidades especiales.", complexity: 2 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const results = GAMES.filter(
    (g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
  );

  return NextResponse.json(results);
}
