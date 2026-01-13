-- Create enum types for PRD notes
CREATE TYPE prd_note_status_enum AS ENUM ('pending', 'triaged');
CREATE TYPE prd_note_context_enum AS ENUM ('prd', 'feature_sets');

-- Create prd_notes table
CREATE TABLE IF NOT EXISTS prd_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  context prd_note_context_enum NOT NULL DEFAULT 'prd',
  content TEXT NOT NULL,
  status prd_note_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_prd_notes_project_status ON prd_notes(project_id, status);
CREATE INDEX IF NOT EXISTS idx_prd_notes_project_context ON prd_notes(project_id, context);

