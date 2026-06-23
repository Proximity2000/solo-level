// ============================================================
// Solo Level — Official Trial Trophy Definitions
// Trophy titles and tier keys are derived from the shared
// milestone configuration to prevent string duplication.
// ============================================================

import { getSmokingTrialMilestones } from './smoking-trial-milestones'

export type TrialTrophy = {
  trophy_key: string
  tier: string
  title: string
  description: string
}

// ── Smoking trial trophies ──────────────────────────────────

const smokingMilestones = getSmokingTrialMilestones()

const woodMilestone = smokingMilestones.find((m) => m.tier === 'wood')!

/** Awarded after completing Day 7 of the smoking trial. */
export const SMOKING_WOOD_TROPHY: TrialTrophy = {
  trophy_key: woodMilestone.trophy_key,
  tier: woodMilestone.tier,
  title: woodMilestone.title,
  description:
    'Первая неделя пути. Ты начал замечать привычку и выбирать осознанность вместо автомата.',
}
