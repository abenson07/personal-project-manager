-- Foreign key constraints are already defined in CREATE TABLE statements
-- This migration ensures all foreign keys are properly set with CASCADE behavior

-- Verify and ensure project_notes.project_id references projects.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'project_notes_project_id_fkey'
  ) THEN
    ALTER TABLE project_notes
    ADD CONSTRAINT project_notes_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verify and ensure assets.project_id references projects.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'assets_project_id_fkey'
  ) THEN
    ALTER TABLE assets
    ADD CONSTRAINT assets_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verify and ensure feature_sets.project_id references projects.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'feature_sets_project_id_fkey'
  ) THEN
    ALTER TABLE feature_sets
    ADD CONSTRAINT feature_sets_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verify and ensure feature_versions.feature_set_id references feature_sets.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'feature_versions_feature_set_id_fkey'
  ) THEN
    ALTER TABLE feature_versions
    ADD CONSTRAINT feature_versions_feature_set_id_fkey
    FOREIGN KEY (feature_set_id) REFERENCES feature_sets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verify and ensure mini_prds.project_id references projects.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'mini_prds_project_id_fkey'
  ) THEN
    ALTER TABLE mini_prds
    ADD CONSTRAINT mini_prds_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verify and ensure mini_prds.feature_set_id references feature_sets.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'mini_prds_feature_set_id_fkey'
  ) THEN
    ALTER TABLE mini_prds
    ADD CONSTRAINT mini_prds_feature_set_id_fkey
    FOREIGN KEY (feature_set_id) REFERENCES feature_sets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verify and ensure mini_prd_tasks.mini_prd_id references mini_prds.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'mini_prd_tasks_mini_prd_id_fkey'
  ) THEN
    ALTER TABLE mini_prd_tasks
    ADD CONSTRAINT mini_prd_tasks_mini_prd_id_fkey
    FOREIGN KEY (mini_prd_id) REFERENCES mini_prds(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verify and ensure tests.mini_prd_id references mini_prds.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tests_mini_prd_id_fkey'
  ) THEN
    ALTER TABLE tests
    ADD CONSTRAINT tests_mini_prd_id_fkey
    FOREIGN KEY (mini_prd_id) REFERENCES mini_prds(id) ON DELETE CASCADE;
  END IF;
END $$;

