import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Если есть next (например, /auth/reset-password после recovery) — редиректим туда
      const next = searchParams.get('next')
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Проверяем onboarding_done → редирект
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_done')
          .eq('id', user.id)
          .single()

        if (userData?.onboarding_done) {
          return NextResponse.redirect(`${origin}/today`)
        } else {
          return NextResponse.redirect(`${origin}/onboarding/welcome`)
        }
      }
    }
  }

  // Что-то пошло не так — возвращаем на /auth с ошибкой
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
