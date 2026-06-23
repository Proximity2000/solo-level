// ============================================================
// Solo Level — Smoking Trial Milestone Configuration
// Single source of truth for all milestone tiers, titles, and
// progress calculations.
// ============================================================

export type SmokingMilestoneTier = 'wood' | 'bronze' | 'silver' | 'gold'

export type SmokingMilestone = {
  /** Trial day this milestone is awarded on (1-based). */
  day: number
  tier: SmokingMilestoneTier
  /** DB key used in official_trial_trophies.trophy_key */
  trophy_key: string
  title: string
  emoji: string
  /** CSS color string for tier accent (UI only). */
  color: string
}

export type SmokingTrialProgress = {
  currentDay: number
  /** Last milestone whose day <= currentDay, or null if before day 7. */
  previousMilestone: SmokingMilestone | null
  /** Next milestone to unlock, or null if day 365+ (completed). */
  nextMilestone: SmokingMilestone | null
  /** Days remaining until nextMilestone. 0 when completed. */
  daysRemaining: number
  /**
   * Progress percentage (0–100) between the previous milestone's day
   * (or 0 if none) and the next milestone's day.
   * 100 when completed (day 365+).
   */
  progressPercent: number
  /** True when the user has reached or passed day 365. */
  completed: boolean
}

// ── Milestone definitions ────────────────────────────────────

const MILESTONES: SmokingMilestone[] = [
  {
    day: 7,
    tier: 'wood',
    trophy_key: 'smoking_broken_cigarette',
    title: 'Деревянная сломанная сигарета',
    emoji: '🪵',
    color: 'rgba(180,140,80,0.9)',
  },
  {
    day: 30,
    tier: 'bronze',
    trophy_key: 'smoking_broken_cigarette_bronze',
    title: 'Бронзовая сломанная сигарета',
    emoji: '🟤',
    color: 'rgba(205,127,50,0.9)',
  },
  {
    day: 90,
    tier: 'silver',
    trophy_key: 'smoking_broken_cigarette_silver',
    title: 'Серебряная сломанная сигарета',
    emoji: '⬜',
    color: 'rgba(192,192,192,0.85)',
  },
  {
    day: 365,
    tier: 'gold',
    trophy_key: 'smoking_broken_cigarette_gold',
    title: 'Золотая сломанная сигарета',
    emoji: '🟡',
    color: 'rgba(255,200,50,0.9)',
  },
]

// ── Trophy descriptions (one per milestone day) ──────────────
// Central source of truth — used by getSmokingTrialTrophyForDay and
// lib/trial-trophies.ts so descriptions are never duplicated.

const TROPHY_DESCRIPTIONS: Record<number, string> = {
  7:   'Первая неделя пути. Ты начал замечать привычку и выбирать осознанность вместо автомата.',
  30:  'Тридцать дней пути. Ты уже не просто замечаешь привычку — ты меняешь её место в своей жизни.',
  90:  'Девяносто дней пути. Новый способ жить становится устойчивее, а старый автоматизм — слабее.',
  365: 'Год пути. Ты доказал себе, что большие изменения строятся из честных маленьких шагов.',
}

// ── SmokingTrophyForDay ───────────────────────────────────────

export type SmokingTrophyForDay = {
  trophy_key: string
  tier: SmokingMilestoneTier
  title: string
  description: string
  emoji: string
}

// ── Helpers ──────────────────────────────────────────────────

/** Returns all milestone definitions in ascending day order. */
export function getSmokingTrialMilestones(): SmokingMilestone[] {
  return MILESTONES
}

/**
 * Returns the highest milestone the user has reached (day <= currentDay),
 * or null if the user is before the first milestone (< day 7).
 */
export function getCurrentSmokingMilestone(dayNumber: number): SmokingMilestone | null {
  return [...MILESTONES].reverse().find((m) => dayNumber >= m.day) ?? null
}

/**
 * Returns the next milestone the user has not yet reached (day > currentDay),
 * or null if the user is at or past the final milestone (day 365+).
 */
export function getNextSmokingMilestone(dayNumber: number): SmokingMilestone | null {
  return MILESTONES.find((m) => m.day > dayNumber) ?? null
}

/**
 * Calculates the user's full milestone progress for a given trial day.
 *
 * Progress formula (between milestones):
 *   prevDay = previousMilestone?.day ?? 0
 *   progressPercent = round((currentDay - prevDay) / (nextDay - prevDay) * 100)
 *
 * Boundary examples:
 *   Day 1:  next=7,  prev=0,  range=7,  earned=1  → 14%,  daysRemaining=6
 *   Day 7:  next=30, prev=7,  range=23, earned=0  → 0%,   daysRemaining=23
 *   Day 30: next=90, prev=30, range=60, earned=0  → 0%,   daysRemaining=60
 *   Day 365: completed                            → 100%, daysRemaining=0
 */
/**
 * Returns the trophy definition to unlock when completing a specific day,
 * or null if the day is not a milestone day.
 *
 * Only returns a value for exactly: 7, 30, 90, 365.
 * All other days return null — no trophy is created.
 */
export function getSmokingTrialTrophyForDay(dayNumber: number): SmokingTrophyForDay | null {
  const milestone = MILESTONES.find((m) => m.day === dayNumber)
  if (!milestone) return null
  const description = TROPHY_DESCRIPTIONS[dayNumber]
  if (!description) return null
  return {
    trophy_key:  milestone.trophy_key,
    tier:        milestone.tier,
    title:       milestone.title,
    description,
    emoji:       milestone.emoji,
  }
}

export function getSmokingTrialProgress(dayNumber: number): SmokingTrialProgress {
  const nextMilestone = getNextSmokingMilestone(dayNumber)
  const previousMilestone = getCurrentSmokingMilestone(dayNumber)

  if (!nextMilestone) {
    // Day 365+ — long-term path completed
    return {
      currentDay: dayNumber,
      previousMilestone,
      nextMilestone: null,
      daysRemaining: 0,
      progressPercent: 100,
      completed: true,
    }
  }

  const daysRemaining = nextMilestone.day - dayNumber
  const prevDay = previousMilestone?.day ?? 0
  const range = nextMilestone.day - prevDay
  const earned = dayNumber - prevDay
  const progressPercent = Math.round((earned / range) * 100)

  return {
    currentDay: dayNumber,
    previousMilestone,
    nextMilestone,
    daysRemaining,
    progressPercent,
    completed: false,
  }
}
