import type { SupabaseClient } from '@supabase/supabase-js'
import type { Sphere, DailyMission, Task, Pace } from './types'

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

// daily_minutes → preferred pace for task selection
function minutesToPace(dailyMinutes: number): Pace {
  if (dailyMinutes <= 15) return 'calm'
  if (dailyMinutes <= 45) return 'standard'
  return 'intense'
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Tasks matching the preferred pace get 3x weight; others get 1x.
// This preserves variety while favouring the right difficulty.
function pickByPace(tasks: Task[], pace: Pace): Task {
  const weighted: Task[] = []
  for (const task of tasks) {
    const weight = Array.isArray(task.pace) && task.pace.includes(pace) ? 3 : 1
    for (let i = 0; i < weight; i++) weighted.push(task)
  }
  return randomItem(weighted)
}

export async function generateDailyMissions(
  userId: string,
  date: string,
  supabase: SupabaseClient
): Promise<DailyMission[]> {
  // ── 1. Fetch user preferences ──────────────────────────────
  const { data: userData } = await supabase
    .from('users')
    .select('daily_minutes, preferred_spheres')
    .eq('id', userId)
    .single()

  const dailyMinutes: number = userData?.daily_minutes ?? 30
  const preferredSpheres: Sphere[] = (userData?.preferred_spheres as Sphere[] | null) ?? []
  const preferredPace = minutesToPace(dailyMinutes)

  // ── 2. Determine spheres for today ─────────────────────────
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay()
  const spheres: Sphere[] = [...SPHERE_SCHEDULE[dayOfWeek]]

  // ── 3. Apply preferred_spheres ─────────────────────────────
  // If no scheduled sphere overlaps with preferred ones, swap the 3rd
  // slot for a random preferred sphere (excluding 'challenge').
  if (preferredSpheres.length > 0) {
    const hasPreferred = spheres.some((s) => preferredSpheres.includes(s))
    if (!hasPreferred) {
      const validPreferred = preferredSpheres.filter((s) => s !== 'challenge')
      if (validPreferred.length > 0) {
        spheres[2] = randomItem(validPreferred)
      }
    }
  }

  console.log('[generateDailyMissions]', {
    dailyMinutes,
    preferredPace,
    preferredSpheres,
    selectedSpheres: spheres,
  })

  const inserts: object[] = []

  // ── 4. 3 миссии по сферам дня ──────────────────────────────
  for (const sphere of spheres) {
    const { data: tasks } = await supabase
      .from('tasks_pool')
      .select('*')
      .eq('sphere', sphere)
      .eq('type', 'mission')

    if (!tasks || tasks.length === 0) continue

    const task = pickByPace(tasks as Task[], preferredPace)
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

  // ── 5. 1 вызов дня (challenge, without pace weighting) ─────
  const { data: challenges } = await supabase
    .from('tasks_pool')
    .select('*')
    .eq('type', 'challenge')

  if (challenges && challenges.length > 0) {
    const challenge = randomItem(challenges as Task[])
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

  // ── 6. Вставляем миссии с JOIN tasks_pool ──────────────────
  const { data: inserted, error } = await supabase
    .from('daily_missions')
    .insert(inserts)
    .select('*, task:tasks_pool(*)')

  if (error) throw new Error(`generateDailyMissions: ${error.message}`)

  // ── 7. Создаём daily_log на сегодня ────────────────────────
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
