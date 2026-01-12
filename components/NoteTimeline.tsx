'use client'

import { useEffect, useState } from 'react'
import { getNotesForSubproject } from '@/lib/database'
import type { Note } from '@/types/database'
import NoteCard from './NoteCard'

interface NoteTimelineProps {
  subprojectId: string
  refreshTrigger?: number
}

export default function NoteTimeline({ subprojectId, refreshTrigger }: NoteTimelineProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getNotesForSubproject(subprojectId)
      // Notes are already sorted in reverse chronological order (newest first) from the database
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [subprojectId, refreshTrigger])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Loading notes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">No notes yet. Start typing above to add your first note!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  )
}

