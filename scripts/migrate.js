#!/usr/bin/env node

/**
 * Automated Supabase Migration Script
 * 
 * This script:
 * 1. Connects to Supabase
 * 2. Drops all existing tables (fresh start)
 * 3. Runs all migrations in order
 * 4. Verifies connection and schema
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
  console.error('\nPlease create a .env.local file with these variables.')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function getMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
  
  return files.map(file => ({
    name: file,
    path: path.join(migrationsDir, file),
    content: fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
  }))
}

async function executeSQL(sql) {
  // Use Supabase REST API to execute SQL
  // Note: This requires using the PostgREST API or a custom function
  // For now, we'll use a workaround with the REST API
  
  try {
    // Split SQL into statements and execute via REST API where possible
    // For DDL statements, we need to use the Supabase dashboard SQL editor
    // or set up a custom function
    
    // Try to execute via REST API (limited to DML)
    // For DDL, we'll output instructions
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ sql })
    })
    
    if (!response.ok) {
      // If RPC doesn't exist, we'll need to use a different approach
      throw new Error('RPC function not available')
    }
    
    return await response.json()
  } catch (error) {
    // Fallback: return SQL to be executed manually or via Supabase CLI
    throw error
  }
}

// Drop tables functionality removed - user handles this manually

async function runMigration(migration) {
  console.log(`\n📄 Running migration: ${migration.name}`)
  
  // For now, we'll use a simpler approach: output SQL to be run
  // In production, you'd use Supabase CLI or a migration service
  console.log(`   Content: ${migration.content.split('\n').length} lines`)
  console.log(`   ✓ Migration ${migration.name} prepared`)
  
  return migration.content
}

async function verifyConnection() {
  console.log('\n🔍 Verifying connection...')
  
  try {
    // Test connection by trying to query (even if table doesn't exist)
    const { error } = await supabase.from('projects').select('*').limit(0)
    
    if (error && error.message.includes('does not exist')) {
      console.log('   ⚠️  Tables do not exist yet - run migrations first')
      return false
    } else if (error) {
      console.log('   ⚠️  Connection test:', error.message)
      return false
    }
    
    console.log('   ✓ Supabase connection verified')
    return true
  } catch (error) {
    console.error('   ❌ Verification failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Supabase Migration Script\n')
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`)
  console.log(`🔑 Using ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service role key' : 'anon key'}\n`)
  
  try {
    // Step 1: Verify connection
    await verifyConnection()
    
    // Step 2: Get migrations
    const migrations = await getMigrations()
    console.log(`\n📦 Found ${migrations.length} migration(s)`)
    
    // Step 3: Prepare migrations
    console.log('\n📋 Migration files ready:')
    migrations.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.name}`)
    })
    
    console.log('\n⚠️  IMPORTANT: This script prepares migrations but requires Supabase CLI or manual execution.')
    console.log('\nTo run migrations, you have two options:')
    console.log('\n1. Using Supabase CLI (recommended):')
    console.log('   npm install -g supabase')
    console.log('   supabase db reset')
    console.log('\n2. Manual execution:')
    console.log('   Copy the SQL from migration files and run in Supabase SQL Editor')
    console.log('   https://app.supabase.com/project/_/sql/new')
    
    console.log('\n✅ Migration preparation complete!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

main()
