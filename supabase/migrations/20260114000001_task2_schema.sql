-- Task 2: Supabase Database Setup and Schema Implementation
-- This migration creates the exact schema required by Task 2

-- Projects table (matches Task 2 requirements)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('planning', 'in_progress', 'complete')) DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subprojects table (matches Task 2 requirements)
CREATE TABLE IF NOT EXISTS subprojects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mode TEXT CHECK (mode IN ('planned', 'build', 'complete')) DEFAULT 'planned',
  prd_markdown TEXT,
  tasks_markdown TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table (matches Task 2 requirements)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID REFERENCES subprojects(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('text', 'image')) DEFAULT 'text',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task comments table (matches Task 2 requirements)
-- Note: References subproject_id + task_id (TEXT), not a tasks table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID REFERENCES subprojects(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task status table (UI state only) - matches Task 2 requirements
CREATE TABLE IF NOT EXISTS task_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID REFERENCES subprojects(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subproject_id, task_id)
);

-- Create function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subprojects_updated_at ON subprojects;
CREATE TRIGGER update_subprojects_updated_at
  BEFORE UPDATE ON subprojects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_status_updated_at ON task_status;
CREATE TRIGGER update_task_status_updated_at
  BEFORE UPDATE ON task_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance optimization (Task 2, Subtask 4)
-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_subprojects_project_id ON subprojects(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_subproject_id ON notes(subproject_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_subproject_id ON task_comments(subproject_id);
CREATE INDEX IF NOT EXISTS idx_task_status_subproject_id ON task_status(subproject_id);

-- Status/mode indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_subprojects_mode ON subprojects(mode);
CREATE INDEX IF NOT EXISTS idx_task_status_status ON task_status(status);

-- Timestamp indexes
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_task_status_updated_at ON task_status(updated_at);

-- Task ID indexes for task_comments and task_status
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_status_task_id ON task_status(task_id);

