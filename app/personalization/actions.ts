'use server'

import { createClient } from '@/lib/supabase/server'

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
