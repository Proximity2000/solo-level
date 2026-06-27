// ============================================================
// Personal Trial — Risk flag detection (pure, deterministic)
// No UI output in Milestone 1 — used for logging/Milestone 3 safety layer
// ============================================================

import type { PersonalTrialCategory } from './personal-trial-categories'

export type RiskFlag =
  | 'sleep_goal'
  | 'fitness_beginner'
  | 'body_goal'
  | 'finance_goal'
  | 'mental_health_adjacent'
  | 'substance_adjacent'

type QuestionnaireAnswers = Record<string, string>

/**
 * Pure function — no side effects, no DB calls.
 * Returns zero or more risk flags based on category, title, why, and answers.
 */
export function computeRiskFlags(
  category: PersonalTrialCategory,
  title: string,
  why: string,
  answers: QuestionnaireAnswers
): RiskFlag[] {
  const flags = new Set<RiskFlag>()
  const text = (title + ' ' + why).toLowerCase()

  // ── sleep_goal ──────────────────────────────────────────────
  if (
    category === 'routine' ||
    ['сон', 'спать', 'засыпать', 'бессонниц', 'просыпат'].some(kw => text.includes(kw))
  ) {
    flags.add('sleep_goal')
  }

  // ── fitness_beginner ────────────────────────────────────────
  if (category === 'fitness') {
    const level = answers['q_current_level'] ?? ''
    if (level === 'Почти не двигаюсь' || level === 'Иногда хожу/езжу') {
      flags.add('fitness_beginner')
    }
  }

  // ── body_goal ───────────────────────────────────────────────
  const bodyKeywords = ['вес', 'похудеть', 'похудан', 'диет', 'калори', 'питани', 'есть меньше']
  if (bodyKeywords.some(kw => text.includes(kw))) {
    flags.add('body_goal')
  }

  // ── finance_goal ────────────────────────────────────────────
  if (category === 'finance') {
    flags.add('finance_goal')
  }

  // ── mental_health_adjacent ──────────────────────────────────
  const mentalKeywords = [
    'тревог', 'депресс', 'стресс', 'паник', 'тревожн',
    'психолог', 'терапевт', 'настроени',
  ]
  if (mentalKeywords.some(kw => text.includes(kw))) {
    flags.add('mental_health_adjacent')
  }

  // ── substance_adjacent ──────────────────────────────────────
  const substanceKeywords = [
    'курит', 'бросить курить', 'алкогол', 'не пить', 'бросить пить',
    'сигарет', 'выпивк',
  ]
  if (substanceKeywords.some(kw => text.includes(kw))) {
    flags.add('substance_adjacent')
  }

  return Array.from(flags)
}
