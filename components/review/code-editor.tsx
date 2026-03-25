'use client'

import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { rust } from '@codemirror/lang-rust'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import type { Language } from '@/types'

const languageExtensions: Record<Language, any> = {
  javascript: javascript({ jsx: true }),
  typescript: javascript({ jsx: true, typescript: true }),
  python:     python(),
  rust:       rust(),
  go:         javascript(), // fallback
  java:       java(),
  cpp:        cpp(),
  c:          cpp(),
  csharp:     java(), // fallback
  html:       html(),
  css:        css(),
  sql:        sql(),
  bash:       javascript(), // fallback
  other:      javascript(), // fallback
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: Language
  readOnly?: boolean
  minHeight?: string
  placeholder?: string
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  minHeight = '300px',
  placeholder = '// Paste your code here...',
}: CodeEditorProps) {
  const handleChange = useCallback((val: string) => onChange(val), [onChange])

  return (
    <div className="rounded-lg overflow-hidden border border-input">
      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={[languageExtensions[language] ?? javascript()]}
        theme={oneDark}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{ minHeight }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: !readOnly,
          autocompletion: !readOnly,
        }}
      />
    </div>
  )
}