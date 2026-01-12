import { supabase } from './supabase'
import type {
  Project,
  ProjectNote,
  Asset,
  FeatureSet,
  FeatureVersion,
  MiniPRD,
  MiniPRDTask,
  Test,
  PRDNote,
  Subproject,
  Note,
  TaskComment,
  TaskStatus
} from '@/types/database'
import {
  ProjectPhase,
  AssetType,
  MiniPRDStatus,
  TaskType,
  TestType,
  PRDNoteStatus,
  PRDNoteContext
} from '@/types/database'

// Custom error types
export class DatabaseError extends Error {
  constructor(message: string, public code?: string, public details?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Project CRUD operations (legacy - uses phase)
export async function createProjectLegacy(name: string, phase: ProjectPhase = ProjectPhase.CONCEPT): Promise<Project> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, phase })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create project', undefined, String(error))
  }
}

// Task 3: Create project with status
export async function createProject(name: string, status: 'planning' | 'in_progress' | 'complete' = 'planning'): Promise<Project> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, status })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create project', undefined, String(error))
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new DatabaseError(error.message, error.code, error.details)
    }
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get project', undefined, String(error))
  }
}

export async function getProjectsByPhase(phase: ProjectPhase): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('phase', phase)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get projects by phase', undefined, String(error))
  }
}

export async function updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'status'>>): Promise<Project> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to update project', undefined, String(error))
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError(error.message, error.code, error.details)
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to delete project', undefined, String(error))
  }
}

// Project Notes operations
export async function createProjectNote(projectId: string, content: string): Promise<ProjectNote> {
  try {
    const { data, error } = await supabase
      .from('project_notes')
      .insert({ project_id: projectId, content })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create project note', undefined, String(error))
  }
}

export async function getProjectNotes(projectId: string): Promise<ProjectNote[]> {
  try {
    const { data, error } = await supabase
      .from('project_notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get project notes', undefined, String(error))
  }
}

// Asset operations
export async function createAsset(
  projectId: string,
  type: AssetType,
  source: string,
  annotation?: string
): Promise<Asset> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert({ project_id: projectId, type, source, annotation })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create asset', undefined, String(error))
  }
}

export async function getAssetsByProject(projectId: string): Promise<Asset[]> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get assets', undefined, String(error))
  }
}

// Feature Set operations
export async function createFeatureSet(
  projectId: string,
  name: string,
  description?: string
): Promise<FeatureSet> {
  try {
    const { data, error } = await supabase
      .from('feature_sets')
      .insert({ project_id: projectId, name, description })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create feature set', undefined, String(error))
  }
}

export async function getFeatureSetsByProject(projectId: string): Promise<FeatureSet[]> {
  try {
    const { data, error } = await supabase
      .from('feature_sets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get feature sets', undefined, String(error))
  }
}

export async function updateFeatureSet(id: string, updates: Partial<Pick<FeatureSet, 'name' | 'description'>>): Promise<FeatureSet> {
  try {
    const { data, error } = await supabase
      .from('feature_sets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to update feature set', undefined, String(error))
  }
}

// Feature Version operations
export async function createFeatureVersion(
  featureSetId: string,
  version: string,
  definition: string
): Promise<FeatureVersion> {
  try {
    const { data, error } = await supabase
      .from('feature_versions')
      .insert({ feature_set_id: featureSetId, version, definition })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create feature version', undefined, String(error))
  }
}

// Mini PRD operations
export async function createMiniPRD(
  projectId: string,
  featureSetId: string,
  version: string,
  content: string,
  status: MiniPRDStatus = MiniPRDStatus.PLANNED
): Promise<MiniPRD> {
  try {
    const { data, error } = await supabase
      .from('mini_prds')
      .insert({ project_id: projectId, feature_set_id: featureSetId, version, content, status })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create mini PRD', undefined, String(error))
  }
}

export async function getMiniPRDsByProject(projectId: string): Promise<MiniPRD[]> {
  try {
    const { data, error } = await supabase
      .from('mini_prds')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get mini PRDs', undefined, String(error))
  }
}

export async function updateMiniPRDStatus(id: string, status: MiniPRDStatus): Promise<MiniPRD> {
  try {
    const { data, error } = await supabase
      .from('mini_prds')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to update mini PRD status', undefined, String(error))
  }
}

// Mini PRD Task operations
export async function createMiniPRDTask(
  miniPrdId: string,
  type: TaskType,
  description: string
): Promise<MiniPRDTask> {
  try {
    const { data, error } = await supabase
      .from('mini_prd_tasks')
      .insert({ mini_prd_id: miniPrdId, type, description, completed: false })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create mini PRD task', undefined, String(error))
  }
}

