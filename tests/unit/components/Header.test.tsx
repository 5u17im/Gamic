import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: vi.fn(),
}));

describe("Header", () => {
  it("renders the logo", () => {
    render(<Header />);
    expect(screen.getByText("Gamic")).toBeDefined();
  });

  it("renders navigation category links", () => {
    render(<Header />);
    expect(screen.getByText("Arcade")).toBeDefined();
    expect(screen.getByText("Puzzle")).toBeDefined();
    expect(screen.getByText("Estrategia")).toBeDefined();
    expect(screen.getByText("Ver más")).toBeDefined();
  });
});
