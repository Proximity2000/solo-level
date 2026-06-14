'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getLevelFromXP } from '@/lib/xp'
import type { Sphere } from '@/lib/types'

type CompletionType = 'full' | 'simplified' | 'minimum'

// full=3 (лучший), simplified=2, minimum=1 (худший среди выполненных)
const COMPLETION_RANK: Record<string, number> = {
  full: 3,
  simplified: 2,
  minimum: 1,
}

// Возвращает худший результат дня (minimum хуже simplified хуже full)
function worstResult(completions: string[]): CompletionType {
  const done = completions.filter((c) => c in COMPLETION_RANK)
  if (done.length === 0) return 'full'
  const worst = Math.min(...done.map((c) => COMPLETION_RANK[c]))
  if (worst === 1) return 'minimum'
  if (worst === 2) return 'simplified'
  return 'full'
}

// Поле XP сферы в user_stats
const SPHERE_XP_FIELD: Record<Sphere, string> = {
  body: 'body_xp',
  mind: 'mind_xp',
  discipline: 'discipline_xp',
  social: 'social_xp',
  awareness: 'awareness_xp',
  challenge: 'challenge_xp',
}

export async function completeMission(
  missionId: string,
  completionType: CompletionType
): Promise<{ error?: string; success?: boolean; xpEarned?: number }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const today = new Date().toISOString().split('T')[0]

  // 1. Получить миссию + задание
  const { data: mission, error: missionErr } = await supabase
    .from('daily_missions')
    .select('*, task:tasks_pool(*)')
    .eq('id', missionId)
    .eq('user_id', user.id)
    .single()

  if (missionErr || !mission) return { error: 'Миссия не найдена' }

  // Защита от повторного начисления XP
  if (mission.completion !== 'pending') {
    console.warn(`[completeMission] BLOCKED: mission ${missionId} already completed as "${mission.completion}"`)
    return { error: 'Миссия уже выполнена' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const task = mission.task as any

  // 2. XP по типу выполнения (full > simplified > minimum)
  const xpEarned: number =
    completionType === 'full'
      ? (task.xp_full ?? 0)
      : completionType === 'simplified'
        ? (task.xp_simplified ?? 0)
        : (task.xp_minimum ?? 0)

  // 3. Обновить daily_missions
  await supabase
    .from('daily_missions')
    .update({
      completion: completionType,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    })
    .eq('id', missionId)

  // 4. Получить user_stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!stats) return { error: 'Статистика не найдена' }

  const oldTotalXp = stats.total_xp
  const oldLevel = stats.level
  const newTotalXp = oldTotalXp + xpEarned
  const newLevel = getLevelFromXP(newTotalXp)

  // Sphere XP: challenge-тип идёт в challenge_xp, остальные — по своей сфере
  const sphereKey = (mission.sphere as Sphere) in SPHERE_XP_FIELD
    ? (mission.sphere as Sphere)
    : null
  const sphereField = sphereKey ? SPHERE_XP_FIELD[sphereKey] : null
  const currentSphereXp = sphereField ? ((stats[sphereField] as number) ?? 0) : 0

  // 5. Обновить user_stats
  await supabase
    .from('user_stats')
    .update({
      total_xp: newTotalXp,
      level: newLevel,
      ...(sphereField ? { [sphereField]: currentSphereXp + xpEarned } : {}),
    })
    .eq('user_id', user.id)

  // 6. Получить все миссии за сегодня (после обновления текущей)
  const { data: todayMissions } = await supabase
    .from('daily_missions')
    .select('completion')
    .eq('user_id', user.id)
    .eq('date', today)

  const completions = todayMissions?.map((m) => m.completion) ?? []
  const doneMissions = completions.filter((c) => c in COMPLETION_RANK)
  // Все миссии выполнены = нет ни одной pending/skipped
  const allDone = completions.length > 0 && doneMissions.length === completions.length

  // 7. Читаем daily_log ДО upsert (нужен для streak-проверки и инкремента missions_done)
  const { data: log } = await supabase
    .from('daily_log')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const dailyLogResult = allDone ? worstResult(completions) : 'skipped'

  await supabase.from('daily_log').upsert(
    {
      user_id: user.id,
      date: today,
      result: dailyLogResult,
      missions_total: completions.length,
      missions_done: (log?.missions_done ?? 0) + 1,
      xp_earned: (log?.xp_earned ?? 0) + xpEarned,
    },
    { onConflict: 'user_id,date' }
  )

  // 8. Streak — обновляем только когда ВСЕ выполнены И это первый раз сегодня
  // Проверяем по старому значению log (до upsert)
  let finalStreak = stats.current_streak
  if (allDone && (!log || log.result === 'skipped')) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const { data: yesterdayLog } = await supabase
      .from('daily_log')
      .select('result')
      .eq('user_id', user.id)
      .eq('date', yesterdayStr)
      .single()

    // Серия продолжается если вчера день был завершён (не skipped и не null)
    const hadStreak = !!yesterdayLog && yesterdayLog.result !== 'skipped'
    finalStreak = hadStreak ? stats.current_streak + 1 : 1
    const newBestStreak = Math.max(stats.best_streak, finalStreak)

    await supabase
      .from('user_stats')
      .update({
        current_streak: finalStreak,
        best_streak: newBestStreak,
        total_days: stats.total_days + 1,
      })
      .eq('user_id', user.id)
  }

  // 9. [DEV] Debug output в консоль сервера
  console.log('[completeMission] ✅', {
    missionId,
    completion: completionType,
    sphere: mission.sphere,
    xpEarned,
    oldTotalXp,
    newTotalXp,
    oldLevel,
    newLevel,
    levelUp: newLevel > oldLevel,
    dailyLogResult,
    allDone,
    currentStreak: finalStreak,
  })

  revalidatePath('/today')
  return { success: true, xpEarned }
}
