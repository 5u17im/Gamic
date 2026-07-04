import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders the logo link", () => {
    render(<Footer />);
    const logo = screen.getByRole("link", { name: /gamic/i });
    expect(logo).toBeDefined();
  });

  it("shows copyright with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeDefined();
  });
});
