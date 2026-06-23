// ============================================================
// Solo Level — Official Trial Trophy Definitions
// ============================================================

export type TrialTrophy = {
  trophy_key: string
  tier: string
  title: string
  description: string
}

// ── Smoking trial trophies ──────────────────────────────────

/** Awarded after completing Day 7 of the smoking trial. */
export const SMOKING_WOOD_TROPHY: TrialTrophy = {
  trophy_key: 'smoking_broken_cigarette',
  tier: 'wood',
  title: 'Деревянная сломанная сигарета',
  description:
    'Первая неделя пути. Ты начал замечать привычку и выбирать осознанность вместо автомата.',
}
