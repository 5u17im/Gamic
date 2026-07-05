import { db } from "@/lib/db";

export async function getPublishedGames() {
  return db.game.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function getGameBySlug(slug: string) {
  return db.game.findUnique({
    where: { slug, status: "published" },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function getCategories() {
  return db.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { games: { where: { status: "published" } } } } },
  });
}
