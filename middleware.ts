import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const protectedPaths = ['/today', '/path', '/legend', '/profile', '/onboarding']
  const appPaths = ['/today', '/path', '/legend', '/profile']

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isAppPath = appPaths.some((p) => pathname.startsWith(p))

  // 1. Не авторизован → /auth
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // 2. Авторизован на /auth или на страницах приложения → проверяем onboarding_done
  if (user && (pathname === '/auth' || isAppPath)) {
    const { data: userData } = await supabase
      .from('users')
      .select('onboarding_done')
      .eq('id', user.id)
      .single()

    if (pathname === '/auth') {
      const url = request.nextUrl.clone()
      url.pathname = userData?.onboarding_done ? '/today' : '/onboarding/welcome'
      return NextResponse.redirect(url)
    }

    // На страницах приложения: если онбординг не завершён → /onboarding/welcome
    if (!userData?.onboarding_done) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding/welcome'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
