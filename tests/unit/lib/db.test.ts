import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";

// Mock the PrismaClient
vi.mock("@/generated/prisma/index.js", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    game: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    score: {
      findMany: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn(),
  })),
}));

describe("Database Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a db instance", () => {
    expect(db).toBeDefined();
  });

  it("has expected model methods", () => {
    expect(db.user).toBeDefined();
    expect(db.game).toBeDefined();
    expect(db.score).toBeDefined();
    expect(db.category).toBeDefined();
  });
});
