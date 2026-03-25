import { createClient } from '@/lib/supabase/server'
import { runReview } from '@/lib/openrouter/client'
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

  const plan     = (profile.plan ?? 'free') as 'free' | 'pro' | 'team'
  const used     = profile.reviews_used_this_month ?? 0
  const limit    = profile.reviews_limit ?? 3
  const maxLines = PLAN_LIMITS[plan].lines

  if (limit !== -1 && used >= limit) {
    return NextResponse.json({ error: 'Monthly review limit reached.' }, { status: 429 })
  }

  const body   = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { code, language, model, title } = parsed.data
  const lineCount = code.split('\n').length
  if (lineCount > maxLines) {
    return NextResponse.json({ error: `Code exceeds ${maxLines} line limit.` }, { status: 400 })
  }

  const { data: review, error: insertErr } = await supabase
    .from('reviews')
    .insert({
      user_id:       user.id,
      title:         title ?? `${language} Review`,
      language,
      original_code: code,
      status:        'processing',
      model_used:    model,
      lines_of_code: lineCount,
    })
    .select()
    .single()

  if (insertErr || !review) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }

  await supabase.rpc('increment_review_usage', { p_user_id: user.id })

  try {
    const rawOutput = await runReview(code, language, model)
    const clean     = rawOutput.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    let output: any = {}
    try { output = JSON.parse(clean) } catch { output = {} }

    const tokensUsed = Math.ceil(rawOutput.length / 4)

    const { data: updated } = await supabase
      .from('reviews')
      .update({
        status:            'complete',
        overall_score:     output.overall_score ?? 0,
        summary:           output.summary ?? '',
        refactored_code:   output.refactored_code ?? null,
        issues:            output.issues ?? [],
        suggestions:       output.suggestions ?? [],
        security_findings: output.security_findings ?? [],
        performance_notes: output.performance_notes ?? [],
        tokens_used:       tokensUsed,
      })
      .eq('id', review.id)
      .select()
      .single()

    return NextResponse.json(updated)
  } catch (err: any) {
    await supabase.from('reviews').update({ status: 'failed' }).eq('id', review.id)
    return NextResponse.json({ error: err.message ?? 'Review failed' }, { status: 500 })
  }
}