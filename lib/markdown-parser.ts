// Markdown parser for Taskmaster-generated task markdown
// Extracts structured task data from markdown format

export interface ParsedTask {
  markdownId: string // Unique identifier from markdown (e.g., task-1, task-2)
  title: string
  description: string | null
  subtasks?: string[]
  acceptanceCriteria?: string[]
}

/**
 * Parses Taskmaster-generated task markdown into structured task objects
 * 
 * Expected markdown format:
 * # Task Title
 * 
 * Description text here...
 * 
 * ## Subtasks
 * - Subtask 1
 * - Subtask 2
 * 
 * ## Acceptance Criteria
 * - Criterion 1
 * - Criterion 2
 */
export function parseTaskMarkdown(markdown: string): ParsedTask[] {
  const tasks: ParsedTask[] = []
  
  // Split markdown into sections (tasks are typically separated by ## or #)
  const lines = markdown.split('\n')
  let currentTask: Partial<ParsedTask> | null = null
  let currentSection: 'description' | 'subtasks' | 'acceptance' | null = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Check for task header (# Task Title)
    if (trimmed.startsWith('# ')) {
      // Save previous task if exists
      if (currentTask && currentTask.markdownId && currentTask.title) {
        tasks.push({
          markdownId: currentTask.markdownId,
          title: currentTask.title,
          description: currentTask.description || null,
          subtasks: currentTask.subtasks,
          acceptanceCriteria: currentTask.acceptanceCriteria
        })
      }
      
      // Start new task
      const title = trimmed.substring(2).trim()
      currentTask = {
        markdownId: generateMarkdownId(tasks.length + 1, title),
        title,
        description: null,
        subtasks: [],
        acceptanceCriteria: []
      }
      currentSection = 'description'
    }
    // Check for section headers
    else if (trimmed.startsWith('## ')) {
      const sectionName = trimmed.substring(3).toLowerCase()
      if (sectionName.includes('subtask')) {
        currentSection = 'subtasks'
      } else if (sectionName.includes('acceptance') || sectionName.includes('criteria')) {
        currentSection = 'acceptance'
      } else {
        currentSection = 'description'
      }
    }
    // Check for list items (subtasks or acceptance criteria)
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const item = trimmed.substring(2).trim()
      if (currentTask && currentSection === 'subtasks') {
        if (!currentTask.subtasks) currentTask.subtasks = []
        currentTask.subtasks.push(item)
      } else if (currentTask && currentSection === 'acceptance') {
        if (!currentTask.acceptanceCriteria) currentTask.acceptanceCriteria = []
        currentTask.acceptanceCriteria.push(item)
      }
    }
    // Regular description text
    else if (trimmed && currentTask && currentSection === 'description') {
      if (!currentTask.description) {
        currentTask.description = trimmed
      } else {
        currentTask.description += '\n' + trimmed
      }
    }
  }
  
  // Don't forget the last task
  if (currentTask && currentTask.markdownId && currentTask.title) {
    tasks.push({
      markdownId: currentTask.markdownId,
      title: currentTask.title,
      description: currentTask.description || null,
      subtasks: currentTask.subtasks,
      acceptanceCriteria: currentTask.acceptanceCriteria
    })
  }
  
  return tasks
}

/**
 * Generates a unique markdown ID for a task
 * Format: task-{index} or slugified title
 */
function generateMarkdownId(index: number, title: string): string {
  // Try to extract ID from title if it follows pattern like "Task 1: Title"
  const idMatch = title.match(/^(?:task|Task)\s*(\d+)/i)
  if (idMatch) {
    return `task-${idMatch[1]}`
  }
  
  // Otherwise use index and slugify title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30)
  
  return `task-${index}-${slug}`
}

/**
 * Extracts task ID from markdown if it follows a specific pattern
 * This helps link rendered tasks back to database records
 */
export function extractTaskIdFromMarkdown(markdown: string, taskTitle: string): string | null {
  // Look for patterns like [task-id: xxx] or <!-- task-id: xxx -->
  const idPatterns = [
    /\[task-id:\s*([^\]]+)\]/i,
    /<!--\s*task-id:\s*([^>]+)\s*-->/i,
    /task[_\s]*id[_\s]*[:=]\s*([^\s\n]+)/i
  ]
  
  for (const pattern of idPatterns) {
    const match = markdown.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  // Fallback: generate from title
  return generateMarkdownId(0, taskTitle)
}

