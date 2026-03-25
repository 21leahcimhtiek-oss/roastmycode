export const REVIEW_MODELS = [
  { id: 'openai/gpt-4o',                    name: 'GPT-4o',            plan: 'pro'  },
  { id: 'anthropic/claude-3.5-sonnet',       name: 'Claude 3.5 Sonnet', plan: 'pro'  },
  { id: 'anthropic/claude-3-opus-20240229',  name: 'Claude 3 Opus',     plan: 'team' },
  { id: 'openai/gpt-4o-mini',               name: 'GPT-4o Mini',       plan: 'free' },
]

export const DEFAULT_MODEL = 'openai/gpt-4o-mini'

function buildReviewPrompt(code: string, language: string): string {
  return `You are a senior software engineer performing an exhaustive code review. Be brutally honest, specific, and actionable.

Analyze the following ${language} code and return a JSON object with EXACTLY this structure:

{
  "overall_score": <integer 0-100>,
  "summary": "<2-3 sentence executive summary of code quality>",
  "refactored_code": "<complete refactored version of the code with all fixes applied>",
  "issues": [
    {
      "id": "<uuid>",
      "severity": "<critical|high|medium|low|info>",
      "category": "<bug|style|logic|naming|complexity|duplication>",
      "line_start": <integer or null>,
      "line_end": <integer or null>,
      "description": "<specific description of the issue>",
      "fix": "<concrete fix suggestion>"
    }
  ],
  "suggestions": [
    {
      "id": "<uuid>",
      "type": "<refactor|pattern|library|architecture|test>",
      "title": "<short title>",
      "description": "<detailed explanation>",
      "code_example": "<optional code snippet showing the improvement>",
      "priority": "<must|should|could>"
    }
  ],
  "security_findings": [
    {
      "id": "<uuid>",
      "severity": "<critical|high|medium|low|info>",
      "cwe_id": "<CWE-XXX or null>",
      "title": "<vulnerability title>",
      "description": "<what the vulnerability is>",
      "remediation": "<how to fix it>",
      "line": <integer or null>
    }
  ],
  "performance_notes": [
    {
      "id": "<uuid>",
      "impact": "<high|medium|low>",
      "title": "<short title>",
      "description": "<what the performance issue is>",
      "fix": "<how to fix it>"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON, no markdown code fences, no explanation outside the JSON
- Be specific about line numbers when possible
- The refactored_code must be a complete, runnable version (not just snippets)
- Score 0-40 = poor, 41-60 = average, 61-80 = good, 81-100 = excellent
- Use real CWE IDs where applicable (e.g. CWE-89 for SQL injection)

Code to review:
\`\`\`${language}
${code}
\`\`\``
}

export async function streamReview(
  code: string,
  language: string,
  model: string,
  onChunk: (chunk: string) => void,
  onComplete: (full: string) => void,
  onError: (err: Error) => void,
) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://roastmycode.dev',
      'X-Title': 'RoastMyCode',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: buildReviewPrompt(code, language) }],
      stream: true,
      temperature: 0.1,    // Low temp for consistent, accurate code analysis
      max_tokens: 8000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} — ${err}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  try {
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
          const text = parsed.choices?.[0]?.delta?.content ?? ''
          if (text) {
            fullText += text
            onChunk(text)
          }
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
    onComplete(fullText)
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}

export async function runReview(code: string, language: string, model: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://roastmycode.dev',
      'X-Title': 'RoastMyCode',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: buildReviewPrompt(code, language) }],
      stream: false,
      temperature: 0.1,
      max_tokens: 8000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ''
}