export async function updateMiniPRDTask(id: string, completed: boolean): Promise<MiniPRDTask> {
  try {
    const { data, error } = await supabase
      .from('mini_prd_tasks')
      .update({ completed })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to update mini PRD task', undefined, String(error))
  }
}

// Test operations
export async function createTest(
  miniPrdId: string,
  testType: TestType,
  description: string
): Promise<Test> {
  try {
    const { data, error } = await supabase
      .from('tests')
      .insert({ mini_prd_id: miniPrdId, test_type: testType, description })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create test', undefined, String(error))
  }
}

export async function getTestsByMiniPRD(miniPrdId: string): Promise<Test[]> {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('mini_prd_id', miniPrdId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get tests', undefined, String(error))
  }
}

// PRD Notes operations
export async function createPRDNote(
  projectId: string,
  context: PRDNoteContext,
  content: string
): Promise<PRDNote> {
  try {
    const { data, error } = await supabase
      .from('prd_notes')
      .insert({ project_id: projectId, context, content, status: PRDNoteStatus.PENDING })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create PRD note', undefined, String(error))
  }
}

export async function getPRDNotesByProject(
  projectId: string,
  context?: PRDNoteContext,
  status?: PRDNoteStatus
): Promise<PRDNote[]> {
  try {
    let query = supabase
      .from('prd_notes')
      .select('*')
      .eq('project_id', projectId)

    if (context) {
      query = query.eq('context', context)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get PRD notes', undefined, String(error))
  }
}

export async function updatePRDNoteStatus(
  id: string,
  status: PRDNoteStatus
): Promise<PRDNote> {
  try {
    const { data, error } = await supabase
      .from('prd_notes')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to update PRD note status', undefined, String(error))
  }
}

export async function markPRDNotesAsTriaged(
  projectId: string,
  context: PRDNoteContext
): Promise<void> {
  try {
    const { error } = await supabase
      .from('prd_notes')
      .update({ status: PRDNoteStatus.TRIAGED })
      .eq('project_id', projectId)
      .eq('context', context)
      .eq('status', PRDNoteStatus.PENDING)

    if (error) throw new DatabaseError(error.message, error.code, error.details)
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to mark PRD notes as triaged', undefined, String(error))
  }
}

// ============================================================================
// Task 3: Database utility functions for new subproject model
// ============================================================================

/**
 * Fetch all projects with their subproject counts (Task 3)
 */
export async function fetchProjectsWithSubprojectCounts(): Promise<(Project & { subproject_count: number })[]> {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectsError) throw new DatabaseError(projectsError.message, projectsError.code, projectsError.details)
    if (!projects) return []

    // Get subproject counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const { count, error: countError } = await supabase
          .from('subprojects')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)

        if (countError) {
          console.warn(`Failed to get subproject count for project ${project.id}:`, countError)
          return { ...project, subproject_count: 0 }
        }

        return { ...project, subproject_count: count || 0 }
      })
    )

    return projectsWithCounts
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to fetch projects with subproject counts', undefined, String(error))
  }
}

/**
 * Get all subprojects for a project (Task 3)
 */
export async function getSubprojectsByProjectId(projectId: string): Promise<Subproject[]> {
  try {
    const { data, error } = await supabase
      .from('subprojects')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get subprojects by project ID', undefined, String(error))
  }
}

/**
 * Get a subproject by ID (Task 6)
 */
export async function getSubprojectById(id: string): Promise<Subproject | null> {
  try {
    const { data, error } = await supabase
      .from('subprojects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw new DatabaseError(error.message, error.code, error.details)
    }
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get subproject by ID', undefined, String(error))
  }
}

/**
 * Create a new subproject (Task 3)
 */
export async function createSubproject(
  projectId: string,
  name: string,
  mode: 'planned' | 'build' | 'complete' = 'planned'
): Promise<Subproject> {
  try {
    const { data, error } = await supabase
      .from('subprojects')
      .insert({ project_id: projectId, name, mode })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create subproject', undefined, String(error))
  }
}

/**
 * Update subproject mode (Task 3)
 */
export async function updateSubprojectMode(
  id: string,
  mode: 'planned' | 'build' | 'complete'
): Promise<Subproject> {
  try {
    const { data, error } = await supabase
      .from('subprojects')
      .update({ mode })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to update subproject mode', undefined, String(error))
  }
}

