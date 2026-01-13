'use client'

import { useState } from 'react'
import type { PRDNote } from '@/types/database'
import { PRDNoteContext } from '@/types/database'

interface NotesSidebarProps {
  notes: PRDNote[]
  context: PRDNoteContext
  onAddNote: (content: string) => void
  onRerunPRD: () => void
  isProcessing?: boolean
}

export default function NotesSidebar({ 
  notes, 
  context, 
  onAddNote, 
  onRerunPRD,
  isProcessing = false 
}: NotesSidebarProps) {
  const [noteContent, setNoteContent] = useState('')

  // Filter to show only pending notes
  const pendingNotes = notes.filter(note => note.status === 'pending')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (noteContent.trim()) {
      onAddNote(noteContent.trim())
      setNoteContent('')
    }
  }

  const contextLabel = context === PRDNoteContext.PRD ? 'PRD' : 'Feature Sets'

  return (
    <aside className="w-80 border-l border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 flex flex-col h-screen sticky top-0">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notes</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700 flex-shrink-0">
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Enter your note..."
          className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          rows={4}
          required
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Add Note
        </button>
      </form>

      <div className="flex-1 space-y-3 overflow-y-auto mb-4 min-h-0">
        {pendingNotes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No pending notes</p>
        ) : (
          pendingNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onRerunPRD}
          disabled={isProcessing || pendingNotes.length === 0}
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-500 dark:hover:bg-green-600"
        >
          {isProcessing ? 'Processing...' : `Re-run ${contextLabel}`}
        </button>
      </div>
    </aside>
  )
}

