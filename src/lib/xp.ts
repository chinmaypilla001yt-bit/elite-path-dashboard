// Level N total XP threshold = 100 * (2^(N-1) - 1)
// 1→0, 2→100, 3→300, 4→700, 5→1500, 6→3100 …

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 100 * (2 ** (level - 1) - 1);
}

export function levelFromXP(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function xpStats(xp: number) {
  const level = levelFromXP(xp);
  const curFloor = xpForLevel(level);
  const nextFloor = xpForLevel(level + 1);
  const into = xp - curFloor;
  const span = nextFloor - curFloor;
  const remaining = Math.max(0, nextFloor - xp);
  const progress = span === 0 ? 0 : Math.min(100, Math.round((into / span) * 100));
  return { level, xp, into, span, nextFloor, remaining, progress };
}
