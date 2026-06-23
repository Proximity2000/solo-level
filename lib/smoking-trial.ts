// ============================================================
// Solo Level — Smoking Trial Route
// ============================================================

export type SmokingTrialMission = {
  mission_key: string
  title: string
  description: string
}

// First 7 days of the curated route
const ROUTE: SmokingTrialMission[] = [
  {
    mission_key: 'smoking_day_1_observation',
    title: 'Разведка привычки',
    description:
      'Сегодня отследи 3 момента, когда захотелось курить: время, место и причина. Не борись с собой — наша задача увидеть систему.',
  },
  {
    mission_key: 'smoking_day_2_pause',
    title: 'Пауза перед автоматом',
    description:
      'Один раз сегодня, когда захочется курить, сделай паузу на 5 минут. Просто отметь, что происходило с желанием.',
  },
  {
    mission_key: 'smoking_day_3_reduce_access',
    title: 'Убрать лёгкий доступ',
    description:
      'Выбери один маленький способ сделать курение менее автоматическим: убери сигареты из поля зрения, не носи их в руке или измени привычное место.',
  },
  {
    mission_key: 'smoking_day_4_ritual_swap',
    title: 'Замена ритуала',
    description:
      'Подготовь одну замену для привычного момента: вода, короткая прогулка, жвачка, дыхание или другое простое действие.',
  },
  {
    mission_key: 'smoking_day_5_trigger_map',
    title: 'Карта триггеров',
    description:
      'Выбери один частый триггер и заранее реши, что сделаешь вместо курения в этот момент.',
  },
  {
    mission_key: 'smoking_day_6_freedom_window',
    title: 'Окно свободы',
    description:
      'Выбери один небольшой отрезок дня и пройди его без автоматического курения. Не идеально — просто осознанно.',
  },
  {
    mission_key: 'smoking_day_7_first_week',
    title: 'Первая неделя',
    description:
      'Оглянись на путь. Запиши одну вещь, которую ты понял о своей привычке, и один шаг, который хочешь сохранить дальше.',
  },
]

const FALLBACK: SmokingTrialMission = {
  mission_key: 'smoking_day_ongoing_awareness',
  title: 'Продолжай наблюдать путь',
  description:
    'Отметь один момент, когда ты выбрал осознанность вместо автоматизма. Даже маленькое замеченное решение — часть пути.',
}

/**
 * Returns the curated mission for a 1-based day number.
 * Days 1–7 return specific missions; day 8+ returns the open-ended fallback.
 */
export function getSmokingTrialMission(dayNumber: number): SmokingTrialMission {
  if (dayNumber >= 1 && dayNumber <= ROUTE.length) {
    return ROUTE[dayNumber - 1]
  }
  return FALLBACK
}

/**
 * Calculates the effective trial day to display and act on.
 *
 * Rules:
 * - No completed log → return trial.current_day (fresh start = Day 1).
 * - Latest log completed TODAY → same day (do not advance on the same calendar day).
 * - Latest log completed on an EARLIER date → day_number + 1 (next day is now unlocked).
 */
export function getEffectiveSmokingTrialDay(
  trial: { current_day: number },
  latestLog: { log_date: string; day_number: number; completed_at: string | null } | null,
  today: string
): number {
  if (!latestLog || !latestLog.completed_at) {
    return trial.current_day
  }
  if (latestLog.log_date === today) {
    // Completed today — stay on the same day
    return latestLog.day_number
  }
  // Completed on an earlier date — next day is now available
  return latestLog.day_number + 1
}
