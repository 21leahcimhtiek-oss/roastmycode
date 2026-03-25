import type { PricingPlan } from '@/types'

export const PLAN_LIMITS = {
  free: {
    reviews_per_month: 3,
    max_lines: 150,
    models: ['openai/gpt-4o-mini'],
  },
  pro: {
    reviews_per_month: 100,
    max_lines: 1000,
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini'],
  },
  team: {
    reviews_per_month: -1,
    max_lines: 5000,
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'anthropic/claude-3-opus', 'openai/gpt-4o-mini'],
  },
} as const

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    reviews_per_month: 3,
    max_lines_per_review: 150,
    models: ['GPT-4o Mini'],
    stripe_price_id: '',
    features: [
      '3 reviews / month',
      'Up to 150 lines of code',
      'Basic issue detection',
      'GPT-4o Mini model',
      '7-day review history',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15,
    reviews_per_month: 100,
    max_lines_per_review: 1000,
    models: ['GPT-4o', 'Claude 3.5 Sonnet', 'GPT-4o Mini'],
    stripe_price_id: process.env.STRIPE_PRO_PRICE_ID ?? '',
    popular: true,
    features: [
      '100 reviews / month',
      'Up to 1,000 lines of code',
      'Deep security audit (CWE)',
      'Refactored code output',
      'Performance analysis',
      'GPT-4o + Claude 3.5 Sonnet',
      'Unlimited history',
      'CSV export',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    price: 49,
    reviews_per_month: -1,
    max_lines_per_review: 5000,
    models: ['GPT-4o', 'Claude 3.5 Sonnet', 'Claude 3 Opus', 'GPT-4o Mini'],
    stripe_price_id: process.env.STRIPE_TEAM_PRICE_ID ?? '',
    features: [
      'Unlimited reviews',
      'Up to 5,000 lines of code',
      'All Pro features',
      'Claude 3 Opus model',
      'Team analytics dashboard',
      'Priority support',
      'API access',
      'Custom review templates',
    ],
  },
]