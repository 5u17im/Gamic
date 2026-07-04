import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GamePlayer } from "@/components/games/GamePlayer";

describe("GamePlayer", () => {
  it("shows loading state initially", () => {
    render(<GamePlayer slug="hex-merge" />);
    expect(screen.getByText("Cargando juego...")).toBeDefined();
  });

  it("shows not available for unknown games", () => {
    render(<GamePlayer slug="unknown-game" />);
    expect(screen.getByText("Juego no disponible")).toBeDefined();
  });

  it("renders iframe for known games", () => {
    const { container } = render(<GamePlayer slug="quick-math" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeDefined();
    expect(iframe?.getAttribute("src")).toBe("/games/quick-math/index.html");
    expect(iframe?.getAttribute("sandbox")).toContain("allow-scripts");
  });
});
