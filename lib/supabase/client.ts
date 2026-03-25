import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

let _client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') return null as any
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    if (!url || !key) return null as any
    _client = createBrowserClient(url, key)
  }
  return _client
}