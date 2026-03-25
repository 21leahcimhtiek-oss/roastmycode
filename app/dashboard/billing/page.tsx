export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Check, Crown, Zap, Building2, CreditCard, AlertCircle } from 'lucide-react'
import { PRICING_PLANS } from '@/lib/stripe/config'
import { BillingActions } from '@/components/billing/billing-actions'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('plan, stripe_subscription_id, reviews_used_this_month, reviews_limit')
    .eq('id', user.id)
    .single()

  const currentPlan = profile?.plan ?? 'free'
  const hasSubscription = !!profile?.stripe_subscription_id
  const used  = profile?.reviews_used_this_month ?? 0
  const limit = profile?.reviews_limit ?? 3
  const pct   = limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100))

  const planIcons: Record<string, React.ReactNode> = {
    free: <Zap className="h-5 w-5" />,
    pro:  <Crown className="h-5 w-5" />,
    team: <Building2 className="h-5 w-5" />,
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and usage</p>
      </div>

      {/* Current usage */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Current Plan</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="brand" className="capitalize gap-1">
                {planIcons[currentPlan]}
                {currentPlan}
              </Badge>
              {hasSubscription && (
                <Badge variant="success">Active subscription</Badge>
              )}
            </div>
          </div>
          {hasSubscription && (
            <BillingActions
              planId={currentPlan}
              stripePriceId=""
              hasSubscription={true}
            />
          )}
        </div>

        {/* Usage bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reviews this month</span>
            <span className="font-medium">
              {used} / {limit === -1 ? '∞' : limit}
            </span>
          </div>
          {limit !== -1 && (
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : 'bg-brand-500',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
          {pct >= 80 && limit !== -1 && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Approaching monthly limit — upgrade to avoid interruption
            </div>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {PRICING_PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan
          return (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-xl border bg-card p-6 space-y-5 transition-shadow',
                plan.popular && 'border-brand-400 shadow-brand-100 shadow-md',
                isCurrent && 'ring-2 ring-brand-500',
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full gradient-brand px-3 py-1 text-xs font-bold text-white">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                    Current
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-brand-500">{planIcons[plan.id]}</span>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground text-sm mb-1">/month</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.reviews_per_month === -1
                    ? 'Unlimited reviews'
                    : `${plan.reviews_per_month} reviews / month`}
                </p>
              </div>

              <ul className="space-y-2">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div>
                {isCurrent ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-muted py-2.5 text-sm font-medium text-muted-foreground">
                    <Check className="h-4 w-4" /> Current Plan
                  </div>
                ) : plan.price === 0 ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-muted py-2.5 text-sm font-medium text-muted-foreground">
                    Free Forever
                  </div>
                ) : (
                  <BillingActions
                    planId={plan.id}
                    stripePriceId={plan.stripe_price_id}
                    hasSubscription={false}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
        <h2 className="font-semibold">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {[
            ['Can I cancel anytime?', 'Yes. Cancel from the billing portal and you retain access until end of billing period.'],
            ['What counts as a review?', 'Each code submission = 1 review. Counts reset on the 1st of each month.'],
            ['What models are available?', 'Free: GPT-4o Mini. Pro: GPT-4o + Claude 3.5 Sonnet. Team: All models including Claude 3 Opus.'],
            ['Is there an API?', 'Yes, Team plan includes API access. Contact us for details.'],
          ].map(([q, a]) => (
            <div key={q}>
              <p className="font-medium mb-1">{q}</p>
              <p className="text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}