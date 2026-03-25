export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import type { User } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!profile) redirect('/login')

  const user: User = {
    id:                       profile.id,
    email:                    profile.email ?? authUser.email ?? '',
    full_name:                profile.full_name,
    avatar_url:               profile.avatar_url,
    plan:                     profile.plan ?? 'free',
    stripe_customer_id:       profile.stripe_customer_id,
    stripe_subscription_id:   profile.stripe_subscription_id,
    reviews_used_this_month:  profile.reviews_used_this_month ?? 0,
    reviews_limit:            profile.reviews_limit ?? 3,
    created_at:               profile.created_at,
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}