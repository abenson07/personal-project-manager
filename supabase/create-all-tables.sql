-- Complete SQL to create all tables for Personal Project Manager
-- Run this in Supabase Dashboard > SQL Editor

-- ============================================================================
-- Step 1: Create Tables
-- ============================================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('planning', 'in_progress', 'complete')) DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subprojects table
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

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID REFERENCES subprojects(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('text', 'image')) DEFAULT 'text',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID REFERENCES subprojects(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task status table (UI state only)
CREATE TABLE IF NOT EXISTS task_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID REFERENCES subprojects(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subproject_id, task_id)
);

-- ============================================================================
-- Step 2: Create Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
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

-- ============================================================================
-- Step 3: Create Indexes
-- ============================================================================

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

-- Task ID indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_status_task_id ON task_status(task_id);

-- ============================================================================
-- Step 4: Enable Row Level Security and Create Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subprojects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects" ON projects;
DROP POLICY IF EXISTS "Users can delete projects" ON projects;

DROP POLICY IF EXISTS "Users can view subprojects" ON subprojects;
DROP POLICY IF EXISTS "Users can create subprojects" ON subprojects;
DROP POLICY IF EXISTS "Users can update subprojects" ON subprojects;
DROP POLICY IF EXISTS "Users can delete subprojects" ON subprojects;

DROP POLICY IF EXISTS "Users can view notes" ON notes;
DROP POLICY IF EXISTS "Users can create notes" ON notes;
DROP POLICY IF EXISTS "Users can update notes" ON notes;
DROP POLICY IF EXISTS "Users can delete notes" ON notes;

DROP POLICY IF EXISTS "Users can view task comments" ON task_comments;
DROP POLICY IF EXISTS "Users can create task comments" ON task_comments;
DROP POLICY IF EXISTS "Users can update task comments" ON task_comments;
DROP POLICY IF EXISTS "Users can delete task comments" ON task_comments;

DROP POLICY IF EXISTS "Users can view task status" ON task_status;
DROP POLICY IF EXISTS "Users can create task status" ON task_status;
DROP POLICY IF EXISTS "Users can update task status" ON task_status;
DROP POLICY IF EXISTS "Users can delete task status" ON task_status;

-- Create policies for authenticated users (open access for now)
CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Users can delete projects" ON projects FOR DELETE USING (true);

CREATE POLICY "Users can view subprojects" ON subprojects FOR SELECT USING (true);
CREATE POLICY "Users can create subprojects" ON subprojects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update subprojects" ON subprojects FOR UPDATE USING (true);
CREATE POLICY "Users can delete subprojects" ON subprojects FOR DELETE USING (true);

CREATE POLICY "Users can view notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Users can create notes" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notes" ON notes FOR UPDATE USING (true);
CREATE POLICY "Users can delete notes" ON notes FOR DELETE USING (true);

CREATE POLICY "Users can view task comments" ON task_comments FOR SELECT USING (true);
CREATE POLICY "Users can create task comments" ON task_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update task comments" ON task_comments FOR UPDATE USING (true);
CREATE POLICY "Users can delete task comments" ON task_comments FOR DELETE USING (true);

CREATE POLICY "Users can view task status" ON task_status FOR SELECT USING (true);
CREATE POLICY "Users can create task status" ON task_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update task status" ON task_status FOR UPDATE USING (true);
CREATE POLICY "Users can delete task status" ON task_status FOR DELETE USING (true);

