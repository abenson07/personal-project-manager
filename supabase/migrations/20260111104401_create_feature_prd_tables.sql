-- Create feature_versions table
CREATE TABLE IF NOT EXISTS feature_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_set_id UUID NOT NULL REFERENCES feature_sets(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  definition TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mini_prds table (status enum will be added in later migration)
CREATE TABLE IF NOT EXISTS mini_prds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  feature_set_id UUID NOT NULL REFERENCES feature_sets(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned', -- Will be converted to enum in later migration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mini_prd_tasks table (type enum will be added in later migration)
CREATE TABLE IF NOT EXISTS mini_prd_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mini_prd_id UUID NOT NULL REFERENCES mini_prds(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'development', -- Will be converted to enum in later migration
  description TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tests table (test_type enum will be added in later migration)
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mini_prd_id UUID NOT NULL REFERENCES mini_prds(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL DEFAULT 'unit', -- Will be converted to enum in later migration
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for mini_prds.updated_at
CREATE TRIGGER update_mini_prds_updated_at
  BEFORE UPDATE ON mini_prds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

