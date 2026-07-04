import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { renderHook, act } from "@testing-library/react";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default value when key is empty", () => {
    const { result } = renderHook(() => useLocalStorage<number>("test-key", 42));
    expect(result.current[0]).toBe(42);
  });

  it("stores and retrieves a value", () => {
    const { result } = renderHook(() => useLocalStorage<number>("test-key", 0));

    act(() => {
      result.current[1](100);
    });

    expect(result.current[0]).toBe(100);
    expect(JSON.parse(localStorage.getItem("test-key")!)).toBe(100);
  });

  it("reads existing value from localStorage", () => {
    localStorage.setItem("existing-key", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("existing-key", "default"));
    expect(result.current[0]).toBe("stored");
  });

  it("handles complex objects", () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ a: number }>("obj-key", { a: 0 })
    );

    act(() => {
      result.current[1]({ a: 42 });
    });

    expect(result.current[0]).toEqual({ a: 42 });
  });

  it("throws during SSR", () => {
    const w = globalThis as any;
    vi.stubGlobal("window", undefined);

    expect(() => {
      renderHook(() => useLocalStorage("ssr", "val"));
    }).toThrow();

    vi.unstubAllGlobals();
  });
});
