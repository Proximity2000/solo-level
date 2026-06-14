import type { SupabaseClient } from '@supabase/supabase-js'
import type { Sphere, DailyMission } from './types'

// ============================================================
// Расписание сфер по дням недели
// 0=Вс, 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб
// ============================================================
const SPHERE_SCHEDULE: Record<number, Sphere[]> = {
  1: ['body', 'mind', 'discipline'],
  2: ['body', 'awareness', 'social'],
  3: ['mind', 'discipline', 'body'],
  4: ['awareness', 'mind', 'social'],
  5: ['body', 'discipline', 'awareness'],
  6: ['social', 'mind', 'body'],
  0: ['awareness', 'discipline', 'social'],
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function generateDailyMissions(
  userId: string,
  date: string,
  supabase: SupabaseClient
): Promise<DailyMission[]> {
  // Определяем день недели через локальное время (без UTC-смещения)
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay()
  const spheres = SPHERE_SCHEDULE[dayOfWeek]

  const inserts: object[] = []

  // 3 миссии по сферам дня
  for (const sphere of spheres) {
    const { data: tasks } = await supabase
      .from('tasks_pool')
      .select('*')
      .eq('sphere', sphere)
      .eq('type', 'mission')

    if (!tasks || tasks.length === 0) continue

    const task = randomItem(tasks)
    inserts.push({
      user_id: userId,
      task_id: task.id,
      sphere: task.sphere,
      type: 'mission',
      date,
      completion: 'pending',
      xp_earned: 0,
    })
  }

  // 1 вызов дня
  const { data: challenges } = await supabase
    .from('tasks_pool')
    .select('*')
    .eq('type', 'challenge')

  if (challenges && challenges.length > 0) {
    const challenge = randomItem(challenges)
    inserts.push({
      user_id: userId,
      task_id: challenge.id,
      sphere: challenge.sphere,
      type: 'challenge',
      date,
      completion: 'pending',
      xp_earned: 0,
    })
  }

  if (inserts.length === 0) return []

  // Вставляем миссии с JOIN tasks_pool
  const { data: inserted, error } = await supabase
    .from('daily_missions')
    .insert(inserts)
    .select('*, task:tasks_pool(*)')

  if (error) throw new Error(`generateDailyMissions: ${error.message}`)

  // Создаём daily_log на сегодня
  await supabase.from('daily_log').upsert({
    user_id: userId,
    date,
    result: 'skipped',
    missions_total: inserts.length,
    missions_done: 0,
    xp_earned: 0,
  }, { onConflict: 'user_id,date' })

  return (inserted ?? []) as unknown as DailyMission[]
}
