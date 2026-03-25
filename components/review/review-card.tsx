'use client'

import Link from 'next/link'
import { formatRelativeTime, scoreColor, scoreLabel, LANGUAGE_CONFIG, SEVERITY_CONFIG } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScoreCircle } from '@/components/review/score-circle'
import { Shield, AlertTriangle, Zap, Trash2, Eye } from 'lucide-react'
import type { CodeReview } from '@/types'

interface ReviewCardProps {
  review: CodeReview
  onDelete?: (id: string) => void
}

export function ReviewCard({ review, onDelete }: ReviewCardProps) {
  const langCfg    = LANGUAGE_CONFIG[review.language]
  const critCount  = review.issues.filter(i => i.severity === 'critical').length
  const highCount  = review.issues.filter(i => i.severity === 'high').length
  const secCount   = review.security_findings.length

  return (
    <div className="group rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* Score */}
        <div className="flex-shrink-0">
          <ScoreCircle score={review.overall_score ?? 0} size="sm" showLabel={false} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sm truncate">{review.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(review.created_at)}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href={`/dashboard/reviews/${review.id}`}
                className="invisible group-hover:visible rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="View review"
              >
                <Eye className="h-4 w-4" />
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(review.id)}
                  className="invisible group-hover:visible rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Delete review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={langCfg.color + ' border-0 text-xs'}>
              {langCfg.label}
            </Badge>
            {critCount > 0 && (
              <Badge variant="critical" className="text-xs gap-1">
                <AlertTriangle className="h-3 w-3" />
                {critCount} critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge variant="high" className="text-xs">{highCount} high</Badge>
            )}
            {secCount > 0 && (
              <Badge variant="destructive" className="text-xs gap-1">
                <Shield className="h-3 w-3" />
                {secCount} security
              </Badge>
            )}
            {review.performance_notes.length > 0 && (
              <Badge variant="warning" className="text-xs gap-1">
                <Zap className="h-3 w-3" />
                {review.performance_notes.length} perf
              </Badge>
            )}
          </div>

          {/* Summary snippet */}
          {review.summary && (
            <p className="text-xs text-muted-foreground line-clamp-2">{review.summary}</p>
          )}
        </div>
      </div>
    </div>
  )
}