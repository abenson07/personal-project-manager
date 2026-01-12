-- Data migration: Convert existing projects to subprojects
-- Strategy: Create 1:1 project → subproject mapping
-- Each existing project becomes a subproject under itself (or a "Legacy" project)

-- Step 1: Create a "Legacy" project to hold migrated subprojects (optional)
-- Or we can make each project its own subproject
-- For simplicity, we'll create a subproject for each existing project

-- Create subprojects from existing projects
INSERT INTO subprojects (project_id, name, mode, created_at, updated_at)
SELECT 
  id as project_id,
  name,
  CASE 
    WHEN phase = 'concept' THEN 'planned'::subproject_mode_enum
    WHEN phase = 'prd' THEN 'build'::subproject_mode_enum
    WHEN phase = 'completed' THEN 'complete'::subproject_mode_enum
  END as mode,
  created_at,
  updated_at
FROM projects;

-- Step 2: Migrate project_notes to notes (link to subprojects)
INSERT INTO notes (subproject_id, type, content, created_at)
SELECT 
  sp.id as subproject_id,
  'text'::note_type_enum as type,
  pn.content,
  pn.created_at
FROM project_notes pn
JOIN projects p ON pn.project_id = p.id
JOIN subprojects sp ON sp.project_id = p.id;

-- Step 3: Migrate assets to subprojects
-- Update assets to point to the corresponding subproject
UPDATE assets a
SET subproject_id = sp.id
FROM projects p
JOIN subprojects sp ON sp.project_id = p.id
WHERE a.project_id = p.id;

-- Note: Old tables (project_notes, feature_sets, mini_prds, etc.) are kept for now
-- They will be deprecated/removed in a future migration after verification

