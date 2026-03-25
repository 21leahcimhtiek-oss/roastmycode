import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('overall_score, language, issues, security_findings, created_at')
    .eq('user_id', user.id)
    .eq('status', 'complete')
    .order('created_at', { ascending: false })

  if (!reviews) return NextResponse.json({ stats: null })

  const totalReviews = reviews.length
  const avgScore = totalReviews > 0
    ? Math.round(reviews.reduce((s, r) => s + (r.overall_score ?? 0), 0) / totalReviews)
    : 0

  const issueCount    = reviews.reduce((s, r) => s + (Array.isArray(r.issues) ? r.issues.length : 0), 0)
  const securityCount = reviews.reduce((s, r) => s + (Array.isArray(r.security_findings) ? r.security_findings.length : 0), 0)

  // Language distribution
  const langMap = new Map<string, number>()
  for (const r of reviews) {
    langMap.set(r.language, (langMap.get(r.language) ?? 0) + 1)
  }
  const languagesUsed = Array.from(langMap.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)

  // Score trend (last 10 reviews)
  const scoreTrend = reviews.slice(0, 10).reverse().map(r => ({
    date:  r.created_at,
    score: r.overall_score ?? 0,
  }))

  // Reviews this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const reviewsThisMonth = reviews.filter(
    r => new Date(r.created_at) >= startOfMonth
  ).length

  return NextResponse.json({
    stats: {
      total_reviews:     totalReviews,
      reviews_this_month: reviewsThisMonth,
      avg_score:         avgScore,
      issues_found:      issueCount,
      security_findings: securityCount,
      languages_used:    languagesUsed,
      score_trend:       scoreTrend,
    },
  })
}