const { createClient } = require("@libsql/client");

const db = createClient({ url: "file:./dev.db" });

async function main() {
  console.log("Seeding database...");

  const categories = [
    { name: "Arcade", slug: "arcade", icon: "🎯", displayOrder: 1 },
    { name: "Puzzle", slug: "puzzle", icon: "🧩", displayOrder: 2 },
    { name: "Estrategia", slug: "estrategia", icon: "🧠", displayOrder: 3 },
    { name: "Habilidad", slug: "habilidad", icon: "🎮", displayOrder: 4 },
    { name: "Aventura", slug: "aventura", icon: "🗺️", displayOrder: 5 },
    { name: "Deportes", slug: "deportes", icon: "⚽", displayOrder: 6 },
    { name: "Cartas", slug: "cartas", icon: "🃏", displayOrder: 7 },
    { name: "Educativos", slug: "educativos", icon: "📐", displayOrder: 8 },
  ];

  for (const cat of categories) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO Category (id, name, slug, icon, displayOrder) VALUES (?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), cat.name, cat.slug, cat.icon, cat.displayOrder],
    });
  }
  console.log("Categories created");

  const games = [
    { slug: "hex-merge", title: "Hex Merge", category: "puzzle", description: "Fusiona fichas hexagonales del mismo color en un tablero panal.", complexity: 1 },
    { slug: "asteroid-sweep", title: "Asteroid Sweep", category: "arcade", description: "Nave que esquiva y destruye asteroides.", complexity: 2 },
    { slug: "pivot", title: "Pivot", category: "habilidad", description: "Gira la plataforma para que la bola no caiga.", complexity: 1 },
    { slug: "quick-math", title: "Quick Math", category: "educativos", description: "Operaciones aritméticas contra reloj.", complexity: 1 },
    { slug: "flip-tactics", title: "Flip Tactics", category: "cartas", description: "Memoria con habilidades especiales.", complexity: 2 },
  ];

  for (const game of games) {
    const result = await db.execute({
      sql: "SELECT id FROM Category WHERE slug = ?",
      args: [game.category],
    });
    if (result.rows.length === 0) {
      console.warn("Category not found:", game.category);
      continue;
    }
    const categoryId = result.rows[0].id;
    await db.execute({
      sql: "INSERT OR IGNORE INTO Game (id, slug, title, description, complexity, status, categoryId) VALUES (?, ?, ?, ?, ?, 'published', ?)",
      args: [crypto.randomUUID(), game.slug, game.title, game.description, game.complexity, categoryId],
    });
  }
  console.log("Games created");
  console.log("Seed complete!");
}

main().catch((e) => console.error(e));
