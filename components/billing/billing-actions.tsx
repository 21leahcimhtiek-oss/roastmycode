'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface BillingActionsProps {
  planId: string
  stripePriceId: string
  hasSubscription: boolean
}

export function BillingActions({ planId, stripePriceId, hasSubscription }: BillingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout() {
    if (!stripePriceId) return
    setLoading('checkout')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: stripePriceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error ?? 'Failed to create checkout session')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error ?? 'Failed to open billing portal')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(null)
    }
  }

  if (hasSubscription) {
    return (
      <Button
        variant="outline"
        onClick={handlePortal}
        loading={loading === 'portal'}
        className="gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Manage Billing
        <ExternalLink className="h-3 w-3" />
      </Button>
    )
  }

  return (
    <Button
      variant="brand"
      size="lg"
      onClick={handleCheckout}
      loading={loading === 'checkout'}
      disabled={!stripePriceId}
      className="w-full"
    >
      Upgrade to {planId.charAt(0).toUpperCase() + planId.slice(1)}
    </Button>
  )
}