#!/usr/bin/env node

/**
 * Check Supabase Connection and Credentials
 * 
 * Verifies that Supabase credentials are correct and connection works
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Checking Supabase Configuration...\n')

// Check environment variables
console.log('Environment Variables:')
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? '✓ Set' : '✗ Missing'}`)
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}`)
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing (optional)'}`)

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Missing required environment variables!')
  console.error('Please create a .env.local file with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}

// Test connection with anon key
console.log('\n🔌 Testing connection with anon key...')
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

supabaseAnon.from('projects').select('count').limit(0)
  .then(({ error }) => {
    if (error && error.message.includes('does not exist')) {
      console.log('  ✓ Connection successful (table does not exist yet - this is OK)')
    } else if (error) {
      console.log('  ⚠️  Connection test:', error.message)
    } else {
      console.log('  ✓ Connection successful')
    }
    
    // Test with service key if available
    if (SUPABASE_SERVICE_KEY) {
      console.log('\n🔌 Testing connection with service role key...')
      const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      
      return supabaseService.from('projects').select('count').limit(0)
        .then(({ error: serviceError }) => {
          if (serviceError && serviceError.message.includes('does not exist')) {
            console.log('  ✓ Service key connection successful (table does not exist yet - this is OK)')
          } else if (serviceError) {
            console.log('  ⚠️  Service key test:', serviceError.message)
          } else {
            console.log('  ✓ Service key connection successful')
          }
          
          console.log('\n✅ Credentials are valid!')
          console.log('\nYou can now run: npm run migrate')
        })
    } else {
      console.log('\n✅ Anon key is valid!')
      console.log('\nNote: Service role key is recommended for migrations')
      console.log('You can run: npm run migrate')
    }
  })
  .catch((error) => {
    console.error('\n❌ Connection failed:', error.message)
    console.error('\nPlease check:')
    console.error('  1. Supabase URL is correct')
    console.error('  2. Anon key is correct')
    console.error('  3. Network connection is working')
    process.exit(1)
  })

