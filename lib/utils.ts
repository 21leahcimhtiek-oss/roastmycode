import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SeverityLevel, Language, PlanId } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)  return `${days}d ago`
  return formatDate(date)
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  if (score >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Average'
  if (score >= 20) return 'Poor'
  return 'Critical'
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
}

export const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label: 'Critical', color: 'text-red-700',    bg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',      dot: 'bg-red-500' },
  high:     { label: 'High',     color: 'text-orange-700', bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   color: 'text-yellow-700', bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300', dot: 'bg-yellow-500' },
  low:      { label: 'Low',      color: 'text-blue-700',   bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',    dot: 'bg-blue-500' },
  info:     { label: 'Info',     color: 'text-slate-600',  bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',   dot: 'bg-slate-400' },
}

export const LANGUAGE_CONFIG: Record<Language, { label: string; ext: string; color: string }> = {
  javascript: { label: 'JavaScript', ext: '.js',  color: 'bg-yellow-100 text-yellow-800' },
  typescript: { label: 'TypeScript', ext: '.ts',  color: 'bg-blue-100 text-blue-800' },
  python:     { label: 'Python',     ext: '.py',  color: 'bg-green-100 text-green-800' },
  rust:       { label: 'Rust',       ext: '.rs',  color: 'bg-orange-100 text-orange-800' },
  go:         { label: 'Go',         ext: '.go',  color: 'bg-cyan-100 text-cyan-800' },
  java:       { label: 'Java',       ext: '.java',color: 'bg-red-100 text-red-800' },
  cpp:        { label: 'C++',        ext: '.cpp', color: 'bg-purple-100 text-purple-800' },
  c:          { label: 'C',          ext: '.c',   color: 'bg-slate-100 text-slate-800' },
  csharp:     { label: 'C#',         ext: '.cs',  color: 'bg-violet-100 text-violet-800' },
  html:       { label: 'HTML',       ext: '.html',color: 'bg-orange-100 text-orange-800' },
  css:        { label: 'CSS',        ext: '.css', color: 'bg-pink-100 text-pink-800' },
  sql:        { label: 'SQL',        ext: '.sql', color: 'bg-indigo-100 text-indigo-800' },
  bash:       { label: 'Bash',       ext: '.sh',  color: 'bg-emerald-100 text-emerald-800' },
  other:      { label: 'Other',      ext: '',     color: 'bg-gray-100 text-gray-800' },
}

export const PLAN_LIMITS: Record<PlanId, { reviews: number; lines: number }> = {
  free: { reviews: 3,    lines: 150 },
  pro:  { reviews: 100,  lines: 1000 },
  team: { reviews: -1,   lines: 5000 },
}

export function canReview(plan: PlanId, used: number): boolean {
  const limit = PLAN_LIMITS[plan].reviews
  return limit === -1 || used < limit
}

export function countLines(code: string): number {
  return code.split('\n').length
}

export function truncateCode(code: string, maxLines = 10): string {
  const lines = code.split('\n')
  if (lines.length <= maxLines) return code
  return lines.slice(0, maxLines).join('\n') + `\n... (${lines.length - maxLines} more lines)`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}