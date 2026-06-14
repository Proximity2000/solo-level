'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Pace, Sphere } from '@/lib/types'

// ============================================================
// Сохранить survey: pace → users, goal → user_goals
// ============================================================
export async function saveSurvey(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const pace = formData.get('pace') as Pace
  const goal = formData.get('goal') as string | null
  const spheresRaw = formData.get('spheres') as string | null
  const spheres: Sphere[] = spheresRaw ? JSON.parse(spheresRaw) : []

  if (!pace) return { error: 'Выбери темп' }

  // Сохраняем pace и preferred_spheres в users
  const { error: userError } = await supabase
    .from('users')
    .update({ pace, preferred_spheres: spheres })
    .eq('id', user.id)

  if (userError) return { error: userError.message }

  // Если выбрана цель — сохраняем в user_goals
  if (goal && goal !== 'skip') {
    await supabase.from('user_goals').insert({
      user_id: user.id,
      title: goal,
      status: 'active',
    })
  }

  redirect('/onboarding/diagnostic')
}

// ============================================================
// Сохранить диагностику → user_snapshot
// ============================================================
export async function saveDiagnostic(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const age = formData.get('age') ? Number(formData.get('age')) : null
  const height_cm = formData.get('height_cm') ? Number(formData.get('height_cm')) : null
  const weight_kg = formData.get('weight_kg') ? Number(formData.get('weight_kg')) : null
  const activity_level = (formData.get('activity_level') as string) || null
  const reading_level = (formData.get('reading_level') as string) || null
  const discipline_score = formData.get('discipline_score')
    ? Number(formData.get('discipline_score'))
    : null
  const goal_3months = (formData.get('goal_3months') as string) || null

  const returnTo = (formData.get('returnTo') as string) || null

  const { error } = await supabase.from('user_snapshot').upsert({
    user_id: user.id,
    age,
    height_cm,
    weight_kg,
    activity_level,
    reading_level,
    discipline_score,
    goal_3months,
    snapshot_date: new Date().toISOString().split('T')[0],
  }, { onConflict: 'user_id' })

  if (error) return { error: error.message }

  redirect(returnTo ?? '/onboarding/first-mission')
}

// ============================================================
// Завершить онбординг → onboarding_done = true → /today
// ============================================================
export async function completeOnboarding() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  await supabase
    .from('users')
    .update({ onboarding_done: true })
    .eq('id', user!.id)

  redirect('/today')
}
