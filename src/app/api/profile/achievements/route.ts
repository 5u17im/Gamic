import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await db.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json(achievements.map((entry) => ({
      id: entry.id,
      slug: entry.achievement.slug,
      title: entry.achievement.title,
      description: entry.achievement.description,
      icon: entry.achievement.icon,
      unlockedAt: entry.unlockedAt,
    })));
  } catch (e) {
    console.error("profile/achievements GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
