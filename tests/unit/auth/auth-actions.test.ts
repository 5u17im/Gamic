import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  signIn: signInMock,
  signOut: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed"),
  },
}));

import { loginAction, registerAction } from "@/app/actions/auth";

describe("auth server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports success when credentials sign-in works", async () => {
    signInMock.mockResolvedValue({ ok: true });

    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "secret123");

    await expect(loginAction(undefined, formData)).resolves.toEqual({ success: true });
  });

  it("reports an auth error when sign-in fails", async () => {
    signInMock.mockResolvedValue({ error: "CredentialsSignin" });

    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "secret123");

    await expect(loginAction(undefined, formData)).resolves.toEqual({ error: "Credenciales inválidas" });
  });

  it("creates a user and signs in after registration", async () => {
    signInMock.mockResolvedValue({ ok: true });

    const formData = new FormData();
    formData.set("name", "Test");
    formData.set("email", "test@example.com");
    formData.set("nickname", "tester");
    formData.set("password", "secret123");

    await expect(registerAction(undefined, formData)).resolves.toEqual({ success: true });
  });
});
