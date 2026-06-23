// ============================================================
// Solo Level — Official Trial Trophy Definitions
// All trophy data (key, tier, title, description) is derived
// from lib/smoking-trial-milestones.ts — no duplication.
// ============================================================

import { getSmokingTrialTrophyForDay } from './smoking-trial-milestones'

export type TrialTrophy = {
  trophy_key: string
  tier: string
  title: string
  description: string
}

// ── Smoking trial trophies ──────────────────────────────────

const woodData = getSmokingTrialTrophyForDay(7)!

/** Awarded after completing Day 7 of the smoking trial. */
export const SMOKING_WOOD_TROPHY: TrialTrophy = {
  trophy_key:  woodData.trophy_key,
  tier:        woodData.tier,
  title:       woodData.title,
  description: woodData.description,
}
