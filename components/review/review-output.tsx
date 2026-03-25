'use client'

import { useState } from 'react'
import {
  AlertTriangle, Shield, Zap, Lightbulb, Code2,
  ChevronDown, ChevronUp, ExternalLink, CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScoreCircle } from '@/components/review/score-circle'
import { CodeEditor } from '@/components/review/code-editor'
import { SEVERITY_CONFIG } from '@/lib/utils'
import type { CodeReview } from '@/types'

interface ReviewOutputProps {
  review: CodeReview
}

export function ReviewOutput({ review }: ReviewOutputProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)

  const issuesBySeverity = [...review.issues].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return order[a.severity] - order[b.severity]
  })

  const criticalCount = review.issues.filter(i => i.severity === 'critical').length
  const highCount     = review.issues.filter(i => i.severity === 'high').length
  const securityCount = review.security_findings.length

  return (
    <div className="space-y-6">
      {/* Score header */}
      <div className="flex items-start gap-6 rounded-xl border bg-card p-6">
        <ScoreCircle score={review.overall_score ?? 0} size="lg" />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold mb-2">{review.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">{review.summary}</p>
          <div className="flex flex-wrap gap-2">
            {criticalCount > 0 && (
              <Badge variant="critical">{criticalCount} Critical</Badge>
            )}
            {highCount > 0 && (
              <Badge variant="high">{highCount} High</Badge>
            )}
            {securityCount > 0 && (
              <Badge variant="destructive">
                <Shield className="h-3 w-3" />
                {securityCount} Security
              </Badge>
            )}
            {review.performance_notes.length > 0 && (
              <Badge variant="warning">
                <Zap className="h-3 w-3" />
                {review.performance_notes.length} Performance
              </Badge>
            )}
            <Badge variant="secondary" className="ml-auto">
              {review.lines_of_code} lines · {review.model_used.split('/')[1] ?? review.model_used}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="issues">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="issues" className="gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Issues ({review.issues.length})
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-4 w-4" />
            Security ({review.security_findings.length})
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5">
            <Zap className="h-4 w-4" />
            Performance ({review.performance_notes.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-1.5">
            <Lightbulb className="h-4 w-4" />
            Suggestions ({review.suggestions.length})
          </TabsTrigger>
          {review.refactored_code && (
            <TabsTrigger value="refactored" className="gap-1.5">
              <Code2 className="h-4 w-4" />
              Refactored
            </TabsTrigger>
          )}
        </TabsList>

        {/* Issues */}
        <TabsContent value="issues" className="space-y-2 mt-4">
          {issuesBySeverity.length === 0 ? (
            <EmptyState icon={CheckCircle2} message="No issues found — clean code!" color="text-green-500" />
          ) : (
            issuesBySeverity.map(issue => {
              const cfg = SEVERITY_CONFIG[issue.severity]
              const expanded = expandedIssue === issue.id
              return (
                <div key={issue.id} className="rounded-lg border bg-card overflow-hidden">
                  <button
                    className="flex w-full items-start gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                    onClick={() => setExpandedIssue(expanded ? null : issue.id)}
                  >
                    <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot} ${issue.severity === 'critical' ? 'severity-critical-dot' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={issue.severity} className="capitalize">{cfg.label}</Badge>
                        <span className="text-xs text-muted-foreground capitalize">{issue.category}</span>
                        {issue.line_start && (
                          <span className="text-xs font-mono text-muted-foreground">
                            L{issue.line_start}{issue.line_end && issue.line_end !== issue.line_start ? `–${issue.line_end}` : ''}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium">{issue.description}</p>
                    </div>
                    {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
                  </button>
                  {expanded && issue.fix && (
                    <div className="border-t bg-muted/30 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Fix</p>
                      <p className="text-sm text-foreground">{issue.fix}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-3 mt-4">
          {review.security_findings.length === 0 ? (
            <EmptyState icon={Shield} message="No security vulnerabilities detected." color="text-green-500" />
          ) : (
            review.security_findings.map(finding => {
              const cfg = SEVERITY_CONFIG[finding.severity]
              return (
                <div key={finding.id} className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant={finding.severity}>{cfg.label}</Badge>
                        {finding.cwe_id && (
                          <a
                            href={`https://cwe.mitre.org/data/definitions/${finding.cwe_id.replace('CWE-', '')}.html`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-0.5 text-xs font-mono text-primary hover:underline"
                          >
                            {finding.cwe_id} <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {finding.line && (
                          <span className="text-xs font-mono text-muted-foreground">L{finding.line}</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm">{finding.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{finding.description}</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Remediation</p>
                    <p className="text-sm">{finding.remediation}</p>
                  </div>
                </div>
              )
            })
          )}
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-3 mt-4">
          {review.performance_notes.length === 0 ? (
            <EmptyState icon={Zap} message="No performance issues detected." color="text-green-500" />
          ) : (
            review.performance_notes.map(note => (
              <div key={note.id} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={note.impact === 'high' ? 'high' : note.impact === 'medium' ? 'medium' : 'low'} className="capitalize">
                    {note.impact} impact
                  </Badge>
                  <h4 className="font-semibold text-sm">{note.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{note.description}</p>
                {note.fix && (
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Optimization</p>
                    <p className="text-sm">{note.fix}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* Suggestions */}
        <TabsContent value="suggestions" className="space-y-3 mt-4">
          {review.suggestions.length === 0 ? (
            <EmptyState icon={Lightbulb} message="No additional suggestions." color="text-muted-foreground" />
          ) : (
            review.suggestions
              .sort((a, b) => {
                const order = { must: 0, should: 1, could: 2 }
                return order[a.priority] - order[b.priority]
              })
              .map(sug => (
                <div key={sug.id} className="rounded-lg border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={sug.priority === 'must' ? 'destructive' : sug.priority === 'should' ? 'warning' : 'secondary'}
                      className="capitalize"
                    >
                      {sug.priority}
                    </Badge>
                    <Badge variant="outline" className="capitalize">{sug.type}</Badge>
                    <h4 className="font-semibold text-sm">{sug.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{sug.description}</p>
                  {sug.code_example && (
                    <pre className="mt-2 rounded-lg bg-slate-900 p-3 text-xs text-slate-100 overflow-x-auto scrollbar-thin font-mono">
                      {sug.code_example}
                    </pre>
                  )}
                </div>
              ))
          )}
        </TabsContent>

        {/* Refactored code */}
        {review.refactored_code && (
          <TabsContent value="refactored" className="mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">AI-refactored version with all fixes applied</p>
                <button
                  onClick={() => navigator.clipboard.writeText(review.refactored_code!)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Copy code
                </button>
              </div>
              <CodeEditor
                value={review.refactored_code}
                onChange={() => {}}
                language={review.language}
                readOnly
                minHeight="400px"
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  message,
  color,
}: {
  icon: React.FC<{ className?: string }>
  message: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className={`h-8 w-8 ${color}`} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}