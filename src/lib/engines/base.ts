import type { GameConfig, GameInputEvent } from "@/types";

export abstract class BaseGameEngine {
  protected config: GameConfig | null = null;
  protected running = false;

  abstract init(config: GameConfig): void;
  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract handleInput(event: GameInputEvent): void;

  cleanup(): void {
    this.config = null;
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }
}
