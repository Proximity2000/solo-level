'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// ============================================================
// Вход по Magic Link (email → ссылка на почту)
// ============================================================
export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string

  if (!email?.trim()) {
    return { error: 'Введи email' }
  }

  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// ============================================================
// Регистрация по email + password
// ============================================================
export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email?.trim() || !password?.trim()) {
    return { error: 'Заполни все поля' }
  }

  if (password.length < 6) {
    return { error: 'Пароль — минимум 6 символов' }
  }

  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Email confirmation disabled → session is created immediately → redirect
  if (data.session) {
    redirect('/onboarding/welcome')
  }

  // Email confirmation required → tell user to check inbox
  return { success: true }
}

// ============================================================
// Вход по email + password
// ============================================================
export async function signInWithPassword(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email?.trim() || !password?.trim()) {
    return { error: 'Заполни все поля' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) {
    return { error: 'Неверный email или пароль' }
  }

  // Проверяем onboarding
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Ошибка авторизации' }

  const { data: userData } = await supabase
    .from('users')
    .select('onboarding_done')
    .eq('id', user.id)
    .single()

  if (userData?.onboarding_done) {
    redirect('/today')
  } else {
    redirect('/onboarding/welcome')
  }
}