/**
 * Update subproject with PRD and tasks markdown (Task 7)
 */
export async function updateSubprojectMarkdown(
  id: string,
  prdMarkdown: string,
  tasksMarkdown: string,
  mode: 'planned' | 'build' | 'complete' = 'build'
): Promise<Subproject> {
  try {
    const { data, error } = await supabase
      .from('subprojects')
      .update({ 
        prd_markdown: prdMarkdown,
        tasks_markdown: tasksMarkdown,
        mode 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to update subproject markdown', undefined, String(error))
  }
}

/**
 * Get all notes for a subproject (Task 3)
 */
export async function getNotesForSubproject(subprojectId: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('subproject_id', subprojectId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get notes for subproject', undefined, String(error))
  }
}

/**
 * Create a new note (Task 3)
 */
export async function createNote(
  subprojectId: string,
  content: string,
  type: 'text' | 'image' = 'text'
): Promise<Note> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert({ subproject_id: subprojectId, content, type })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create note', undefined, String(error))
  }
}

/**
 * Get all task comments for a subproject (Task 3)
 */
export async function getTaskCommentsForSubproject(subprojectId: string): Promise<TaskComment[]> {
  try {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('subproject_id', subprojectId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get task comments for subproject', undefined, String(error))
  }
}

/**
 * Create a new task comment (Task 3)
 */
export async function createTaskComment(
  subprojectId: string,
  taskId: string,
  content: string
): Promise<TaskComment> {
  try {
    const { data, error } = await supabase
      .from('task_comments')
      .insert({ subproject_id: subprojectId, task_id: taskId, content })
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to create task comment', undefined, String(error))
  }
}

/**
 * Update task status (Task 3)
 */
export async function updateTaskStatus(
  subprojectId: string,
  taskId: string,
  status: 'todo' | 'in_progress' | 'done'
): Promise<TaskStatus> {
  try {
    // Use upsert to create or update task status
    const { data, error } = await supabase
      .from('task_status')
      .upsert(
        { subproject_id: subprojectId, task_id: taskId, status },
        { onConflict: 'subproject_id,task_id' }
      )
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to update task status', undefined, String(error))
  }
}

/**
 * Get task statuses for a subproject (Task 3)
 */
export async function getTaskStatusesForSubproject(subprojectId: string): Promise<TaskStatus[]> {
  try {
    const { data, error } = await supabase
      .from('task_status')
      .select('*')
      .eq('subproject_id', subprojectId)

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data || []
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to get task statuses for subproject', undefined, String(error))
  }
}

/**
 * Calculate project status based on subproject modes (Task 3)
 * - 'planning': all subprojects are 'planned'
 * - 'in_progress': at least one subproject is 'build'
 * - 'complete': all subprojects are 'complete'
 */
export async function calculateProjectStatus(projectId: string): Promise<'planning' | 'in_progress' | 'complete'> {
  try {
    const subprojects = await getSubprojectsByProjectId(projectId)

    if (subprojects.length === 0) {
      return 'planning' // No subprojects = planning
    }

    const allComplete = subprojects.every((sp) => sp.mode === 'complete')
    const anyBuilding = subprojects.some((sp) => sp.mode === 'build')
    const allPlanned = subprojects.every((sp) => sp.mode === 'planned')

    if (allComplete) return 'complete'
    if (anyBuilding) return 'in_progress'
    if (allPlanned) return 'planning'

    // Mixed states: if any are building, it's in progress
    return 'in_progress'
  } catch (error) {
    throw new DatabaseError('Failed to calculate project status', undefined, String(error))
  }
}

/**
 * Update project status based on subproject modes (Task 3)
 */
export async function updateProjectStatusFromSubprojects(projectId: string): Promise<Project> {
  try {
    const newStatus = await calculateProjectStatus(projectId)
    const { data, error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw new DatabaseError(error.message, error.code, error.details)
    return data
  } catch (error) {
    if (error instanceof DatabaseError) throw error
    throw new DatabaseError('Failed to update project status from subprojects', undefined, String(error))
  }
}

/**
 * Get project progress percentage based on subproject completion (Task 3)
 */
export async function getProjectProgress(projectId: string): Promise<number> {
  try {
    const subprojects = await getSubprojectsByProjectId(projectId)

    if (subprojects.length === 0) return 0

    const completeCount = subprojects.filter((sp) => sp.mode === 'complete').length
    return Math.round((completeCount / subprojects.length) * 100)
  } catch (error) {
    throw new DatabaseError('Failed to get project progress', undefined, String(error))
  }
}

