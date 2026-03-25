export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewOutput } from '@/components/review/review-output'
import Link from 'next/link'
import { ArrowLeft, Clock, Code2 } from 'lucide-react'
import { formatDate, LANGUAGE_CONFIG } from '@/lib/utils'
import type { CodeReview } from '@/types'

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: review, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !review) notFound()

  const langCfg = LANGUAGE_CONFIG[review.language as keyof typeof LANGUAGE_CONFIG]

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back nav */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/reviews"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Reviews
        </Link>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {langCfg && (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${langCfg.color}`}>
            {langCfg.label}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatDate(review.created_at)}
        </span>
        <span className="flex items-center gap-1">
          <Code2 className="h-3.5 w-3.5" />
          {review.lines_of_code} lines
        </span>
        <span className="ml-auto text-xs">
          Model: {review.model_used.split('/')[1] ?? review.model_used}
        </span>
      </div>

      {/* Review output */}
      <ReviewOutput review={review as unknown as CodeReview} />

      {/* Original code collapsible */}
      <details className="rounded-xl border bg-card overflow-hidden">
        <summary className="cursor-pointer px-6 py-4 font-medium text-sm select-none hover:bg-accent/50 transition-colors">
          View Original Code
        </summary>
        <div className="border-t">
          <pre className="p-6 text-xs font-mono overflow-x-auto scrollbar-thin bg-slate-950 text-slate-100 whitespace-pre">
            {review.original_code}
          </pre>
        </div>
      </details>
    </div>
  )
}