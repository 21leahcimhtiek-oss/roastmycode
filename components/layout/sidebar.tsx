'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Flame, LayoutDashboard, FileCode2, CreditCard,
  Settings, BarChart3, LogOut, Crown, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/reviews',  icon: FileCode2,       label: 'My Reviews' },
  { href: '/dashboard/billing',  icon: CreditCard,      label: 'Billing' },
  { href: '/dashboard/settings', icon: Settings,        label: 'Settings' },
]

interface SidebarProps { user: User }

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const used  = user.reviews_used_this_month ?? 0
  const limit = user.reviews_limit ?? 3
  const pct   = limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100))

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
          <Flame className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">RoastMyCode</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/dashboard'
            ? pathname === href
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Usage meter */}
      <div className="mx-3 mb-3 rounded-xl border bg-muted/40 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Monthly Reviews</span>
          <span className="font-semibold">
            {limit === -1 ? `${used} / ∞` : `${used} / ${limit}`}
          </span>
        </div>
        {limit !== -1 && (
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : 'bg-brand-500',
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        {user.plan === 'free' && (
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <Crown className="h-3 w-3" />
            Upgrade to Pro
          </Link>
        )}
      </div>

      {/* User info + sign out */}
      <div className="border-t p-3">
        <div className="flex items-center justify-between rounded-lg px-2 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full gradient-brand text-white text-sm font-bold">
              {(user.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.full_name ?? user.email}</p>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-brand-500" />
                <span className="text-xs text-muted-foreground capitalize">{user.plan} plan</span>
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="ml-2 flex-shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}