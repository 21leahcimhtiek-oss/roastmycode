'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, Plus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@/types'

interface HeaderProps {
  user: User
  onNewReview?: () => void
}

export function Header({ user, onNewReview }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-brand-500" />
        <span className="text-sm text-muted-foreground">
          {user.plan === 'free'
            ? `${user.reviews_used_this_month ?? 0} / ${user.reviews_limit ?? 3} reviews used`
            : user.plan === 'team'
            ? 'Unlimited reviews'
            : `${user.reviews_used_this_month ?? 0} / ${user.reviews_limit ?? 100} reviews used`
          }
        </span>
      </div>
      <div className="flex items-center gap-3">
        {user.plan === 'free' && (
          <button
            onClick={() => router.push('/dashboard/billing')}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
          >
            <Zap className="h-3 w-3" />
            Upgrade — $15/mo
          </button>
        )}
        <Button variant="brand" size="sm" onClick={onNewReview} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Review
        </Button>
      </div>
    </header>
  )
}