export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Flame, FileCode2, AlertTriangle, Shield, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { formatRelativeTime, scoreColor, scoreLabel, LANGUAGE_CONFIG } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScoreCircle } from '@/components/review/score-circle'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // Recent reviews
  const { data: recentReviews } = await supabase
    .from('reviews')
    .select('id, title, language, overall_score, issues, security_findings, status, created_at, summary')
    .eq('user_id', authUser.id)
    .eq('status', 'complete')
    .order('created_at', { ascending: false })
    .limit(5)

  const reviews   = recentReviews ?? []
  const plan      = profile?.plan ?? 'free'
  const used      = profile?.reviews_used_this_month ?? 0
  const limit     = profile?.reviews_limit ?? 3
  const avgScore  = reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + (r.overall_score ?? 0), 0) / reviews.length)
    : 0
  const totalIssues    = reviews.reduce((s, r) => s + (Array.isArray(r.issues) ? r.issues.length : 0), 0)
  const totalSecurity  = reviews.reduce((s, r) => s + (Array.isArray(r.security_findings) ? r.security_findings.length : 0), 0)

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Your code quality overview</p>
        </div>
        <Link
          href="/dashboard/reviews"
          className="inline-flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Review
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Flame className="h-5 w-5 text-brand-500" />}
          label="Reviews This Month"
          value={`${used} / ${limit === -1 ? '∞' : limit}`}
          sub={plan === 'free' ? 'Free plan' : `${plan} plan`}
        />
        <StatCard
          icon={<FileCode2 className="h-5 w-5 text-blue-500" />}
          label="Total Reviews"
          value={String(reviews.length)}
          sub="All time"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          label="Issues Found"
          value={String(totalIssues)}
          sub="All reviews"
        />
        <StatCard
          icon={<Shield className="h-5 w-5 text-red-500" />}
          label="Security Findings"
          value={String(totalSecurity)}
          sub="All reviews"
        />
      </div>

      {/* Recent reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Reviews</h2>
          <Link
            href="/dashboard/reviews"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-muted/30 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">No reviews yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Paste your first code snippet and get brutally honest AI feedback
              </p>
            </div>
            <Link
              href="/dashboard/reviews"
              className="inline-flex items-center gap-2 rounded-lg gradient-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Flame className="h-4 w-4" />
              Get Your Code Roasted 🔥
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => {
              const langCfg = LANGUAGE_CONFIG[review.language as keyof typeof LANGUAGE_CONFIG]
              const critCount = Array.isArray(review.issues)
                ? review.issues.filter((i: any) => i.severity === 'critical').length
                : 0
              const secCount = Array.isArray(review.security_findings)
                ? review.security_findings.length
                : 0
              return (
                <Link
                  key={review.id}
                  href={`/dashboard/reviews/${review.id}`}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <ScoreCircle score={review.overall_score ?? 0} size="sm" showLabel={false} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{review.title}</span>
                      {critCount > 0 && (
                        <Badge variant="critical" className="text-xs">
                          {critCount} critical
                        </Badge>
                      )}
                      {secCount > 0 && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <Shield className="h-3 w-3" />
                          {secCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {langCfg && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${langCfg.color}`}>
                          {langCfg.label}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(review.created_at)}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Upgrade CTA for free users */}
      {plan === 'free' && (
        <div className="rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-orange-50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">🔥 Unlock Full Roasting Power</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pro gives you 100 reviews/mo, GPT-4o + Claude 3.5, security deep-dives, and full refactored code output.
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg gradient-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <TrendingUp className="h-4 w-4" />
              Upgrade — $15/mo
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-xs text-muted-foreground capitalize">{sub}</span>
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}