import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GamePlayer } from "@/components/games/GamePlayer";

describe("GamePlayer", () => {
  it("shows loading state initially", () => {
    render(<GamePlayer slug="hex-merge" />);
    expect(screen.getByText("Cargando juego...")).toBeDefined();
  });

  it("renders iframe with correct src", () => {
    const { container } = render(<GamePlayer slug="quick-math" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeDefined();
    expect(iframe?.getAttribute("src")).toBe("/games/quick-math/index.html");
    expect(iframe?.getAttribute("sandbox")).toContain("allow-scripts");
  });

  it("renders iframe for any slug", () => {
    const { container } = render(<GamePlayer slug="unknown-game" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeDefined();
    expect(iframe?.getAttribute("src")).toBe("/games/unknown-game/index.html");
  });
});
