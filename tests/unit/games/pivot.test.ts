import { describe, it, expect } from "vitest";

// Pivot core logic
function applyGravity(vy: number, tilt: number, dt: number): number {
  const gravity = 400;
  const tiltForce = Math.sin(tilt) * 200;
  return vy + gravity * dt + tiltForce * dt;
}

function checkPlatformCollision(
  ballX: number, ballY: number, ballR: number,
  platY: number, platCenterX: number, platHalfW: number, platH: number
): { collision: boolean; newY: number; newVy: number } {
  if (ballY + ballR > platY && ballY - ballR < platY + platH &&
      ballX > platCenterX - platHalfW && ballX < platCenterX + platHalfW) {
    return { collision: true, newY: platY - ballR, newVy: ballY * -0.3 };
  }
  return { collision: false, newY: ballY, newVy: 0 };
}

describe("Pivot - Game Logic", () => {
  describe("applyGravity", () => {
    it("increases vy over time", () => {
      const vy = applyGravity(0, 0, 1 / 60);
      expect(vy).toBeGreaterThan(0);
    });

    it("tilt affects vy", () => {
      const withTilt = applyGravity(0, 0.4, 1 / 60);
      expect(withTilt).toBeGreaterThan(0);
    });
  });

  describe("checkPlatformCollision", () => {
    it("detects collision when ball is on platform", () => {
      const result = checkPlatformCollision(200, 290, 8, 290, 200, 150, 14);
      expect(result.collision).toBe(true);
      expect(result.newY).toBe(282);
    });

    it("no collision when ball is above platform", () => {
      const result = checkPlatformCollision(200, 100, 8, 290, 200, 150, 14);
      expect(result.collision).toBe(false);
    });

    it("no collision when ball is outside platform width", () => {
      const result = checkPlatformCollision(400, 290, 8, 290, 200, 150, 14);
      expect(result.collision).toBe(false);
    });
  });
});
