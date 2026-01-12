'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AssetType } from '@/types/database'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  preview?: boolean
}

export default function MarkdownEditor({ value, onChange, onSave, preview = false }: MarkdownEditorProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const lastSavedValueRef = useRef(value)
  const isSavingRef = useRef(false)

  // Auto-save with debouncing (only when not in preview mode)
  useEffect(() => {
    if (preview || value.trim() === '' || value === lastSavedValueRef.current || isSavingRef.current) return
    
    isSavingRef.current = true
    setSaveStatus('saving')
    const timer = setTimeout(() => {
      onSave()
      lastSavedValueRef.current = value
      isSavingRef.current = false
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)

    return () => {
      clearTimeout(timer)
      isSavingRef.current = false
    }
  }, [value, preview, onSave])

  // Update lastSavedValueRef when value prop changes externally (e.g., after save)
  useEffect(() => {
    if (value === lastSavedValueRef.current) return
    // Only update if we're not currently saving and the value matches what we just saved
    if (!isSavingRef.current && saveStatus === 'idle') {
      lastSavedValueRef.current = value
    }
  }, [value, saveStatus])

  if (preview) {
    return (
      <div className="min-h-[400px] rounded-lg border border-gray-300 bg-white p-6">
        <div className="prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value || '*No content yet*'}
          </ReactMarkdown>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[400px] w-full rounded-lg border border-gray-300 p-4 font-mono text-sm"
        placeholder="Start writing your project concept notes in Markdown..."
      />
      <div className="flex items-center justify-start">
        <div className="text-sm text-gray-500">
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
        </div>
      </div>
    </div>
  )
}

