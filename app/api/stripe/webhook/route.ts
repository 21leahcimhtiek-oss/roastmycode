import { stripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const PLAN_MAP: Record<string, { plan: string; reviews_limit: number }> = {
  [process.env.STRIPE_PRO_PRICE_ID  ?? 'pro_price']:  { plan: 'pro',  reviews_limit: 100 },
  [process.env.STRIPE_TEAM_PRICE_ID ?? 'team_price']: { plan: 'team', reviews_limit: -1  },
}

export async function POST(request: Request) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const uid     = (session as any).subscription_data?.metadata?.supabase_uid
                   ?? session.metadata?.supabase_uid
      if (!uid) break

      // Get subscription to determine plan
      const subId = session.subscription as string
      if (subId) {
        const sub      = await stripe.subscriptions.retrieve(subId)
        const priceId  = sub.items.data[0]?.price.id
        const planInfo = PLAN_MAP[priceId ?? '']
        if (planInfo) {
          await supabase.from('users').update({
            plan:                   planInfo.plan,
            reviews_limit:          planInfo.reviews_limit,
            stripe_subscription_id: subId,
          }).eq('id', uid)
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub     = event.data.object as Stripe.Subscription
      const uid     = sub.metadata?.supabase_uid
      if (!uid) break

      const priceId  = sub.items.data[0]?.price.id
      const planInfo = PLAN_MAP[priceId ?? '']

      if (sub.status === 'active' && planInfo) {
        await supabase.from('users').update({
          plan:                   planInfo.plan,
          reviews_limit:          planInfo.reviews_limit,
          stripe_subscription_id: sub.id,
        }).eq('id', uid)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const uid = sub.metadata?.supabase_uid
      if (!uid) break

      await supabase.from('users').update({
        plan:                   'free',
        reviews_limit:          3,
        stripe_subscription_id: null,
      }).eq('id', uid)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const uid     = (invoice as any).subscription_details?.metadata?.supabase_uid
      if (uid) {
        // Could send email notification here
        console.warn(`Payment failed for user ${uid}`)
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}