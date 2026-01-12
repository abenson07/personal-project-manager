// Status calculation utilities
// Calculates project and subproject statuses based on their children
// Updated for Task 2/3 schema (uses TaskStatus instead of Task)

import type { Subproject, TaskStatus } from '@/types/database'

/**
 * Calculates subproject status based on task completion
 * Complete when all tasks are done
 */
export function calculateSubprojectStatus(taskStatuses: TaskStatus[]): 'planned' | 'build' | 'complete' {
  if (taskStatuses.length === 0) {
    // No tasks means still in planned mode (or just transitioned to build)
    return 'build'
  }
  
  const allDone = taskStatuses.every(ts => ts.status === 'done')
  
  if (allDone) {
    return 'complete'
  }
  
  // If any task exists, we're in build mode
  return 'build'
}

/**
 * Calculates project status based on subproject modes
 * - Planning: all subprojects in planned mode
 * - In Progress: at least one subproject in build mode
 * - Complete: all subprojects complete
 */
export function calculateProjectStatusFromSubprojects(subprojects: Subproject[]): 'planning' | 'in_progress' | 'complete' {
  if (subprojects.length === 0) {
    return 'planning'
  }
  
  const allPlanned = subprojects.every(sp => sp.mode === 'planned')
  const allComplete = subprojects.every(sp => sp.mode === 'complete')
  const hasBuild = subprojects.some(sp => sp.mode === 'build')
  
  if (allComplete) {
    return 'complete'
  }
  
  if (hasBuild || (!allPlanned && !allComplete)) {
    return 'in_progress'
  }
  
  if (allPlanned) {
    return 'planning'
  }
  
  // Default fallback
  return 'planning'
}

/**
 * Gets the count of tasks by status for a subproject
 */
export function getTaskCountsByStatus(taskStatuses: TaskStatus[]): {
  todo: number
  inProgress: number
  done: number
  total: number
} {
  return {
    todo: taskStatuses.filter(ts => ts.status === 'todo').length,
    inProgress: taskStatuses.filter(ts => ts.status === 'in_progress').length,
    done: taskStatuses.filter(ts => ts.status === 'done').length,
    total: taskStatuses.length
  }
}

/**
 * Calculates completion percentage for a subproject based on tasks
 */
export function calculateSubprojectCompletion(taskStatuses: TaskStatus[]): number {
  if (taskStatuses.length === 0) {
    return 0
  }
  
  const doneCount = taskStatuses.filter(ts => ts.status === 'done').length
  return Math.round((doneCount / taskStatuses.length) * 100)
}

