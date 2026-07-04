import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGame } from "@/hooks/useGame";
import { renderHook, act } from "@testing-library/react";

function createMockWindow() {
  const listeners = new Map<string, EventListener[]>();
  return {
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type)!.push(listener);
    }),
    removeEventListener: vi.fn(),
    postMessage: vi.fn(),
    listeners,
  };
}

function createMockIframe() {
  return {
    contentWindow: {
      postMessage: vi.fn(),
    },
  } as unknown as HTMLIFrameElement;
}

describe("useGame", () => {
  const mockWindow = createMockWindow();
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  const originalPostMessage = window.postMessage;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial state", () => {
    const iframeRef = { current: null };
    const { result } = renderHook(() => useGame({ slug: "hex-merge" }));

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
