import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znjigshybzfakfvervyz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuamlnc2h5YnpmYWtmdmVydnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTgwMzEsImV4cCI6MjA3NDM3NDAzMX0.g5wHwY-sd0BSGlIWfRVKHH_FoVcn3YHcHPSkO0g3Rv0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
