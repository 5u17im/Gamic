export function applyGravity(vy: number, tilt: number, dt: number): number {
  const gravity = 400;
  const tiltForce = Math.sin(tilt) * 200;
  return vy + gravity * dt + tiltForce * dt;
}

export function checkPlatformCollision(
  ballX: number, ballY: number, ballR: number,
  platY: number, platCenterX: number, platHalfW: number, platH: number
): { collision: boolean; newY: number; newVy: number } {
  if (ballY + ballR > platY && ballY - ballR < platY + platH &&
      ballX > platCenterX - platHalfW && ballX < platCenterX + platHalfW) {
    return { collision: true, newY: platY - ballR, newVy: ballY * -0.3 };
  }
  return { collision: false, newY: ballY, newVy: 0 };
}
