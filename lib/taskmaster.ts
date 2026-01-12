// Taskmaster integration service
// Handles PRD and task generation using Taskmaster MCP

import type { Note } from '@/types/database'

/**
 * Aggregates notes from a subproject into a format suitable for Taskmaster PRD generation
 * Formats notes with timestamps and type indicators
 */
export function aggregateNotesForPRD(notes: Note[]): string {
  if (notes.length === 0) {
    return '# Subproject Notes\n\nNo notes available yet.'
  }

  const noteTexts = notes
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((note, index) => {
      const timestamp = new Date(note.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
      
      const typeIndicator = note.type === 'image' ? '📷 Image' : '📝 Text'
      
      return `## Note ${index + 1} - ${typeIndicator} (${timestamp})\n\n${note.content}`
    })
  
  return `# Subproject Notes\n\n${noteTexts.join('\n\n---\n\n')}`
}

/**
 * Generates a PRD markdown from subproject notes using Taskmaster MCP
 * Calls the API route which handles Taskmaster MCP integration
 */
export async function generatePRD(
  subprojectId: string,
  notes: Note[]
): Promise<string> {
  const aggregatedNotes = aggregateNotesForPRD(notes)
  
  const response = await fetch('/api/taskmaster/generate-prd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subprojectId,
      notes,
      aggregatedNotes,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to generate PRD')
  }

  const data = await response.json()
  return data.prdMarkdown || data.prd || ''
}

/**
 * Generates task markdown from PRD using Taskmaster MCP
 * This will use Taskmaster's parse_prd functionality to generate tasks
 */
export async function generateTasks(
  subprojectId: string,
  prdMarkdown: string
): Promise<string> {
  const response = await fetch('/api/taskmaster/generate-tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subprojectId,
      prdMarkdown,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to generate tasks')
  }

  const data = await response.json()
  return data.tasksMarkdown || data.tasks || ''
}

/**
 * Complete "Let's Build It" workflow:
 * 1. Aggregate notes
 * 2. Generate PRD markdown via Taskmaster MCP
 * 3. Generate tasks markdown via Taskmaster MCP
 * 4. Return both markdowns for saving
 */
export async function letsBuildIt(
  subprojectId: string,
  notes: Note[]
): Promise<{ prdMarkdown: string; tasksMarkdown: string }> {
  if (notes.length === 0) {
    throw new Error('Cannot generate PRD: No notes available. Please add some notes first.')
  }

  // Step 1: Generate PRD markdown
  const prdMarkdown = await generatePRD(subprojectId, notes)
  
  if (!prdMarkdown || prdMarkdown.trim().length === 0) {
    throw new Error('PRD generation returned empty content')
  }
  
  // Step 2: Generate tasks markdown from PRD
  const tasksMarkdown = await generateTasks(subprojectId, prdMarkdown)
  
  if (!tasksMarkdown || tasksMarkdown.trim().length === 0) {
    throw new Error('Task generation returned empty content')
  }
  
  return {
    prdMarkdown,
    tasksMarkdown,
  }
}
