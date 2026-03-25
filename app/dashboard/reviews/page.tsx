'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { FileCode2, Search, Trash2, RefreshCw, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReviewCard } from '@/components/review/review-card'
import { NewReviewModal } from '@/components/review/new-review-modal'
import { Header } from '@/components/layout/header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LANGUAGE_CONFIG } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { CodeReview, Language, User } from '@/types'
import toast from 'react-hot-toast'

const LANGUAGES = ['all', ...Object.keys(LANGUAGE_CONFIG)] as const

export default function ReviewsPage() {
  const supabase = createClient()

  const [user,     setUser]     = useState<User | null>(null)
  const [reviews,  setReviews]  = useState<CodeReview[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [langFilter, setLangFilter] = useState<string>('all')
  const [modalOpen,  setModalOpen]  = useState(false)

  const fetchUser = useCallback(async () => {
    const { data: { user: auth } } = await supabase.auth.getUser()
    if (!auth) return
    const { data } = await supabase.from('users').select('*').eq('id', auth.id).single()
    if (data) setUser(data as User)
  }, [supabase])

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    const { data: { user: auth } } = await supabase.auth.getUser()
    if (!auth) return

    let query = supabase
      .from('reviews')
      .select('*')
      .eq('user_id', auth.id)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })

    if (langFilter !== 'all') query = query.eq('language', langFilter)

    const { data, error } = await query
    if (error) toast.error('Failed to load reviews')
    else setReviews((data ?? []) as CodeReview[])
    setLoading(false)
  }, [supabase, langFilter])

  useEffect(() => {
    fetchUser()
    fetchReviews()
  }, [fetchUser, fetchReviews])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/review/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setReviews(prev => prev.filter(r => r.id !== id))
      toast.success('Review deleted')
    } else {
      toast.error('Failed to delete review')
    }
  }

  function handleReviewComplete(review: CodeReview) {
    setReviews(prev => [review, ...prev])
    if (user) setUser(u => u ? { ...u, reviews_used_this_month: u.reviews_used_this_month + 1 } : u)
  }

  const filtered = reviews.filter(r =>
    search === '' || r.title.toLowerCase().includes(search.toLowerCase())
  )

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <>
      <Header
        user={user}
        onNewReview={() => setModalOpen(true)}
      />

      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Reviews</h1>
            <p className="text-muted-foreground mt-1">{reviews.length} total reviews</p>
          </div>
          <Button variant="brand" onClick={() => setModalOpen(true)} className="gap-2">
            <Flame className="h-4 w-4" />
            Roast New Code
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select value={langFilter} onValueChange={setLangFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {Object.entries(LANGUAGE_CONFIG).map(([id, cfg]) => (
                <SelectItem key={id} value={id}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reviews grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand">
              <FileCode2 className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {reviews.length === 0 ? 'No reviews yet' : 'No matching reviews'}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {reviews.length === 0
                  ? 'Submit your first code for a brutal AI review'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
            {reviews.length === 0 && (
              <Button variant="fire" onClick={() => setModalOpen(true)} className="gap-2">
                <Flame className="h-4 w-4" />
                Get Your Code Roasted 🔥
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
            {filtered.map(review => (
              <ReviewCard key={review.id} review={review} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <NewReviewModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          plan={user.plan}
          reviewsUsed={user.reviews_used_this_month ?? 0}
          reviewsLimit={user.reviews_limit ?? 3}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </>
  )
}