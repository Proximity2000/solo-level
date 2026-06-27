// ============================================================
// Personal Trial — Category detection (deterministic)
// ============================================================

export type PersonalTrialCategory =
  | 'routine'
  | 'learning'
  | 'fitness'
  | 'focus'
  | 'finance'
  | 'project'
  | 'custom'

export const CATEGORY_LABELS: Record<PersonalTrialCategory, string> = {
  routine:  'Режим и привычки',
  learning: 'Учёба и развитие',
  fitness:  'Физическая активность',
  focus:    'Фокус и внимание',
  finance:  'Финансы',
  project:  'Проект или дело',
  custom:   'Своё',
}

export const CATEGORY_EMOJI: Record<PersonalTrialCategory, string> = {
  routine:  '🌙',
  learning: '📖',
  fitness:  '💪',
  focus:    '🎯',
  finance:  '💰',
  project:  '🚀',
  custom:   '✨',
}

// Keyword scoring map — each category gets +1 for every matching keyword found
// in the lowercased title+why text. Highest score wins; ties go to earlier entry.
const KEYWORD_MAP: Record<PersonalTrialCategory, string[]> = {
  routine: [
    'привычк', 'режим', 'сон', 'вставать', 'ложиться', 'утро', 'вечер',
    'распорядок', 'рутин', 'каждый день', 'ежедневн', 'расписани',
  ],
  learning: [
    'читать', 'книг', 'учиться', 'изучать', 'курс', 'язык', 'навык',
    'страниц', 'обучени', 'урок', 'знани', 'умени', 'учёб',
  ],
  fitness: [
    'бегать', 'бег', 'тренир', 'спорт', 'зарядк', 'йога', 'плавать',
    'велосипед', 'отжим', 'подтяг', 'кардио', 'качат', 'фитнес',
    'ходить', 'шаг', 'растяжк',
  ],
  focus: [
    'соцсети', 'телефон', 'экран', 'отвлекать', 'инстаграм', 'тикток',
    'ютуб', 'прокрастин', 'концентрац', 'внимани', 'фокус',
  ],
  finance: [
    'деньги', 'копить', 'накопить', 'бюджет', 'расход', 'доход',
    'финанс', 'отпуск', 'долг', 'сберег', 'экономи', 'трат',
  ],
  project: [
    'проект', 'написать', 'создать', 'запустить', 'стартап', 'бизнес',
    'сайт', 'приложени', 'идея', 'разработ', 'запис', 'снять',
  ],
  custom: [],
}

/**
 * Deterministically classify free-form text into a PersonalTrialCategory.
 * Returns 'custom' when no category scores above zero.
 */
export function detectCategory(text: string): PersonalTrialCategory {
  const lower = text.toLowerCase()

  const scores: [PersonalTrialCategory, number][] = (
    Object.entries(KEYWORD_MAP) as [PersonalTrialCategory, string[]][]
  ).map(([cat, keywords]) => {
    const score = keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0
    )
    return [cat, score]
  })

  // Sort descending by score; earlier categories win ties
  scores.sort((a, b) => b[1] - a[1])

  const [topCat, topScore] = scores[0]
  return topScore > 0 ? topCat : 'custom'
}
