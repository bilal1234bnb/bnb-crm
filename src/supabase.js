import { createClient } from '@supabase/supabase-js'

// These values come from your Supabase project settings
// You will replace BOTH values after creating your Supabase project
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
