import type { GameBridgeMessage, GameConfig, GameScore } from "@/types";

type BridgeCallback = (message: GameBridgeMessage) => void;

const ALLOWED_ORIGINS = [window.location.origin];

export class GameBridge {
  private iframe: HTMLIFrameElement | null = null;
  private targetOrigin: string;
  private callback: BridgeCallback | null = null;
  private pendingMessages: GameBridgeMessage[] = [];

  constructor(targetOrigin?: string) {
    this.targetOrigin = targetOrigin ?? window.location.origin;
  }

  connect(iframe: HTMLIFrameElement, callback: BridgeCallback): void {
    this.iframe = iframe;
    this.callback = callback;
    window.addEventListener("message", this.handleMessage);
    for (const msg of this.pendingMessages) {
      this.post(msg);
    }
    this.pendingMessages = [];
  }

  disconnect(): void {
    window.removeEventListener("message", this.handleMessage);
    this.iframe = null;
    this.callback = null;
  }

  start(config: GameConfig): void {
    this.send("start", { config });
  }

  pause(): void {
    this.send("pause");
  }

  resume(): void {
    this.send("resume");
  }

  restart(config?: GameConfig): void {
    this.send("restart", config ? { config } : undefined);
  }

  private send(type: GameBridgeMessage["type"], payload?: Record<string, unknown>): void {
    const message: GameBridgeMessage = { type, payload, timestamp: Date.now() };
    this.post(message);
  }

  private post(message: GameBridgeMessage): void {
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(message, this.targetOrigin);
    } else {
      this.pendingMessages.push(message);
    }
  }

  private handleMessage = (event: MessageEvent<GameBridgeMessage>): void => {
    if (!ALLOWED_ORIGINS.includes(event.origin)) return;

    const msg = event.data;
    if (!msg || !msg.type) return;

    this.callback?.(msg);
  };

  static parseScore(msg: GameBridgeMessage): GameScore | null {
    if (msg.type !== "score" && msg.type !== "gameover") return null;
    if (!msg.payload) return null;

    return {
      score: (msg.payload.score as number) ?? 0,
      duration: (msg.payload.duration as number) ?? 0,
      metadata: msg.payload.metadata as Record<string, unknown> | undefined,
    };
  }
}

export function createGameBridgeUrl(slug: string): string {
  return `/api/games/${slug}/loader`;
}
