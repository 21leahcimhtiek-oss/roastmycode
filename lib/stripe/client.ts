import Stripe from 'stripe'

// Lazy Stripe initialization — avoids build-time throw when env vars are absent
let _stripe: Stripe | null = null

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      const key = process.env.STRIPE_SECRET_KEY
      if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
      _stripe = new Stripe(key, { apiVersion: '2023-10-16' as any })
    }
    return (_stripe as any)[prop]
  },
})