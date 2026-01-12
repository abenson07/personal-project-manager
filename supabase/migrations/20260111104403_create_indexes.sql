-- Create indexes on foreign key columns for better join performance

-- Project-related indexes
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_feature_sets_project_id ON feature_sets(project_id);
CREATE INDEX IF NOT EXISTS idx_mini_prds_project_id ON mini_prds(project_id);

-- Feature-related indexes
CREATE INDEX IF NOT EXISTS idx_feature_versions_feature_set_id ON feature_versions(feature_set_id);
CREATE INDEX IF NOT EXISTS idx_mini_prds_feature_set_id ON mini_prds(feature_set_id);

-- Mini PRD-related indexes
CREATE INDEX IF NOT EXISTS idx_mini_prd_tasks_mini_prd_id ON mini_prd_tasks(mini_prd_id);
CREATE INDEX IF NOT EXISTS idx_tests_mini_prd_id ON tests(mini_prd_id);

-- Create indexes on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase);
CREATE INDEX IF NOT EXISTS idx_mini_prds_status ON mini_prds(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_mini_prds_created_at ON mini_prds(created_at);
CREATE INDEX IF NOT EXISTS idx_mini_prd_tasks_completed ON mini_prd_tasks(completed);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_projects_phase_created_at ON projects(phase, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mini_prds_project_status ON mini_prds(project_id, status);

