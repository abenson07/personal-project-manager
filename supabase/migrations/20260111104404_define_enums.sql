-- Create remaining enum types
CREATE TYPE mini_prd_status_enum AS ENUM ('planned', 'in_development', 'ready_for_review', 'completed');
CREATE TYPE task_type_enum AS ENUM ('development', 'testing', 'review', 'deployment');
CREATE TYPE test_type_enum AS ENUM ('unit', 'integration', 'e2e', 'manual');

-- Convert mini_prds.status from TEXT to enum
-- First, ensure all existing values are valid enum values
UPDATE mini_prds SET status = 'planned' WHERE status NOT IN ('planned', 'in_development', 'ready_for_review', 'completed');

-- Add new column with enum type
ALTER TABLE mini_prds ADD COLUMN status_enum mini_prd_status_enum;

-- Populate the enum column
UPDATE mini_prds SET status_enum = status::mini_prd_status_enum;

-- Make it NOT NULL
ALTER TABLE mini_prds ALTER COLUMN status_enum SET NOT NULL;

-- Drop old column and rename new one
ALTER TABLE mini_prds DROP COLUMN status;
ALTER TABLE mini_prds RENAME COLUMN status_enum TO status;

-- Convert mini_prd_tasks.type from TEXT to enum
-- First, ensure all existing values are valid enum values
UPDATE mini_prd_tasks SET type = 'development' WHERE type NOT IN ('development', 'testing', 'review', 'deployment');

-- Add new column with enum type
ALTER TABLE mini_prd_tasks ADD COLUMN type_enum task_type_enum;

-- Populate the enum column
UPDATE mini_prd_tasks SET type_enum = type::task_type_enum;

-- Make it NOT NULL
ALTER TABLE mini_prd_tasks ALTER COLUMN type_enum SET NOT NULL;

-- Drop old column and rename new one
ALTER TABLE mini_prd_tasks DROP COLUMN type;
ALTER TABLE mini_prd_tasks RENAME COLUMN type_enum TO type;

-- Convert tests.test_type from TEXT to enum
-- First, ensure all existing values are valid enum values
UPDATE tests SET test_type = 'unit' WHERE test_type NOT IN ('unit', 'integration', 'e2e', 'manual');

-- Add new column with enum type
ALTER TABLE tests ADD COLUMN test_type_enum test_type_enum;

-- Populate the enum column
UPDATE tests SET test_type_enum = test_type::test_type_enum;

-- Make it NOT NULL
ALTER TABLE tests ALTER COLUMN test_type_enum SET NOT NULL;

-- Drop old column and rename new one
ALTER TABLE tests DROP COLUMN test_type;
ALTER TABLE tests RENAME COLUMN test_type_enum TO test_type;

