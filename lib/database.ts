import { supabase } from './supabase'
import type {
  Project,
  ProjectNote,
  Asset,
  FeatureSet,
  FeatureVersion,
  MiniPRD,
  MiniPRDTask,
  Test
} from '@/types/database'
import {
  ProjectPhase,
  AssetType,
  MiniPRDStatus,
  TaskType,
  TestType
} from '@/types/database'

// Custom error types
export class DatabaseError extends Error {
  constructor(message: string, public code?: string, public details?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Project CRUD operations
export async function createProject(name: string, phase: ProjectPhase = ProjectPhase.CONCEPT): Promise<Project> {
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

export async function updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'phase'>>): Promise<Project> {
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

