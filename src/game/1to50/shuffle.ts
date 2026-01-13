export function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}
