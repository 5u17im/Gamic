export const OPERATORS = ["+", "-", "×"];

export function generateProblem(): { a: number; b: number; op: string; answer: number } {
  const op = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
  let a: number, b: number, answer: number;
  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      break;
    default:
      throw new Error("Unknown operator");
  }
  return { a, b, op, answer };
}

export function generateOptions(answer: number, count = 4): number[] {
  const options = new Set([answer]);
  while (options.size < count) {
    const offset = Math.floor(Math.random() * 10) + 1;
    const variant = Math.random() > 0.5 ? answer + offset : answer - offset;
    if (variant > 0) options.add(variant);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

export function calculateScore(score: number, streak: number, correct: boolean): { score: number; streak: number } {
  if (correct) {
    return { score: score + 10 + streak * 2, streak: streak + 1 };
  }
  return { score, streak: 0 };
}
