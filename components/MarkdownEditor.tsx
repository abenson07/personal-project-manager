'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AssetType } from '@/types/database'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
}

export default function MarkdownEditor({ value, onChange, onSave }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Auto-save with debouncing
  useEffect(() => {
    if (value.trim() === '') return
    
    setSaveStatus('saving')
    const timer = setTimeout(() => {
      onSave()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)

    return () => clearTimeout(timer)
  }, [value, onSave])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`rounded-lg px-4 py-2 ${
              !showPreview
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`rounded-lg px-4 py-2 ${
              showPreview
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Preview
          </button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
        </div>
      </div>

      {showPreview ? (
        <div className="min-h-[400px] rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="prose dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || '*No content yet*'}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[400px] w-full rounded-lg border border-gray-300 p-4 font-mono text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Start writing your project concept notes in Markdown..."
        />
      )}
    </div>
  )
}

