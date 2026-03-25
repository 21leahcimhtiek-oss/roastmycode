'use client'

import { useState, useCallback } from 'react'
import { Flame, Wand2, AlertCircle } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CodeEditor } from '@/components/review/code-editor'
import { LANGUAGE_CONFIG, PLAN_LIMITS, countLines, canReview } from '@/lib/utils'
import { REVIEW_MODELS } from '@/lib/openrouter/client'
import type { Language, PlanId, CodeReview } from '@/types'
import toast from 'react-hot-toast'

const LANGUAGES = Object.entries(LANGUAGE_CONFIG).map(([id, cfg]) => ({
  id: id as Language,
  ...cfg,
}))

interface NewReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanId
  reviewsUsed: number
  reviewsLimit: number
  onReviewComplete: (review: CodeReview) => void
}

export function NewReviewModal({
  open,
  onOpenChange,
  plan,
  reviewsUsed,
  reviewsLimit,
  onReviewComplete,
}: NewReviewModalProps) {
  const [code, setCode]           = useState('')
  const [language, setLanguage]   = useState<Language>('typescript')
  const [model, setModel]         = useState(
    plan === 'free' ? 'openai/gpt-4o-mini' : 'openai/gpt-4o'
  )
  const [title, setTitle]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [progress, setProgress]   = useState('')
  const [streamOutput, setStreamOutput] = useState('')

  const lines     = countLines(code)
  const maxLines  = PLAN_LIMITS[plan].lines
  const overLimit = lines > maxLines
  const canRun    = canReview(plan, reviewsUsed) && !overLimit && code.trim().length > 10

  const allowedModels = REVIEW_MODELS.filter(m => {
    if (plan === 'free')  return m.plan === 'free'
    if (plan === 'pro')   return m.plan === 'free' || m.plan === 'pro'
    return true
  })

  async function handleSubmit() {
    if (!canRun) return
    setLoading(true)
    setProgress('Analyzing your code...')
    setStreamOutput('')

    try {
      const response = await fetch('/api/review/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          model,
          title: title.trim() || `${LANGUAGE_CONFIG[language].label} Review`,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'Review failed')
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      setProgress('Streaming analysis...')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'chunk') {
              fullText += parsed.content
              setStreamOutput(fullText.slice(-500)) // show tail
            } else if (parsed.type === 'complete') {
              onReviewComplete(parsed.review)
              onOpenChange(false)
              toast.success('Review complete!')
              setCode('')
              setTitle('')
              setStreamOutput('')
              return
            } else if (parsed.type === 'error') {
              throw new Error(parsed.error)
            }
          } catch (e) {
            // skip malformed chunks
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Review failed')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-brand-500" />
            Roast My Code
          </DialogTitle>
          <DialogDescription>
            Paste your code below. Our AI will give you a brutally honest, senior-engineer-level review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title input */}
          <input
            type="text"
            placeholder="Review title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {/* Language + Model selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Language</label>
              <Select value={language} onValueChange={v => setLanguage(v as Language)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedModels.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Code editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Code</label>
              <span className={`text-xs font-mono ${overLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {lines} / {maxLines} lines
              </span>
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              minHeight="280px"
              placeholder={`// Paste your ${LANGUAGE_CONFIG[language].label} code here...`}
            />
            {overLimit && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Exceeds {maxLines} line limit. {plan !== 'team' && 'Upgrade to review larger files.'}
              </p>
            )}
          </div>

          {/* Limit warning */}
          {!canReview(plan, reviewsUsed) && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 flex items-center gap-2 text-sm text-orange-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Monthly review limit reached. Upgrade to continue.
            </div>
          )}

          {/* Streaming progress */}
          {loading && streamOutput && (
            <div className="rounded-lg bg-slate-900 p-3 max-h-32 overflow-y-auto scrollbar-thin">
              <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{streamOutput}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {reviewsUsed} / {reviewsLimit === -1 ? '∞' : reviewsLimit} used
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="fire"
                onClick={handleSubmit}
                loading={loading}
                disabled={!canRun}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                {loading ? progress || 'Roasting...' : 'Roast It 🔥'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}