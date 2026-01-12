#!/usr/bin/env node

/**
 * Execute Supabase Migrations via Direct PostgreSQL Connection
 * Uses pg library to connect directly to Supabase database
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

async function executeMigration() {
  console.log('🚀 Executing Task 2 Migration via Direct Database Connection\n')
  
  if (!DATABASE_URL && !SUPABASE_URL) {
    console.error('❌ Missing DATABASE_URL or SUPABASE_URL')
    console.error('Please set DATABASE_URL in .env.local')
    console.error('Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres')
    console.error('You can find this in Supabase Dashboard > Settings > Database > Connection string')
    process.exit(1)
  }
  
  // If we have SUPABASE_URL but not DATABASE_URL, we need to construct it
  // But we'd need the password, which isn't in env vars
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local')
    console.error('Please add DATABASE_URL to .env.local')
    console.error('You can find it in Supabase Dashboard > Settings > Database')
    console.error('Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres')
    process.exit(1)
  }
  
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
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })
  
  try {
    await client.connect()
    console.log('✅ Connected to database\n')
    
    // Execute the SQL
    console.log('⏳ Executing migration...\n')
    await client.query(sql)
    
    console.log('✅ Migration executed successfully!\n')
    
    // Verify tables were created
    console.log('🔍 Verifying tables...\n')
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('projects', 'subprojects', 'notes', 'task_comments', 'task_status')
      ORDER BY table_name
    `)
    
    const tables = tablesResult.rows.map(r => r.table_name)
    console.log('📊 Created tables:')
    tables.forEach(table => {
      console.log(`   ✓ ${table}`)
    })
    
    if (tables.length === 5) {
      console.log('\n✅ All 5 required tables created successfully!')
    } else {
      console.log(`\n⚠️  Expected 5 tables, found ${tables.length}`)
    }
    
    await client.end()
    return { success: true, tables }
  } catch (error) {
    console.error('\n❌ Migration execution failed:', error.message)
    console.error('\nError details:', error)
    await client.end().catch(() => {})
    throw error
  }
}

executeMigration()
  .then(() => {
    console.log('\n✅ Task 2 migration complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed')
    process.exit(1)
  })

