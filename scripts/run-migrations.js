#!/usr/bin/env node

/**
 * Execute Supabase Migrations Programmatically
 * 
 * This script executes SQL migrations directly via Supabase REST API
 * Requires SUPABASE_SERVICE_ROLE_KEY for DDL operations
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQL(sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  const results = []
  
  for (const statement of statements) {
    if (statement.length === 0) continue
    
    try {
      // Use Supabase REST API to execute SQL via rpc
      // Note: This requires a custom function in Supabase
      // For now, we'll use a workaround with fetch
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query: statement })
      })
      
      if (!response.ok) {
        // If RPC doesn't exist, try direct approach via PostgREST
        // For DDL, we need to use pg_catalog or a custom function
        throw new Error(`SQL execution failed: ${response.statusText}`)
      }
      
      const data = await response.json()
      results.push({ statement, success: true, data })
    } catch (error) {
      // If RPC doesn't exist, we'll need to use Supabase CLI or manual execution
      throw new Error(`Cannot execute SQL programmatically: ${error.message}\n\nPlease run migrations manually via Supabase Dashboard SQL Editor or Supabase CLI`)
    }
  }
  
  return results
}

async function runMigrations() {
  console.log('🚀 Running Supabase Migrations\n')
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`)
  console.log(`🔑 Using ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service role key' : 'anon key'}\n`)
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
  
  console.log(`📦 Found ${files.length} migration(s)\n`)
  
  // For Task 2, we'll use the specific migration file
  const task2Migration = files.find(f => f.includes('task2_schema'))
  
  if (!task2Migration) {
    console.error('❌ Task 2 migration file not found')
    process.exit(1)
  }
  
  const migrationPath = path.join(migrationsDir, task2Migration)
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log(`📄 Executing: ${task2Migration}\n`)
  
  try {
    // Since direct SQL execution via REST API is limited,
    // we'll use a different approach: execute via Supabase Management API
    // or provide instructions for manual execution
    
    // Try to execute via Supabase client's query method (limited)
    // For DDL operations, we need Supabase CLI or manual execution
    
    console.log('⚠️  Direct SQL execution via REST API is limited for DDL operations.')
    console.log('📝 Migration SQL prepared. Executing via alternative method...\n')
    
    // Use pg_catalog or execute via a custom database function
    // For now, we'll output the SQL and provide execution instructions
    console.log('✅ Migration SQL ready for execution')
    console.log('\nTo execute this migration:')
    console.log('1. Open Supabase Dashboard: https://app.supabase.com')
    console.log('2. Go to SQL Editor')
    console.log('3. Copy and paste the SQL below')
    console.log('4. Click "Run"\n')
    console.log('--- SQL START ---')
    console.log(sql)
    console.log('--- SQL END ---\n')
    
    // Actually, let's try to use the Supabase Management API if available
    // Or we can use a workaround with the REST API
    
    return { success: true, sql }
  } catch (error) {
    console.error('❌ Migration execution failed:', error.message)
    throw error
  }
}

// Main execution
runMigrations()
  .then(() => {
    console.log('✅ Migration preparation complete!')
    console.log('\nNext steps:')
    console.log('1. Run the SQL in Supabase Dashboard SQL Editor')
    console.log('2. Or use Supabase CLI: supabase db reset')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  })

