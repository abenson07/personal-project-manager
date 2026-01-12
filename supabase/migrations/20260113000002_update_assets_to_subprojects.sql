-- Update assets table to reference subprojects instead of projects
-- First, add new subproject_id column
ALTER TABLE assets ADD COLUMN subproject_id UUID REFERENCES subprojects(id) ON DELETE CASCADE;

-- Note: We cannot automatically migrate assets without knowing which subproject they belong to
-- This will be handled in the data migration script
-- For now, we keep project_id for backward compatibility

-- Create index for new column
CREATE INDEX IF NOT EXISTS idx_assets_subproject_id ON assets(subproject_id);

