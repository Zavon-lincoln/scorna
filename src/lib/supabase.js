import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ozigpqntoognbffufhmh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWdwcW50b29nbmJmZnVmaG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4OTA2NjIsImV4cCI6MjA5NjQ2NjY2Mn0.Kk6FuV0z5W3HfAI-Stm9GNl80ocTr6IWT3g62NcpU8o'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
