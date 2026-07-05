import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  // Seed categories
  const categories = [
    { name: "Arcade", slug: "arcade", description: "Juegos rápidos de acción y reflejos", icon: "🎮", displayOrder: 1 },
    { name: "Puzzle", slug: "puzzle", description: "Juegos de lógica y razonamiento", icon: "🧩", displayOrder: 2 },
    { name: "Estrategia", slug: "estrategia", description: "Juegos que requieren planificación", icon: "♟️", displayOrder: 3 },
    { name: "Habilidad", slug: "habilidad", description: "Pon a prueba tu destreza", icon: "🎯", displayOrder: 4 },
    { name: "Aventura", slug: "aventura", description: "Explora mundos y vive historias", icon: "🗺️", displayOrder: 5 },
    { name: "Deportes", slug: "deportes", description: "Competiciones deportivas", icon: "⚽", displayOrder: 6 },
    { name: "Cartas", slug: "cartas", description: "Juegos de naipes y memoria", icon: "🃏", displayOrder: 7 },
    { name: "Educativos", slug: "educativos", description: "Aprende mientras juegas", icon: "📚", displayOrder: 8 },
  ];

  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log("✅ Categories seeded");

  // Seed admin user
  const adminEmail = "admin@gamic.app";
  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 10);
    await db.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        nickname: "admin",
        password: hashed,
        role: "admin",
      },
    });
    console.log("✅ Admin user created (admin@gamic.app / admin123)");
  } else {
    console.log("✅ Admin user already exists");
  }

  // Seed games
  const games = [
    {
      slug: "hex-merge", title: "Hex Merge",
      description: "Une fichas del mismo color en un tablero hexagonal. Combina 3 o más para eliminarlas y suma puntos.",
      categorySlug: "puzzle", complexity: 2,
      instructions: "Haz clic en una ficha y luego en una ficha adyacente del mismo color para intercambiarlas. Si formas un grupo de 3 o más fichas iguales conectadas, se eliminarán y ganarás puntos.",
      controls: "🖱️ Ratón: seleccionar y mover fichas",
    },
    {
      slug: "asteroid-sweep", title: "Asteroid Sweep",
      description: "Destruye asteroides en el espacio. Esquívalos y dispara para sobrevivir el mayor tiempo posible.",
      categorySlug: "arcade", complexity: 3,
      instructions: "Mueve la nave para esquivar asteroides. Dispara para destruirlos. Los asteroides pequeños dan más puntos.",
      controls: "⬆️⬇️⬅️➡️: mover nave | ␣ Espacio: disparar",
    },
    {
      slug: "pivot", title: "Pivot",
      description: "Inclina la plataforma para guiar la pelota hasta la meta. Un juego de precisión y equilibrio.",
      categorySlug: "habilidad", complexity: 4,
      instructions: "Inclina la plataforma para hacer rodar la pelota hacia la meta. Evita los bordes y recoge potenciadores.",
      controls: "⬅️➡️: inclinar plataforma | ⬆️: impulso",
    },
    {
      slug: "quick-math", title: "Quick Math",
      description: "Resuelve operaciones matemáticas contra el reloj. Cada acierto suma puntos.",
      categorySlug: "educativos", complexity: 1,
      instructions: "Se mostrará una operación matemática. Selecciona la respuesta correcta entre las opciones.",
      controls: "🖱️ Ratón: seleccionar respuesta | ⌨️ 1-4: atajos de teclado",
    },
    {
      slug: "flip-tactics", title: "Flip Tactics",
      description: "Encuentra todos los pares de cartas. Memoriza su posición y destapa las coincidencias.",
      categorySlug: "cartas", complexity: 2,
      instructions: "Voltea dos cartas por turno. Si son iguales, se quedan destapadas. Encuentra todos los pares.",
      controls: "🖱️ Ratón/Toque: voltear cartas",
    },
  ];

  for (const game of games) {
    const category = await db.category.findUnique({ where: { slug: game.categorySlug } });
    if (!category) {
      console.warn(`Category "${game.categorySlug}" not found, skipping ${game.slug}`);
      continue;
    }
    await db.game.upsert({
      where: { slug: game.slug },
      update: {
        title: game.title,
        description: game.description,
        categoryId: category.id,
        complexity: game.complexity,
        instructions: game.instructions,
        controls: game.controls,
        status: "published",
      },
      create: {
        slug: game.slug,
        title: game.title,
        description: game.description,
        categoryId: category.id,
        complexity: game.complexity,
        instructions: game.instructions,
        controls: game.controls,
        status: "published",
      },
    });
  }
  console.log("✅ Games seeded");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
