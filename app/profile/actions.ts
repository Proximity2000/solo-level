'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}

export async function saveWorkloadMode(
  dailyMinutes: number
): Promise<{ error?: string; success?: boolean }> {
  const allowed = [15, 30, 60]
  if (!allowed.includes(dailyMinutes)) return { error: 'Недопустимое значение' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const { error } = await supabase
    .from('users')
    .update({ daily_minutes: dailyMinutes })
    .eq('id', user.id)

  if (error) return { error: 'Не удалось сохранить' }
  return { success: true }
}
