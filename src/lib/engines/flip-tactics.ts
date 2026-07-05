export const CARD_COLORS = ["#6C5CE7", "#00CEC9", "#FDCB6E", "#E17055", "#FD79A8", "#00B894", "#0984E3", "#F39C12"];

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createCards(count: number): { pairIdx: number; color: string; flipped: boolean; matched: boolean }[] {
  const pairs: number[] = [];
  for (let i = 0; i < count / 2; i++) {
    pairs.push(i, i);
  }
  const shuffled = shuffle(pairs);
  return shuffled.map((pairIdx) => ({
    pairIdx,
    color: CARD_COLORS[pairIdx % CARD_COLORS.length],
    flipped: false,
    matched: false,
  }));
}

export function checkMatch(cards: { pairIdx: number; flipped: boolean }[], idx1: number, idx2: number): boolean {
  return cards[idx1].pairIdx === cards[idx2].pairIdx;
}

export function calculateFlipScore(hasSpecial: boolean[], multiplier: number): number {
  const base = hasSpecial.reduce((sum, s) => sum + (s ? 100 : 0), 50);
  return base * multiplier;
}
