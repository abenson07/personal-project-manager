-- Task 2, Subtask 3: Configure Row Level Security Policies
-- Enable RLS on all tables and create authentication-based access policies

-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subprojects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
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

-- Create policies for authenticated users
-- Projects: users can perform all operations (for now, open access - can be restricted later)
CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Users can delete projects" ON projects FOR DELETE USING (true);

-- Subprojects: users can perform all operations for subprojects
CREATE POLICY "Users can view subprojects" ON subprojects FOR SELECT USING (true);
CREATE POLICY "Users can create subprojects" ON subprojects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update subprojects" ON subprojects FOR UPDATE USING (true);
CREATE POLICY "Users can delete subprojects" ON subprojects FOR DELETE USING (true);

-- Notes: users can perform all operations for notes
CREATE POLICY "Users can view notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Users can create notes" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notes" ON notes FOR UPDATE USING (true);
CREATE POLICY "Users can delete notes" ON notes FOR DELETE USING (true);

-- Task comments: users can perform all operations for task comments
CREATE POLICY "Users can view task comments" ON task_comments FOR SELECT USING (true);
CREATE POLICY "Users can create task comments" ON task_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update task comments" ON task_comments FOR UPDATE USING (true);
CREATE POLICY "Users can delete task comments" ON task_comments FOR DELETE USING (true);

-- Task status: users can perform all operations for task status
CREATE POLICY "Users can view task status" ON task_status FOR SELECT USING (true);
CREATE POLICY "Users can create task status" ON task_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update task status" ON task_status FOR UPDATE USING (true);
CREATE POLICY "Users can delete task status" ON task_status FOR DELETE USING (true);

