'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSmokingTrialMission, getEffectiveSmokingTrialDay } from '@/lib/smoking-trial'
import { SMOKING_WOOD_TROPHY } from '@/lib/trial-trophies'

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

  // Fetch the latest completed log to determine effective day and duplicate check
  const { data: latestLog } = await supabase
    .from('official_trial_daily_logs')
    .select('log_date, day_number, completed_at')
    .eq('trial_id', trial.id)
    .order('log_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Already completed today — idempotent early return
  if (latestLog?.log_date === today && latestLog.completed_at) {
    return { alreadyCompleted: true }
  }

  // Compute which day the user is actually completing
  const effectiveDay = getEffectiveSmokingTrialDay(trial, latestLog, today)
  const mission = getSmokingTrialMission(effectiveDay)

  // Upsert the completion row (safe on repeated submit)
  const { error: logError } = await supabase
    .from('official_trial_daily_logs')
    .upsert(
      {
        trial_id:      trial.id,
        user_id:       user.id,
        log_date:      today,
        day_number:    effectiveDay,
        mission_key:   mission.mission_key,
        mission_title: mission.title,
        completed_at:  new Date().toISOString(),
      },
      { onConflict: 'trial_id,log_date' }
    )

  if (logError) {
    return { error: 'Не удалось сохранить. Попробуй ещё раз.' }
  }

  // Sync official_trials.current_day to the just-completed effective day
  await supabase
    .from('official_trials')
    .update({ current_day: effectiveDay })
    .eq('id', trial.id)
  // Non-fatal if this update fails — log is the source of truth for progression

  // Unlock Day 7 trophy (wood tier) — safe on retry via ON CONFLICT DO NOTHING
  if (effectiveDay === 7) {
    await supabase
      .from('official_trial_trophies')
      .upsert(
        {
          user_id:     user.id,
          trial_id:    trial.id,
          trophy_key:  SMOKING_WOOD_TROPHY.trophy_key,
          tier:        SMOKING_WOOD_TROPHY.tier,
          title:       SMOKING_WOOD_TROPHY.title,
          description: SMOKING_WOOD_TROPHY.description,
        },
        { onConflict: 'trial_id,trophy_key,tier', ignoreDuplicates: true }
      )
    // Non-fatal — mission completion is already recorded above
  }

  return { success: true }
}
