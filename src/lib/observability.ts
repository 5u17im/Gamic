type EventName = "game_started" | "game_finished" | "score_submitted" | "login" | "admin_action";

export function logEvent(event: EventName, payload?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "test") return;
  console.info(`[analytics] ${event}`, payload ?? {});
}
