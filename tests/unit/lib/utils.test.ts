import { describe, it, expect } from "vitest";
import { cn, formatScore, formatDuration, formatDate, slugify, getComplexityLabel, getComplexityColor } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});

describe("formatScore", () => {
  it("formats number with locale", () => {
    expect(formatScore(1000)).toBe("1.000");
  });

  it("handles zero", () => {
    expect(formatScore(0)).toBe("0");
  });
});

describe("formatDuration", () => {
  it("formats seconds to m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3661)).toBe("61:01");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2026-07-04");
    expect(result).toContain("jul");
    expect(result).toContain("2026");
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date(2026, 0, 1));
    expect(result).toContain("ene");
  });
});

describe("slugify", () => {
  it("converts text to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("  extra   spaces  ")).toBe("extra-spaces");
    expect(slugify("Special!@#Chars")).toBe("specialchars");
    expect(slugify("")).toBe("");
  });
});

describe("getComplexityLabel", () => {
  it("returns correct labels", () => {
    expect(getComplexityLabel(0)).toBe("");
    expect(getComplexityLabel(1)).toBe("Fácil");
    expect(getComplexityLabel(2)).toBe("Media");
    expect(getComplexityLabel(3)).toBe("Difícil");
    expect(getComplexityLabel(5)).toBe("Maestro");
    expect(getComplexityLabel(99)).toBe("Desconocida");
  });
});

describe("getComplexityColor", () => {
  it("returns correct color classes", () => {
    expect(getComplexityColor(0)).toBe("");
    expect(getComplexityColor(1)).toBe("text-accent");
    expect(getComplexityColor(2)).toBe("text-secondary");
    expect(getComplexityColor(3)).toBe("text-danger");
    expect(getComplexityColor(99)).toBe("text-text-secondary");
  });
});
