export function createBullet(x: number, y: number, angle: number) {
  const speed = 300;
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 60 };
}

export function createAsteroid(x: number, y: number, size: number) {
  return { x, y, size, vx: 0, vy: 0, rotation: 0, rotSpeed: 0, vertices: 10 };
}

export function checkCollision(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy < (ar + br) * (ar + br);
}

export function calculateAsteroidScore(size: number): number {
  return Math.ceil(100 / size * 30);
}
