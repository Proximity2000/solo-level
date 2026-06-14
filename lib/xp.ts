// ============================================================
// Solo Level — XP & Level System
// xpForLevel(N) = XP, необходимый для перехода с уровня N на N+1
// Формула: Math.round(80 * N^1.6)
// ============================================================

export function xpForLevel(level: number): number {
  return Math.round(80 * Math.pow(level, 1.6))
}

// Суммарный XP, необходимый чтобы ДОСТИЧЬ уровня (накопленный с уровня 1)
export function getTotalXpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i)
  }
  return total
}

// Текущий уровень по общему XP
export function getLevelFromXP(totalXp: number): number {
  let level = 1
  let accumulated = 0
  while (accumulated + xpForLevel(level) <= totalXp) {
    accumulated += xpForLevel(level)
    level++
  }
  return level
}

// XP внутри текущего уровня и сколько нужно до следующего
export function getProgressToNextLevel(
  totalXp: number,
  currentLevel: number
): { current: number; needed: number; progress: number } {
  let accumulated = 0
  for (let i = 1; i < currentLevel; i++) {
    accumulated += xpForLevel(i)
  }
  const current = Math.max(0, totalXp - accumulated)
  const needed = xpForLevel(currentLevel)
  return {
    current,
    needed,
    progress: Math.min(1, current / needed),
  }
}

// Таблица уровней для отладки
export function getLevelTable(
  levels: number[] = [1, 2, 3, 5, 10, 20, 50]
): Array<{ level: number; xpToNext: number; totalXpNeeded: number }> {
  return levels.map((level) => ({
    level,
    xpToNext: xpForLevel(level),
    totalXpNeeded: getTotalXpForLevel(level),
  }))
}
