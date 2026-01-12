-- Create enum types for new subproject model
CREATE TYPE subproject_mode_enum AS ENUM ('planned', 'build', 'complete');
CREATE TYPE project_status_enum AS ENUM ('planning', 'in_progress', 'complete');
CREATE TYPE task_status_enum AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE note_type_enum AS ENUM ('text', 'image');

-- Create subprojects table
CREATE TABLE IF NOT EXISTS subprojects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mode subproject_mode_enum NOT NULL DEFAULT 'planned',
  prd_markdown TEXT,
  tasks_markdown TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table (replaces project_notes, now subproject-scoped)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID NOT NULL REFERENCES subprojects(id) ON DELETE CASCADE,
  type note_type_enum NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table (derived from markdown, linked to subprojects)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subproject_id UUID NOT NULL REFERENCES subprojects(id) ON DELETE CASCADE,
  markdown_id TEXT NOT NULL, -- Identifier from parsed markdown for linking
  title TEXT NOT NULL,
  description TEXT,
  status task_status_enum NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subproject_id, markdown_id) -- Ensure one task per markdown_id per subproject
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for subprojects.updated_at
CREATE TRIGGER update_subprojects_updated_at
  BEFORE UPDATE ON subprojects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for tasks.updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subprojects_project_id ON subprojects(project_id);
CREATE INDEX IF NOT EXISTS idx_subprojects_mode ON subprojects(mode);
CREATE INDEX IF NOT EXISTS idx_notes_subproject_id ON notes(subproject_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_subproject_id ON tasks(subproject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_markdown_id ON tasks(markdown_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

