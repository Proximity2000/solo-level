'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type SmokingAnswers = {
  step1: string[]
  step2: string
  step2custom: string
  step3: string
  step4: string[]
  step5: string[]
  step6: string
  step7: string[]
  step8: string
  step9: string
  step10: string[]
}

export async function startSmokingTrial(input: {
  answers: SmokingAnswers
  profileTypes: string[]
  mode: string
}): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Duplicate check — only one active trial per user
  const { data: existing } = await supabase
    .from('official_trials')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) {
    return { error: 'У тебя уже есть активное испытание.' }
  }

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('official_trials').insert({
    user_id: user.id,
    trial_key: 'smoking',
    title: 'Бросить курить',
    status: 'active',
    started_at: today,
    current_day: 1,
    mode: input.mode,
    profile_types: input.profileTypes,
    answers: input.answers,
  })

  if (error) return { error: 'Не удалось сохранить испытание. Попробуй ещё раз.' }
  return { success: true }
}
