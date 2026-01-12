// Status calculation utilities
// Calculates project and subproject statuses based on their children

import type { Subproject, Task } from '@/types/database'
import { ProjectStatus, SubprojectMode, TaskStatus } from '@/types/database'

/**
 * Calculates subproject status based on task completion
 * Complete when all tasks are done
 */
export function calculateSubprojectStatus(tasks: Task[]): SubprojectMode {
  if (tasks.length === 0) {
    // No tasks means still in planned mode (or just transitioned to build)
    return SubprojectMode.BUILD
  }
  
  const allDone = tasks.every(task => task.status === TaskStatus.DONE)
  
  if (allDone) {
    return SubprojectMode.COMPLETE
  }
  
  // If any task exists, we're in build mode
  return SubprojectMode.BUILD
}

/**
 * Calculates project status based on subproject modes
 * - Planning: all subprojects in planned mode
 * - In Progress: at least one subproject in build mode
 * - Complete: all subprojects complete
 */
export function calculateProjectStatus(subprojects: Subproject[]): ProjectStatus {
  if (subprojects.length === 0) {
    return ProjectStatus.PLANNING
  }
  
  const allPlanned = subprojects.every(sp => sp.mode === SubprojectMode.PLANNED)
  const allComplete = subprojects.every(sp => sp.mode === SubprojectMode.COMPLETE)
  const hasBuild = subprojects.some(sp => sp.mode === SubprojectMode.BUILD)
  
  if (allComplete) {
    return ProjectStatus.COMPLETE
  }
  
  if (hasBuild || (!allPlanned && !allComplete)) {
    return ProjectStatus.IN_PROGRESS
  }
  
  if (allPlanned) {
    return ProjectStatus.PLANNING
  }
  
  // Default fallback
  return ProjectStatus.PLANNING
}

/**
 * Gets the count of tasks by status for a subproject
 */
export function getTaskCountsByStatus(tasks: Task[]): {
  todo: number
  inProgress: number
  done: number
  total: number
} {
  return {
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    done: tasks.filter(t => t.status === TaskStatus.DONE).length,
    total: tasks.length
  }
}

/**
 * Calculates completion percentage for a subproject based on tasks
 */
export function calculateSubprojectCompletion(tasks: Task[]): number {
  if (tasks.length === 0) {
    return 0
  }
  
  const doneCount = tasks.filter(t => t.status === TaskStatus.DONE).length
  return Math.round((doneCount / tasks.length) * 100)
}

