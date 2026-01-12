import { supabase } from '../supabase'

describe('Database Schema', () => {
  it('should connect to Supabase', async () => {
    const { data, error } = await supabase.from('projects').select('*').limit(1)
    expect(error).toBeNull()
  })

  it('should have projects table with correct structure', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, phase, created_at, updated_at')
      .limit(1)
    
    expect(error).toBeNull()
    // Table exists and is queryable
  })

  it('should enforce foreign key constraints', async () => {
    // Try to insert a project_note with invalid project_id
    const { error } = await supabase
      .from('project_notes')
      .insert({
        project_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID
        content: 'Test note'
      })
    
    // Should fail due to foreign key constraint
    expect(error).not.toBeNull()
  })

  it('should support enum types', async () => {
    // Create a project with valid enum value
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: 'Test Project',
        phase: 'concept'
      })
      .select()
      .single()
    
    expect(error).toBeNull()
    expect(data?.phase).toBe('concept')

    // Clean up
    if (data?.id) {
      await supabase.from('projects').delete().eq('id', data.id)
    }
  })

  it('should have all required tables', async () => {
    const tables = [
      'projects',
      'project_notes',
      'assets',
      'feature_sets',
      'feature_versions',
      'mini_prds',
      'mini_prd_tasks',
      'tests'
    ]

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1)
      expect(error).toBeNull()
    }
  })
})

