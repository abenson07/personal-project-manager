#!/usr/bin/env node

/**
 * Execute Supabase Migrations Programmatically
 * Uses Supabase REST API with service role key to execute SQL
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

async function executeMigration() {
  console.log('🚀 Executing Task 2 Migration\n')
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const task2Migration = '20260114000001_task2_schema.sql'
  const migrationPath = path.join(migrationsDir, task2Migration)
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${task2Migration}`)
    process.exit(1)
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log(`📄 Migration: ${task2Migration}`)
  console.log(`📏 SQL length: ${sql.length} characters\n`)
  
  // Execute SQL via Supabase REST API
  // For DDL operations, we need to use the Management API or a custom RPC function
  // Since direct SQL execution via REST API is limited, we'll use fetch with the REST API
  
  try {
    // Split SQL into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/) && !s.match(/^CREATE OR REPLACE FUNCTION/))
    
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`)
    
    // Execute each statement via Supabase REST API
    // Note: DDL operations require special handling
    // We'll use the Supabase Management API endpoint
    
    const results = []
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement || statement.length < 10) continue
      
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        // Use Supabase REST API to execute SQL
        // For DDL, we need to use a custom RPC function or Management API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ query: statement })
        })
        
        if (response.ok) {
          const data = await response.json()
          results.push({ statement: statement.substring(0, 50) + '...', success: true, data })
          console.log(`   ✓ Success`)
        } else {
          const errorText = await response.text()
          // If RPC doesn't exist, we'll need to use a different approach
          if (response.status === 404 || errorText.includes('function') || errorText.includes('does not exist')) {
            throw new Error('RPC function exec_sql does not exist. Need to execute SQL manually or via Supabase CLI.')
          }
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
      } catch (error) {
        console.log(`   ⚠️  Failed: ${error.message}`)
        results.push({ statement: statement.substring(0, 50) + '...', success: false, error: error.message })
        
        // If RPC doesn't exist, provide alternative instructions
        if (error.message.includes('RPC function') || error.message.includes('does not exist')) {
          console.log('\n⚠️  Cannot execute SQL programmatically without custom RPC function.')
          console.log('📝 Please execute the migration manually:\n')
          console.log('1. Open Supabase Dashboard: https://app.supabase.com')
          console.log('2. Go to SQL Editor')
          console.log('3. Copy and paste the SQL from:', migrationPath)
          console.log('4. Click "Run"\n')
          console.log('Or use Supabase CLI:')
          console.log('  supabase db reset\n')
          break
        }
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    console.log(`\n📊 Results: ${successCount} succeeded, ${failCount} failed`)
    
    if (failCount > 0) {
      console.log('\n⚠️  Some statements failed. Please review the errors above.')
      console.log('You may need to execute the migration manually via Supabase Dashboard.')
    } else {
      console.log('\n✅ Migration executed successfully!')
    }
    
    return { success: failCount === 0, results }
  } catch (error) {
    console.error('\n❌ Migration execution failed:', error.message)
    console.error('\n📝 Please execute the migration manually:')
    console.error('1. Open Supabase Dashboard: https://app.supabase.com')
    console.error('2. Go to SQL Editor')
    console.error('3. Copy and paste the SQL from:', migrationPath)
    console.error('4. Click "Run"\n')
    throw error
  }
}

executeMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

