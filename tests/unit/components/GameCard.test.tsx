import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameCard } from "@/components/games/GameCard";

describe("GameCard", () => {
  const defaultProps = {
    slug: "hex-merge",
    title: "Hex Merge",
    category: "Puzzle",
    categorySlug: "puzzle",
    description: "A puzzle game",
    complexity: 1,
    thumbnail: null,
  };

  it("renders game title and category", () => {
    render(<GameCard {...defaultProps} />);
    expect(screen.getByText("Hex Merge")).toBeDefined();
    expect(screen.getByText("Puzzle")).toBeDefined();
  });

  it("renders complexity label for easy games", () => {
    render(<GameCard {...defaultProps} />);
    expect(screen.getByText("Fácil")).toBeDefined();
  });

  it("renders complexity for medium games", () => {
    render(<GameCard {...defaultProps} complexity={2} />);
    expect(screen.getByText("Media")).toBeDefined();
  });

  it("includes a play link", () => {
    render(<GameCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/play/hex-merge");
  });
});
