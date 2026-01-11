// Database entity interfaces matching Supabase schema

export interface Project {
  id: string
  name: string
  phase: ProjectPhase
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
  project_id: string
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

