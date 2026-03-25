export type PlanId = 'free' | 'pro' | 'team'

export type Language =
  | 'javascript' | 'typescript' | 'python' | 'rust'
  | 'go' | 'java' | 'cpp' | 'c' | 'csharp'
  | 'html' | 'css' | 'sql' | 'bash' | 'other'

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type ReviewStatus = 'pending' | 'processing' | 'complete' | 'failed'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: PlanId
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  reviews_used_this_month: number
  reviews_limit: number
  created_at: string
}

export interface CodeReview {
  id: string
  user_id: string
  title: string
  language: Language
  original_code: string
  refactored_code: string | null
  status: ReviewStatus
  model_used: string
  // Parsed review output
  overall_score: number          // 0-100
  summary: string | null
  issues: ReviewIssue[]
  suggestions: ReviewSuggestion[]
  security_findings: SecurityFinding[]
  performance_notes: PerformanceNote[]
  // metadata
  lines_of_code: number
  tokens_used: number
  credits_charged: number
  created_at: string
  updated_at: string
}

export interface ReviewIssue {
  id: string
  severity: SeverityLevel
  category: 'bug' | 'style' | 'logic' | 'naming' | 'complexity' | 'duplication'
  line_start: number | null
  line_end: number | null
  description: string
  fix: string | null
}

export interface ReviewSuggestion {
  id: string
  type: 'refactor' | 'pattern' | 'library' | 'architecture' | 'test'
  title: string
  description: string
  code_example: string | null
  priority: 'must' | 'should' | 'could'
}

export interface SecurityFinding {
  id: string
  severity: SeverityLevel
  cwe_id: string | null           // e.g. CWE-89 (SQL Injection)
  title: string
  description: string
  remediation: string
  line: number | null
}

export interface PerformanceNote {
  id: string
  impact: 'high' | 'medium' | 'low'
  title: string
  description: string
  fix: string | null
}

export interface PricingPlan {
  id: PlanId
  name: string
  price: number                   // monthly USD
  reviews_per_month: number       // -1 = unlimited
  max_lines_per_review: number
  models: string[]
  features: string[]
  stripe_price_id: string
  popular?: boolean
}

export interface UserStats {
  total_reviews: number
  reviews_this_month: number
  avg_score: number
  issues_found: number
  security_findings: number
  languages_used: { language: Language; count: number }[]
  score_trend: { date: string; score: number }[]
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number                  // positive = added, negative = spent
  description: string
  review_id: string | null
  created_at: string
}