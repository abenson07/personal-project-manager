import { supabase } from '../supabase'

describe('Supabase Client', () => {
  it('should create a Supabase client instance', () => {
    expect(supabase).toBeDefined()
  })

  it('should have the correct URL from environment variables', () => {
    const expectedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    expect(expectedUrl).toBeDefined()
    expect(expectedUrl).toBeTruthy()
  })

  it('should have the correct anon key from environment variables', () => {
    const expectedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    expect(expectedKey).toBeDefined()
    expect(expectedKey).toBeTruthy()
  })
})

