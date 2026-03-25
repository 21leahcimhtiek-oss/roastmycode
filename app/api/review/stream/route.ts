import { createClient } from '@/lib/supabase/server'
import { streamReview } from '@/lib/openrouter/client'
import { PLAN_LIMITS } from '@/lib/utils'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const bodySchema = z.object({
  code:     z.string().min(10).max(100000),
  language: z.string(),
  model:    z.string(),
  title:    z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('plan, reviews_used_this_month, reviews_limit')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const plan        = (profile.plan ?? 'free') as 'free' | 'pro' | 'team'
  const used        = profile.reviews_used_this_month ?? 0
  const limit       = profile.reviews_limit ?? 3
  const maxLines    = PLAN_LIMITS[plan].lines

  // Check review limit
  if (limit !== -1 && used >= limit) {
    return NextResponse.json({ error: 'Monthly review limit reached. Please upgrade.' }, { status: 429 })
  }

  const body = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { code, language, model, title } = parsed.data
  const lineCount = code.split('\n').length

  if (lineCount > maxLines) {
    return NextResponse.json(
      { error: `Code exceeds ${maxLines} line limit for your plan.` },
      { status: 400 }
    )
  }

  // Create review record in DB (pending)
  const { data: review, error: insertErr } = await supabase
    .from('reviews')
    .insert({
      user_id:      user.id,
      title:        title ?? `${language} Review`,
      language,
      original_code: code,
      status:       'processing',
      model_used:   model,
      lines_of_code: lineCount,
    })
    .select()
    .single()

  if (insertErr || !review) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }

  // Increment usage count
  await supabase.rpc('increment_review_usage', { p_user_id: user.id })

  // Stream response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      let fullText = ''
      let tokensUsed = 0

      try {
        await streamReview(
          code,
          language,
          model,
          (chunk) => {
            fullText += chunk
            send({ type: 'chunk', content: chunk })
          },
          async (complete) => {
            // Parse the JSON response
            let parsed: any = {}
            try {
              // Strip potential markdown fences
              const clean = complete.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
              parsed = JSON.parse(clean)
            } catch {
              parsed = {
                overall_score: 50,
                summary: 'Review completed but output could not be fully parsed.',
                refactored_code: null,
                issues: [],
                suggestions: [],
                security_findings: [],
                performance_notes: [],
              }
            }

            tokensUsed = Math.ceil(complete.length / 4)

            // Update review record with results
            const { data: updated } = await supabase
              .from('reviews')
              .update({
                status:            'complete',
                overall_score:     parsed.overall_score ?? 0,
                summary:           parsed.summary ?? '',
                refactored_code:   parsed.refactored_code ?? null,
                issues:            parsed.issues ?? [],
                suggestions:       parsed.suggestions ?? [],
                security_findings: parsed.security_findings ?? [],
                performance_notes: parsed.performance_notes ?? [],
                tokens_used:       tokensUsed,
              })
              .eq('id', review.id)
              .select()
              .single()

            send({ type: 'complete', review: updated ?? { ...review, ...parsed, status: 'complete' } })
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          },
          async (err) => {
            // Mark review as failed
            await supabase.from('reviews').update({ status: 'failed' }).eq('id', review.id)
            send({ type: 'error', error: err.message })
            controller.close()
          },
        )
      } catch (err: any) {
        send({ type: 'error', error: err.message ?? 'Stream failed' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}