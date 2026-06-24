// ============================================================
// Solo Level — Smoking Trial Route
// ============================================================

export type SmokingTrialMission = {
  mission_key: string
  title: string
  description: string
}

// ── Days 1–7: Awareness foundation ──────────────────────────────
// Do not modify — Wood trophy milestone depends on Day 7 completion.
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

  // ── Days 8–12: Breaking automatic patterns ───────────────────
  {
    mission_key: 'smoking_day_8_notice_gap',
    title: 'Один момент без автомата',
    description:
      'Выбери один привычный момент и не тянись к никотину сразу. Сначала назови причину желания: стресс, скука, еда, компания или привычка.',
  },
  {
    mission_key: 'smoking_day_9_shift_trigger',
    title: 'Сместить триггер',
    description:
      'Измени одну деталь привычного сценария: другой маршрут, другое место для кофе, короткая прогулка после еды или пауза без телефона.',
  },
  {
    mission_key: 'smoking_day_10_replacement_ready',
    title: 'Под рукой',
    description:
      'Подготовь одну простую замену для тяги: воду, жвачку, дыхание, музыку, движение или своё действие.',
  },
  {
    mission_key: 'smoking_day_11_delay_urge',
    title: 'Отложить на 10 минут',
    description:
      'Один раз сегодня отложи привычный импульс на 10 минут. Не обещай себе навсегда — просто дай моменту пройти.',
  },
  {
    mission_key: 'smoking_day_12_strongest_trigger',
    title: 'Главный триггер',
    description:
      'Назови один момент, где желание сегодня было самым сильным. Что было прямо перед ним?',
  },

  // ── Days 13–17: Replacing rituals ────────────────────────────
  {
    mission_key: 'smoking_day_13_ifthen_plan',
    title: 'План на триггер',
    description:
      'Выбери один триггер и составь короткий план: «Если это случится, я сначала сделаю …».',
  },
  {
    mission_key: 'smoking_day_14_two_week_check',
    title: 'Две недели наблюдения',
    description:
      'Запиши: что стало понятнее о привычке за эти дни и какой маленький выбор уже получается лучше.',
  },
  {
    mission_key: 'smoking_day_15_hands_busy',
    title: 'Занять руки',
    description:
      'В один привычный момент займи руки другим действием: вода, заметки, прогулка, предмет в руках или другое своё решение.',
  },
  {
    mission_key: 'smoking_day_16_change_place',
    title: 'Другое место',
    description:
      'Выбери место, где привычка включается автоматически, и проведи там один короткий отрезок по-новому.',
  },
  {
    mission_key: 'smoking_day_17_remove_cue',
    title: 'Убрать напоминание',
    description:
      'Убери один визуальный триггер из поля зрения: предмет, пачку, устройство, зажигалку или привычное место хранения.',
  },

  // ── Days 18–23: Strengthening new responses ──────────────────
  {
    mission_key: 'smoking_day_18_stress_pause',
    title: 'Пауза вместо реакции',
    description:
      'Когда появится напряжение, сделай три медленных вдоха и выдоха перед любым автоматическим действием.',
  },
  {
    mission_key: 'smoking_day_19_support_phrase',
    title: 'Фраза поддержки',
    description:
      'Подготовь одну короткую фразу для сложного момента. Например: «Мне не нужно решать всё сейчас. Я выбираю паузу».',
  },
  {
    mission_key: 'smoking_day_20_track_win',
    title: 'Один осознанный выбор',
    description:
      'Заметь один момент, когда ты сделал паузу, сократил автоматизм или выбрал что-то другое. Зафиксируй его.',
  },
  {
    mission_key: 'smoking_day_21_three_week_check',
    title: 'Три недели пути',
    description:
      'Посмотри назад: какой триггер стал понятнее, а какой момент всё ещё требует внимания?',
  },
  {
    mission_key: 'smoking_day_22_social_plan',
    title: 'Не один сценарий',
    description:
      'Подумай о ситуации с людьми, где привычка включается сильнее. Выбери один способ остаться в моменте без автомата.',
  },
  {
    mission_key: 'smoking_day_23_boredom_list',
    title: 'Скука — тоже триггер',
    description:
      'Сделай короткий список из трёх действий на 5 минут, которые можно выбрать вместо автоматического ритуала.',
  },

  // ── Days 24–29: Stability and relapse prevention ─────────────
  {
    mission_key: 'smoking_day_24_protect_window',
    title: 'Свободный отрезок',
    description:
      'Выбери один небольшой отрезок дня и заранее реши, как ты пройдёшь его более осознанно.',
  },
  {
    mission_key: 'smoking_day_25_review_environment',
    title: 'Среда помогает',
    description:
      'Проверь, что вокруг тебя всё ещё провоцирует автоматизм. Убери или измени одну вещь.',
  },
  {
    mission_key: 'smoking_day_26_plan_b',
    title: 'План B',
    description:
      'Выбери сложную ситуацию и подготовь запасной сценарий, если первый план не сработает.',
  },
  {
    mission_key: 'smoking_day_27_one_moment',
    title: 'Один момент — не весь путь',
    description:
      'Напомни себе: один сложный момент не отменяет путь. Сегодня просто вернись к следующему осознанному выбору.',
  },
  {
    mission_key: 'smoking_day_28_notice_change',
    title: 'Что уже изменилось',
    description:
      'Назови одну вещь, которая изменилась в твоём отношении к привычке с начала испытания.',
  },
  {
    mission_key: 'smoking_day_29_next_level',
    title: 'Следующий уровень',
    description:
      'Выбери один принцип, который хочешь унести в следующий месяц: пауза, замена, среда, поддержка или наблюдение.',
  },

  // ── Day 30: Bronze milestone ─────────────────────────────────
  // Do not modify mission_key — Bronze trophy unlock depends on Day 30 completion.
  {
    mission_key: 'smoking_day_30_first_month',
    title: 'Первый месяц пути',
    description:
      'Оглянись на 30 дней. Запиши, что ты понял о себе, что стало сильнее и какой шаг готов продолжать дальше.',
  },
]

// Fallback for Day 31+ (Days 31–89, before Silver milestone)
const FALLBACK: SmokingTrialMission = {
  mission_key: 'smoking_day_ongoing_awareness',
  title: 'Поддерживай осознанность',
  description:
    'Выбери один момент дня, где привычка обычно включается автоматически, и сделай паузу перед действием.',
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
