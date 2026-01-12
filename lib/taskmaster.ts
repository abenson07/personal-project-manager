// Taskmaster integration service
// Handles PRD and task generation using Taskmaster

import type { Note } from '@/types/database'

/**
 * Aggregates notes from a subproject into a format suitable for Taskmaster PRD generation
 */
export function aggregateNotesForPRD(notes: Note[]): string {
  const noteTexts = notes.map((note, index) => {
    const timestamp = new Date(note.created_at).toISOString()
    return `## Note ${index + 1} (${timestamp})\n\n${note.content}`
  })
  
  return noteTexts.join('\n\n---\n\n')
}

/**
 * Generates a PRD markdown from subproject notes using Taskmaster
 * Calls the API route which handles Taskmaster integration
 */
export async function generatePRD(
  subprojectId: string,
  notes: Note[]
): Promise<string> {
  const response = await fetch('/api/taskmaster/generate-prd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subprojectId,
      notes,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate PRD')
  }

  const result = await response.json()
  
  // TODO: When Taskmaster MCP is integrated, this will return the actual PRD markdown
  // For now, return a placeholder
  return `# PRD Generated for Subproject ${subprojectId}\n\n${aggregateNotesForPRD(notes)}\n\n[PRD generation via Taskmaster pending]`
}

/**
 * Generates task markdown from PRD using Taskmaster
 * This will call Taskmaster's expand_task or parse_prd functionality
 */
export async function generateTasks(
  subprojectId: string,
  prdMarkdown: string
): Promise<string> {
  // TODO: Implement API route for task generation
  // This will use Taskmaster to expand the PRD into tasks
  
  // Placeholder implementation
  return `# Tasks for Subproject ${subprojectId}\n\n[Task generation via Taskmaster pending]\n\n${prdMarkdown}`
}

/**
 * Complete "Let's Build It" workflow:
 * 1. Aggregate notes
 * 2. Generate PRD markdown via Taskmaster
 * 3. Generate tasks markdown via Taskmaster
 * 4. Return both markdowns for saving
 */
export async function letsBuildIt(
  subprojectId: string,
  notes: Note[]
): Promise<{ prdMarkdown: string; tasksMarkdown: string }> {
  // Step 1: Generate PRD markdown
  const prdMarkdown = await generatePRD(subprojectId, notes)
  
  // Step 2: Generate tasks markdown
  const tasksMarkdown = await generateTasks(subprojectId, prdMarkdown)
  
  return {
    prdMarkdown,
    tasksMarkdown,
  }
}
