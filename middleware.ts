import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip auth check if env vars not set (build time)
  if (!supabaseUrl || !supabaseKey) return res

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) { return req.cookies.get(name)?.value },
      set(name, value, options) { res.cookies.set({ name, value, ...options }) },
      remove(name, options) { res.cookies.set({ name, value: '', ...options }) },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isAuthPage  = req.nextUrl.pathname.startsWith('/login')

  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}