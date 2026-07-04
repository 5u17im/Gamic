"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameBridgeMessage } from "@/types";

interface UseGameOptions {
  slug: string;
  onScore?: (score: number) => void;
  onGameOver?: (score: number) => void;
  onError?: (error: string) => void;
}

interface UseGameReturn {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
}

export function useGame({ slug, onScore, onGameOver, onError }: UseGameOptions): UseGameReturn {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback(
    (event: MessageEvent<GameBridgeMessage>) => {
      const msg = event.data;
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case "ready":
          setIsLoaded(true);
          setIsLoading(false);
          break;
        case "score":
          onScore?.(msg.payload?.score as number);
          break;
        case "gameover":
          onGameOver?.(msg.payload?.score as number);
          break;
        case "error":
          const errMsg = (msg.payload?.message as string) ?? "Unknown error";
          setError(errMsg);
          onError?.(errMsg);
          break;
      }
    },
    [onScore, onGameOver, onError]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const postMessage = useCallback((type: string, payload?: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type, payload, timestamp: Date.now() },
      "*"
    );
  }, []);

  const start = useCallback(() => postMessage("start"), [postMessage]);
  const pause = useCallback(() => postMessage("pause"), [postMessage]);
  const resume = useCallback(() => postMessage("resume"), [postMessage]);
  const restart = useCallback(() => postMessage("restart"), [postMessage]);

  return {
    iframeRef,
    isLoaded,
    isLoading,
    error,
    start,
    pause,
    resume,
    restart,
  };
}
