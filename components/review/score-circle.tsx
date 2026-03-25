'use client'

import { scoreColor, scoreLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ScoreCircleProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const SIZE_CONFIG = {
  sm: { r: 28, stroke: 4, viewBox: 70,  fontSize: 'text-lg',  labelSize: 'text-xs' },
  md: { r: 40, stroke: 6, viewBox: 100, fontSize: 'text-2xl', labelSize: 'text-xs' },
  lg: { r: 54, stroke: 8, viewBox: 130, fontSize: 'text-4xl', labelSize: 'text-sm' },
}

export function ScoreCircle({ score, size = 'md', showLabel = true }: ScoreCircleProps) {
  const { r, stroke, viewBox, fontSize, labelSize } = SIZE_CONFIG[size]
  const cx = viewBox / 2
  const cy = viewBox / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  const strokeColor =
    score >= 80 ? '#22c55e' :
    score >= 60 ? '#eab308' :
    score >= 40 ? '#f97316' :
                  '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={viewBox} height={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`}>
        {/* Background ring */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        {/* Score arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-circle-fill"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        {/* Score text */}
        <text
          x={cx} y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn(fontSize, 'font-bold fill-current')}
          style={{ fill: strokeColor }}
        >
          {score}
        </text>
      </svg>
      {showLabel && (
        <span className={cn(labelSize, 'font-medium text-muted-foreground')}>
          {scoreLabel(score)}
        </span>
      )}
    </div>
  )
}