// Database entity interfaces matching Supabase schema (Task 2/3)

export interface Project {
  id: string
  name: string
  status: 'planning' | 'in_progress' | 'complete'
  created_at: string
  updated_at: string
}

export interface ProjectNote {
  id: string
  project_id: string
  content: string
  created_at: string
}

export interface Asset {
  id: string
  project_id: string | null // Deprecated, use subproject_id instead
  subproject_id: string | null // New field
  type: AssetType
  source: string
  annotation: string | null
  created_at: string
}

export interface FeatureSet {
  id: string
  project_id: string
  name: string
  description: string | null
  created_at: string
}

export interface FeatureVersion {
  id: string
  feature_set_id: string
  version: string
  definition: string
  created_at: string
}

export interface MiniPRD {
  id: string
  project_id: string
  feature_set_id: string
  version: string
  content: string
  status: MiniPRDStatus
  created_at: string
  updated_at: string
}

export interface MiniPRDTask {
  id: string
  mini_prd_id: string
  type: TaskType
  description: string
  completed: boolean
  created_at: string
}

export interface Test {
  id: string
  mini_prd_id: string
  test_type: TestType
  description: string
  created_at: string
}

export interface PRDNote {
  id: string
  project_id: string
  context: PRDNoteContext
  content: string
  status: PRDNoteStatus
  created_at: string
}

// Task 2/3 subproject model interfaces
export interface Subproject {
  id: string
  project_id: string
  name: string
  mode: 'planned' | 'build' | 'complete'
  prd_markdown?: string
  tasks_markdown?: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  subproject_id: string
  type: 'text' | 'image'
  content: string
  created_at: string
}

export interface TaskComment {
  id: string
  subproject_id: string
  task_id: string
  content: string
  created_at: string
}

export interface TaskStatus {
  id: string
  subproject_id: string
  task_id: string
  status: 'todo' | 'in_progress' | 'done'
  updated_at: string
}

// Enum types matching database enums
export enum ProjectPhase {
  CONCEPT = 'concept',
  PRD = 'prd',
  COMPLETED = 'completed'
}

export enum AssetType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  LINK = 'link',
  OTHER = 'other'
}

export enum MiniPRDStatus {
  PLANNED = 'planned',
  IN_DEVELOPMENT = 'in_development',
  READY_FOR_REVIEW = 'ready_for_review',
  COMPLETED = 'completed'
}

export enum TaskType {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  REVIEW = 'review',
  DEPLOYMENT = 'deployment'
}

export enum TestType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  MANUAL = 'manual'
}

export enum PRDNoteStatus {
  PENDING = 'pending',
  TRIAGED = 'triaged'
}

export enum PRDNoteContext {
  PRD = 'prd',
  FEATURE_SETS = 'feature_sets'
}

// New enums for subproject model
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete'
}

export enum SubprojectMode {
  PLANNED = 'planned',
  BUILD = 'build',
  COMPLETE = 'complete'
}

// TaskStatus enum removed - using string literals in TaskStatus interface instead
// Legacy enum kept for backward compatibility (deprecated)
export enum TaskStatusEnum {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum NoteType {
  TEXT = 'text',
  IMAGE = 'image'
}
