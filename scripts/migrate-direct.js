#!/usr/bin/env node

/**
 * Direct SQL Migration Script
 * 
 * Executes migrations directly via Supabase REST API
 * Requires SUPABASE_SERVICE_ROLE_KEY for DDL operations
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// This script just generates SQL files - no credentials needed

// This script only generates SQL files - no execution needed

async function main() {
  console.log('📝 Generating migration SQL file...\n')
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
  
  // Combine all migrations into one SQL file
  let combinedSQL = `-- Automated Migration Script
-- Generated: ${new Date().toISOString()}
-- This script creates the database schema

-- Run migrations in order\n\n`
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
    combinedSQL += `-- Migration: ${file}\n${content}\n\n`
  })
  
  const outputPath = path.join(__dirname, '..', 'supabase', 'migrate-all.sql')
  fs.writeFileSync(outputPath, combinedSQL)
  
  console.log(`✅ Combined migration SQL written to: ${outputPath}`)
  console.log('\nTo execute:')
  console.log('1. Open Supabase Dashboard > SQL Editor')
  console.log('2. Copy and paste the contents of migrate-all.sql')
  console.log('3. Click "Run"')
  console.log('\nOr use Supabase CLI:')
  console.log('  supabase db reset')
}

main().catch(console.error)

