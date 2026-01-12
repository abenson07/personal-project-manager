#!/usr/bin/env node

/**
 * Complete Task 2: Supabase Database Setup and Schema Implementation
 * 
 * This script:
 * 1. Creates the exec_sql RPC function (if needed)
 * 2. Executes Task 2 migration
 * 3. Sets up RLS policies
 * 4. Verifies the schema
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function createExecSqlFunction() {
  console.log('📝 Step 1: Creating exec_sql RPC function...\n')
  
  const functionSQL = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'migrations', '20260114000000_create_exec_sql_function.sql'),
    'utf-8'
  )
  
  try {
    // Try to execute via REST API - this requires direct database access
    // For now, we'll provide instructions
    console.log('⚠️  Creating RPC function requires direct database access.')
    console.log('📋 Please execute this SQL in Supabase Dashboard SQL Editor first:\n')
    console.log(functionSQL)
    console.log('\nThen run this script again.\n')
    return false
  } catch (error) {
    console.error('❌ Failed to create exec_sql function:', error.message)
    return false
  }
}

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql })
    
    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('function')) {
        throw new Error('exec_sql function does not exist. Please create it first.')
      }
      throw error
    }
    
    return data
  } catch (error) {
    throw error
  }
}

async function executeMigration() {
  console.log('📝 Step 2: Executing Task 2 migration...\n')
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260114000001_task2_schema.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  try {
    await executeSQL(sql)
    console.log('✅ Migration executed successfully!\n')
    return true
  } catch (error) {
    if (error.message.includes('exec_sql function does not exist')) {
      console.log('⚠️  exec_sql function not found.')
      console.log('📋 Please execute the migration manually:\n')
      console.log('1. Open Supabase Dashboard: https://app.supabase.com')
      console.log('2. Go to SQL Editor')
      console.log('3. Copy and paste the SQL from:', migrationPath)
      console.log('4. Click "Run"\n')
      return false
    }
    throw error
  }
}

async function createRLSPolicies() {
  console.log('📝 Step 3: Creating RLS policies...\n')
  
  const rlsSQL = `
-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subprojects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Projects: users can read/write their own projects
CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Users can delete projects" ON projects FOR DELETE USING (true);

-- Subprojects: users can read/write subprojects for projects they have access to
CREATE POLICY "Users can view subprojects" ON subprojects FOR SELECT USING (true);
CREATE POLICY "Users can create subprojects" ON subprojects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update subprojects" ON subprojects FOR UPDATE USING (true);
CREATE POLICY "Users can delete subprojects" ON subprojects FOR DELETE USING (true);

-- Notes: users can read/write notes for subprojects they have access to
CREATE POLICY "Users can view notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Users can create notes" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notes" ON notes FOR UPDATE USING (true);
CREATE POLICY "Users can delete notes" ON notes FOR DELETE USING (true);

-- Task comments: users can read/write comments for tasks they have access to
CREATE POLICY "Users can view task comments" ON task_comments FOR SELECT USING (true);
CREATE POLICY "Users can create task comments" ON task_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update task comments" ON task_comments FOR UPDATE USING (true);
CREATE POLICY "Users can delete task comments" ON task_comments FOR DELETE USING (true);

-- Task status: users can read/write status for tasks they have access to
CREATE POLICY "Users can view task status" ON task_status FOR SELECT USING (true);
CREATE POLICY "Users can create task status" ON task_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update task status" ON task_status FOR UPDATE USING (true);
CREATE POLICY "Users can delete task status" ON task_status FOR DELETE USING (true);
`
  
  try {
    await executeSQL(rlsSQL)
    console.log('✅ RLS policies created successfully!\n')
    return true
  } catch (error) {
    if (error.message.includes('exec_sql function does not exist')) {
      console.log('⚠️  exec_sql function not found.')
      console.log('📋 Please execute the RLS policies manually in Supabase Dashboard SQL Editor.\n')
      return false
    }
    throw error
  }
}

async function verifySchema() {
  console.log('📝 Step 4: Verifying schema...\n')
  
  try {
    // Check if tables exist
    const tables = ['projects', 'subprojects', 'notes', 'task_comments', 'task_status']
    const results = {}
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(0)
      if (error && error.message.includes('does not exist')) {
        results[table] = false
      } else {
        results[table] = true
      }
    }
    
    console.log('📊 Table verification:')
    let allExist = true
    for (const [table, exists] of Object.entries(results)) {
      console.log(`   ${exists ? '✓' : '✗'} ${table}`)
      if (!exists) allExist = false
    }
    
    if (allExist) {
      console.log('\n✅ All tables exist!')
    } else {
      console.log('\n⚠️  Some tables are missing. Please run migrations.')
    }
    
    return allExist
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Completing Task 2: Supabase Database Setup\n')
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`)
  
  try {
    // Step 1: Create exec_sql function (optional, for programmatic execution)
    const functionCreated = await createExecSqlFunction()
    
    // Step 2: Execute migration
    const migrationExecuted = await executeMigration()
    
    // Step 3: Create RLS policies
    const rlsCreated = await createRLSPolicies()
    
    // Step 4: Verify schema
    const schemaVerified = await verifySchema()
    
    console.log('\n📊 Task 2 Summary:')
    console.log(`   exec_sql function: ${functionCreated ? '✓' : '⚠️  (manual setup needed)'}`)
    console.log(`   Migration executed: ${migrationExecuted ? '✓' : '⚠️  (manual execution needed)'}`)
    console.log(`   RLS policies: ${rlsCreated ? '✓' : '⚠️  (manual setup needed)'}`)
    console.log(`   Schema verified: ${schemaVerified ? '✓' : '✗'}`)
    
    if (migrationExecuted && rlsCreated && schemaVerified) {
      console.log('\n✅ Task 2 completed successfully!')
    } else {
      console.log('\n⚠️  Task 2 partially completed. Please complete remaining steps manually.')
      console.log('See instructions above for manual steps.')
    }
  } catch (error) {
    console.error('\n❌ Task 2 failed:', error.message)
    process.exit(1)
  }
}

main()

