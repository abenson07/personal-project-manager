#!/usr/bin/env node

/**
 * Test Task 2 Schema and CRUD Operations
 * Verifies all tables, constraints, and performs sample CRUD operations
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testSchema() {
  console.log('🧪 Testing Task 2 Schema\n')
  
  const results = {
    tables: {},
    crud: {},
    constraints: {}
  }
  
  // Test 1: Verify all tables exist
  console.log('📊 Step 1: Verifying tables exist...\n')
  const requiredTables = ['projects', 'subprojects', 'notes', 'task_comments', 'task_status']
  
  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('*').limit(0)
    if (error && error.message.includes('does not exist')) {
      results.tables[table] = false
      console.log(`   ✗ ${table} - does not exist`)
    } else {
      results.tables[table] = true
      console.log(`   ✓ ${table} - exists`)
    }
  }
  
  // Test 2: Test CRUD operations
  console.log('\n📝 Step 2: Testing CRUD operations...\n')
  
  try {
    // Create a test project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({ name: 'Test Project for Task 2' })
      .select()
      .single()
    
    if (projectError) {
      throw projectError
    }
    
    console.log(`   ✓ Created project: ${project.id}`)
    results.crud.createProject = true
    
    // Read the project
    const { data: readProject, error: readError } = await supabase
      .from('projects')
      .select()
      .eq('id', project.id)
      .single()
    
    if (readError || !readProject) {
      throw new Error('Failed to read project')
    }
    
    console.log(`   ✓ Read project: ${readProject.name}`)
    results.crud.readProject = true
    
    // Update the project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ name: 'Updated Test Project' })
      .eq('id', project.id)
      .select()
      .single()
    
    if (updateError || !updatedProject) {
      throw new Error('Failed to update project')
    }
    
    console.log(`   ✓ Updated project: ${updatedProject.name}`)
    results.crud.updateProject = true
    
    // Create a subproject
    const { data: subproject, error: subprojectError } = await supabase
      .from('subprojects')
      .insert({
        project_id: project.id,
        name: 'Test Subproject',
        mode: 'planned'
      })
      .select()
      .single()
    
    if (subprojectError) {
      throw subprojectError
    }
    
    console.log(`   ✓ Created subproject: ${subproject.id}`)
    results.crud.createSubproject = true
    
    // Create a note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        subproject_id: subproject.id,
        type: 'text',
        content: 'Test note content'
      })
      .select()
      .single()
    
    if (noteError) {
      throw noteError
    }
    
    console.log(`   ✓ Created note: ${note.id}`)
    results.crud.createNote = true
    
    // Create task status
    const { data: taskStatus, error: taskStatusError } = await supabase
      .from('task_status')
      .insert({
        subproject_id: subproject.id,
        task_id: 'test-task-1',
        status: 'todo'
      })
      .select()
      .single()
    
    if (taskStatusError) {
      throw taskStatusError
    }
    
    console.log(`   ✓ Created task status: ${taskStatus.id}`)
    results.crud.createTaskStatus = true
    
    // Create task comment
    const { data: taskComment, error: taskCommentError } = await supabase
      .from('task_comments')
      .insert({
        subproject_id: subproject.id,
        task_id: 'test-task-1',
        content: 'Test comment'
      })
      .select()
      .single()
    
    if (taskCommentError) {
      throw taskCommentError
    }
    
    console.log(`   ✓ Created task comment: ${taskComment.id}`)
    results.crud.createTaskComment = true
    
    // Test cascade delete
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)
    
    if (deleteError) {
      throw deleteError
    }
    
    // Verify cascade delete worked (subproject, note, task_status, task_comment should be deleted)
    const { data: deletedSubproject } = await supabase
      .from('subprojects')
      .select()
      .eq('id', subproject.id)
      .single()
    
    if (deletedSubproject) {
      console.log(`   ⚠️  Cascade delete may not be working (subproject still exists)`)
      results.crud.cascadeDelete = false
    } else {
      console.log(`   ✓ Cascade delete works (subproject deleted with project)`)
      results.crud.cascadeDelete = true
    }
    
    results.crud.deleteProject = true
    
  } catch (error) {
    console.error(`   ✗ CRUD test failed: ${error.message}`)
    results.crud.error = error.message
  }
  
  // Test 3: Test constraints
  console.log('\n🔒 Step 3: Testing constraints...\n')
  
  try {
    // Test invalid status
    const { error: invalidStatusError } = await supabase
      .from('projects')
      .insert({ name: 'Test', status: 'invalid_status' })
    
    if (invalidStatusError && invalidStatusError.message.includes('check constraint')) {
      console.log(`   ✓ Status constraint works (invalid status rejected)`)
      results.constraints.statusConstraint = true
    } else {
      console.log(`   ⚠️  Status constraint may not be working`)
      results.constraints.statusConstraint = false
    }
    
    // Test unique constraint on task_status
    const { data: testProject } = await supabase
      .from('projects')
      .insert({ name: 'Constraint Test Project' })
      .select()
      .single()
    
    const { data: testSubproject } = await supabase
      .from('subprojects')
      .insert({
        project_id: testProject.id,
        name: 'Constraint Test Subproject',
        mode: 'planned'
      })
      .select()
      .single()
    
    // Insert first task status
    await supabase
      .from('task_status')
      .insert({
        subproject_id: testSubproject.id,
        task_id: 'unique-test-task',
        status: 'todo'
      })
    
    // Try to insert duplicate
    const { error: uniqueError } = await supabase
      .from('task_status')
      .insert({
        subproject_id: testSubproject.id,
        task_id: 'unique-test-task',
        status: 'in_progress'
      })
    
    if (uniqueError && (uniqueError.message.includes('unique') || uniqueError.code === '23505')) {
      console.log(`   ✓ Unique constraint works (duplicate task_id rejected)`)
      results.constraints.uniqueConstraint = true
    } else {
      console.log(`   ⚠️  Unique constraint may not be working`)
      results.constraints.uniqueConstraint = false
    }
    
    // Cleanup
    await supabase.from('projects').delete().eq('id', testProject.id)
    
  } catch (error) {
    console.error(`   ✗ Constraint test failed: ${error.message}`)
    results.constraints.error = error.message
  }
  
  // Summary
  console.log('\n📊 Test Summary:\n')
  console.log('Tables:', Object.values(results.tables).every(v => v) ? '✓ All exist' : '✗ Some missing')
  console.log('CRUD:', Object.values(results.crud).filter(k => k !== 'error').every(v => v === true) ? '✓ All operations work' : '✗ Some failed')
  console.log('Constraints:', Object.values(results.constraints).filter(k => k !== 'error').every(v => v === true) ? '✓ All work' : '✗ Some failed')
  
  const allPassed = 
    Object.values(results.tables).every(v => v) &&
    Object.values(results.crud).filter(k => k !== 'error').every(v => v === true) &&
    Object.values(results.constraints).filter(k => k !== 'error').every(v => v === true)
  
  return allPassed
}

testSchema()
  .then((success) => {
    if (success) {
      console.log('\n✅ Task 2 schema tests passed!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Some tests failed. Please review above.')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })

