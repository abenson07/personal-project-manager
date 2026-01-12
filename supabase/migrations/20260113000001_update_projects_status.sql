-- Update projects table to use status instead of phase
-- First, add new status column
ALTER TABLE projects ADD COLUMN status project_status_enum;

-- Migrate existing phase values to status
-- concept -> planning, prd -> in_progress, completed -> complete
UPDATE projects SET status = 'planning' WHERE phase = 'concept';
UPDATE projects SET status = 'in_progress' WHERE phase = 'prd';
UPDATE projects SET status = 'complete' WHERE phase = 'completed';

-- Set default and make NOT NULL
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'planning';
ALTER TABLE projects ALTER COLUMN status SET NOT NULL;

-- Note: We keep the phase column temporarily for rollback capability
-- It will be removed in a later migration after verification

