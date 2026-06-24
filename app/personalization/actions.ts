'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function saveFocusSpheres(
  spheres: string[]
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const { error } = await supabase
    .from('users')
    .update({ preferred_spheres: spheres })
    .eq('id', user.id)

  if (error) return { error: 'Не удалось сохранить' }
  return { success: true }
}

// ── abandonOfficialTrial ─────────────────────────────────────

export type AbandonTrialResult =
  | { success: true }
  | { error: string }

export async function abandonOfficialTrial(): Promise<AbandonTrialResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Fetch the current active trial for this user
  const { data: trial } = await supabase
    .from('official_trials')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!trial) {
    return { error: 'Активное испытание не найдено.' }
  }

  // Mark as abandoned — touch only this row, nothing else
  const { error: updateError } = await supabase
    .from('official_trials')
    .update({
      status: 'abandoned',
      completed_at: new Date().toISOString(),
    })
    .eq('id', trial.id)
    .eq('user_id', user.id) // belt-and-suspenders safety

  if (updateError) {
    return { error: 'Не удалось завершить испытание. Попробуй ещё раз.' }
  }

  return { success: true }
}

// ── createPersonalTrial ──────────────────────────────────────

export type CreatePersonalTrialInput = {
  title:         string
  why:           string
  daily_minutes: 10 | 30 | 60
  intensity:     'soft' | 'medium' | 'focused'
}

export type CreatePersonalTrialResult =
  | { success: true }
  | { error: string }

export async function createPersonalTrial(
  input: CreatePersonalTrialInput
): Promise<CreatePersonalTrialResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Belt-and-suspenders: reject if an active personal trial already exists
  const { data: existing } = await supabase
    .from('personal_trials')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) {
    return { error: 'У тебя уже есть активное личное испытание.' }
  }

  const { error: insertError } = await supabase
    .from('personal_trials')
    .insert({
      user_id:       user.id,
      title:         input.title.trim(),
      why:           input.why.trim(),
      daily_minutes: input.daily_minutes,
      intensity:     input.intensity,
    })

  if (insertError) {
    return { error: 'Не удалось создать испытание. Попробуй ещё раз.' }
  }

  return { success: true }
}

// ── abandonPersonalTrial ─────────────────────────────────────

export type AbandonPersonalTrialResult =
  | { success: true }
  | { error: string }

export async function abandonPersonalTrial(): Promise<AbandonPersonalTrialResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: trial } = await supabase
    .from('personal_trials')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!trial) {
    return { error: 'Активное испытание не найдено.' }
  }

  const { error: updateError } = await supabase
    .from('personal_trials')
    .update({
      status:       'abandoned',
      completed_at: new Date().toISOString(),
    })
    .eq('id', trial.id)
    .eq('user_id', user.id) // belt-and-suspenders

  if (updateError) {
    return { error: 'Не удалось завершить испытание. Попробуй ещё раз.' }
  }

  return { success: true }
}
