import { PrismaClient } from "@/generated/prisma/index.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({ url: process.env.DATABASE_URL || "file:./dev.db" });
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter });

const GAMES = [
  { slug: "hex-merge", title: "Hex Merge", category: "puzzle", description: "Fusiona fichas hexagonales del mismo color en un tablero panal.", complexity: 1 },
  { slug: "asteroid-sweep", title: "Asteroid Sweep", category: "arcade", description: "Nave que esquiva y destruye asteroides.", complexity: 2 },
  { slug: "pivot", title: "Pivot", category: "habilidad", description: "Gira la plataforma para que la bola no caiga.", complexity: 1 },
  { slug: "quick-math", title: "Quick Math", category: "educativos", description: "Operaciones aritméticas contra reloj.", complexity: 1 },
  { slug: "flip-tactics", title: "Flip Tactics", category: "cartas", description: "Memoria con habilidades especiales.", complexity: 2 },
];

const CATEGORIES = [
  { name: "Arcade", slug: "arcade", icon: "🎯", displayOrder: 1 },
  { name: "Puzzle", slug: "puzzle", icon: "🧩", displayOrder: 2 },
  { name: "Estrategia", slug: "estrategia", icon: "🧠", displayOrder: 3 },
  { name: "Habilidad", slug: "habilidad", icon: "🎮", displayOrder: 4 },
  { name: "Aventura", slug: "aventura", icon: "🗺️", displayOrder: 5 },
  { name: "Deportes", slug: "deportes", icon: "⚽", displayOrder: 6 },
  { name: "Cartas", slug: "cartas", icon: "🃏", displayOrder: 7 },
  { name: "Educativos", slug: "educativos", icon: "📐", displayOrder: 8 },
];

async function main() {
  console.log("Seeding database...");

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories created");

  for (const game of GAMES) {
    const category = await prisma.category.findUnique({ where: { slug: game.category } });
    if (!category) {
      console.warn(`Category ${game.category} not found, skipping ${game.slug}`);
      continue;
    }
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {},
      create: {
        slug: game.slug,
        title: game.title,
        description: game.description,
        complexity: game.complexity,
        status: "published",
        categoryId: category.id,
      },
    });
  }
  console.log("Games created");
  console.log("Seed complete!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
