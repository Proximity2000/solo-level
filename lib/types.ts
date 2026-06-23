// ============================================================
// Solo Level — TypeScript Types (соответствуют 001_schema.sql)
// ============================================================

export type Sphere = 'body' | 'mind' | 'discipline' | 'social' | 'awareness' | 'challenge'
export type TaskType = 'mission' | 'challenge'
export type Completion = 'pending' | 'full' | 'simplified' | 'minimum' | 'skipped'
export type DayResult = 'full' | 'simplified' | 'minimum' | 'skipped'
export type Pace = 'calm' | 'standard' | 'intense'
export type GoalStatus = 'active' | 'completed' | 'abandoned'
export type ActivityLevel = 'none' | 'sometimes' | 'regular'
export type ReadingLevel = 'rarely' | 'sometimes' | 'regular'

// TABLE: users
export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
  onboarding_done: boolean
  pace: Pace
  daily_minutes: number
  preferred_spheres: Sphere[] | null
}

// TABLE: user_stats
export interface UserStats {
  user_id: string
  total_xp: number
  level: number
  body_xp: number
  mind_xp: number
  discipline_xp: number
  social_xp: number
  awareness_xp: number
  challenge_xp: number
  current_streak: number
  best_streak: number
  total_days: number
  start_date: string
}

// TABLE: user_snapshot
export interface UserSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  activity_level: ActivityLevel | null
  reading_level: ReadingLevel | null
  discipline_score: number | null
  goal_3months: string | null
  created_at: string
}

// TABLE: tasks_pool
export interface Task {
  id: string
  sphere: Sphere
  type: TaskType
  title: string
  description: string
  xp_full: number
  xp_simplified: number
  xp_minimum: number
  simplified_title: string
  simplified_desc: string
  minimum_title: string
  minimum_desc: string
  pace: Pace[]
  day_of_week: number[] | null
}

// TABLE: daily_missions
export interface DailyMission {
  id: string
  user_id: string
  task_id: string
  sphere: Sphere
  type: TaskType
  date: string
  completion: Completion
  xp_earned: number
  completed_at: string | null
  // joined
  task?: Task
}

// TABLE: daily_log
export interface DailyLog {
  id: string
  user_id: string
  date: string
  result: DayResult
  missions_total: number
  missions_done: number
  xp_earned: number
}

// TABLE: user_goals
export interface UserGoal {
  id: string
  user_id: string
  title: string
  status: GoalStatus
  created_at: string
  completed_at: string | null
  completed_in_days: number | null
}

// TABLE: official_trials
export interface OfficialTrial {
  id: string
  user_id: string
  trial_key: string
  title: string
  status: 'active' | 'completed' | 'abandoned'
  started_at: string
  completed_at: string | null
  mode: string | null
  profile_types: string[]
  answers: Record<string, unknown>
  current_day: number
  created_at: string
  updated_at: string
}

// TABLE: official_trial_trophies
export interface OfficialTrialTrophy {
  id: string
  user_id: string
  trial_id: string
  trophy_key: string
  tier: string
  title: string
  description: string
  unlocked_at: string
  created_at: string
}

// TABLE: official_trial_daily_logs
export interface OfficialTrialDailyLog {
  id: string
  trial_id: string
  user_id: string
  log_date: string
  day_number: number
  mission_key: string
  mission_title: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// XP формула: xpForLevel(N) = Math.round(80 * N^1.6)
// ============================================================
export function xpForLevel(level: number): number {
  return Math.round(80 * Math.pow(level, 1.6))
}

// XP нужно для перехода на следующий уровень
export function xpToNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1)
}

// Прогресс внутри текущего уровня (0–1)
export function levelProgress(totalXp: number, currentLevel: number): number {
  const xpCurrentLevel = xpForLevel(currentLevel)
  const xpNext = xpForLevel(currentLevel + 1)
  const range = xpNext - xpCurrentLevel
  const earned = totalXp - xpCurrentLevel
  return Math.max(0, Math.min(1, earned / range))
}

// Sphere label на русском
export const SPHERE_LABELS: Record<Sphere, string> = {
  body: 'Тело',
  mind: 'Разум',
  discipline: 'Дисциплина',
  social: 'Социум',
  awareness: 'Осознанность',
  challenge: 'Вызов',
}

// Sphere emoji
export const SPHERE_EMOJI: Record<Sphere, string> = {
  body: '💪',
  mind: '🧠',
  discipline: '⚡',
  social: '🤝',
  awareness: '🌿',
  challenge: '🔥',
}
