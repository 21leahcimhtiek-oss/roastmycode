'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-primary/10 text-primary',
        secondary:   'bg-secondary text-secondary-foreground',
        outline:     'border border-input text-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        success:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        warning:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        critical:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        high:        'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        medium:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
        low:         'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        info:        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        brand:       'gradient-brand text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }