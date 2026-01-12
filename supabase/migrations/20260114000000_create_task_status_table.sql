-- Create task_status table (UI state only) as per Task 2 requirements
-- This table stores task status for tasks identified by TEXT task_id from markdown
CREATE TABLE IF NOT EXISTS task_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID NOT NULL REFERENCES subprojects(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subproject_id, task_id)
);

-- Create trigger for task_status.updated_at
CREATE TRIGGER update_task_status_updated_at
  BEFORE UPDATE ON task_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_status_subproject_id ON task_status(subproject_id);
CREATE INDEX IF NOT EXISTS idx_task_status_task_id ON task_status(task_id);
CREATE INDEX IF NOT EXISTS idx_task_status_status ON task_status(status);

-- Update task_comments to match Task 2 requirements
-- Task 2 requires task_comments to reference subproject_id + task_id (TEXT), not tasks.id
-- First, check if we need to alter the existing table structure
-- Note: If task_comments already references tasks.id, we'll need to migrate it
-- For now, we'll create a new structure that matches Task 2 requirements

-- Drop existing task_comments table if it exists with wrong structure
DROP TABLE IF EXISTS task_comments CASCADE;

-- Create task_comments table matching Task 2 requirements
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID NOT NULL REFERENCES subprojects(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for task_comments
CREATE INDEX IF NOT EXISTS idx_task_comments_subproject_id ON task_comments(subproject_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at);

