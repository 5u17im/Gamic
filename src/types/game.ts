export interface GameConfig {
  gameId: string;
  difficulty?: number;
  seed?: number;
  playerName?: string;
}

export interface GameScore {
  score: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface GameBridgeMessage {
  type: "ready" | "start" | "pause" | "resume" | "restart" | "score" | "gameover" | "error" | "achievement";
  payload?: Record<string, unknown>;
  timestamp: number;
}

export interface GameEngine {
  init(config: GameConfig): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  handleInput(event: GameInputEvent): void;
  cleanup(): void;
}

export type GameInputEvent = {
  type: "keydown" | "keyup" | "mousedown" | "mouseup" | "mousemove" | "touchstart" | "touchend" | "touchmove";
  data: Record<string, unknown>;
};

export interface GameMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  thumbnail: string;
  complexity: number;
  instructions: string;
  controls: string;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  gameCount: number;
}

export interface ScoreEntry {
  id: string;
  userId: string;
  playerName: string;
  playerImage?: string;
  score: number;
  duration: number;
  timestamp: string;
  rank?: number;
}

export interface UserProfile {
  id: string;
  nickname: string;
  name: string;
  image: string;
  createdAt: string;
  totalPlayTime: number;
  totalGames: number;
  achievements: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
}

export const GAME_EVENTS = {
  READY: "ready",
  START: "start",
  PAUSE: "pause",
  RESUME: "resume",
  RESTART: "restart",
  SCORE: "score",
  GAME_OVER: "gameover",
  ERROR: "error",
  ACHIEVEMENT: "achievement",
} as const;
