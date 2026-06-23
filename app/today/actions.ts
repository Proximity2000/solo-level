'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type CompleteTrialMissionResult =
  | { success: true }
  | { alreadyCompleted: true }
  | { error: string }

export async function completeTrialMission(): Promise<CompleteTrialMissionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const today = new Date().toISOString().split('T')[0]

  // Find the active smoking trial for this user
  const { data: trial } = await supabase
    .from('official_trials')
    .select('id, current_day')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('trial_key', 'smoking')
    .maybeSingle()

  if (!trial) {
    return { error: 'Активное испытание не найдено.' }
  }

  // Check if already completed today — return early, not an error
  const { data: existing } = await supabase
    .from('official_trial_daily_logs')
    .select('id, completed_at')
    .eq('trial_id', trial.id)
    .eq('log_date', today)
    .maybeSingle()

  if (existing?.completed_at) {
    return { alreadyCompleted: true }
  }

  // Upsert: safe if the row already exists but completed_at is null
  const { error } = await supabase
    .from('official_trial_daily_logs')
    .upsert(
      {
        trial_id:      trial.id,
        user_id:       user.id,
        log_date:      today,
        day_number:    trial.current_day,
        mission_key:   'smoking_day_1_observation',
        mission_title: 'Разведка привычки',
        completed_at:  new Date().toISOString(),
      },
      { onConflict: 'trial_id,log_date' }
    )

  if (error) {
    return { error: 'Не удалось сохранить. Попробуй ещё раз.' }
  }

  return { success: true }
}
