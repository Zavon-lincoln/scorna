import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ozigpqntoognbffufhmh.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWdwcW50b29nbmJmZnVmaG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4OTA2NjIsImV4cCI6MjA5NjQ2NjY2Mn0.Kk6FuV0z5W3HfAI-Stm9GNl80ocTr6IWT3g62NcpU8o'
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aWdwcW50b29nbmJmZnVmaG1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg5MDY2MiwiZXhwIjoyMDk2NDY2NjYyfQ.IrlTA4IlkPILRypNPZmb8ZUzXKYIJVoQkG3FCdPxC-I'

// Whether the core connection is configured. App.jsx shows a setup screen
// when this is false rather than crashing on a blank page.
export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isConfigured) {
  // Surfaced loudly during dev so misconfiguration is obvious.
  console.error(
    'Missing Supabase env vars. Copy .env.example to .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

// Fall back to a syntactically-valid placeholder URL so createClient never
// throws at import time when env vars are absent (App handles the UX).
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co'
const safeAnonKey = supabaseAnonKey || 'placeholder'

// Standard client — respects Row Level Security. Used for all normal app traffic.
export const supabase = createClient(safeUrl, safeAnonKey)

// Admin client — uses the service role key and BYPASSES RLS.
// SECURITY: the service role key is bundled into the client here for the
// admin "God-mode" view. Before production, move all admin operations
// (user creation/deletion, cross-client reads) into a Supabase Edge Function
// so the service role key never ships to the browser. See
// supabase/functions/admin-users/index.ts for a starting point.
// A second storageKey keeps the admin session from clobbering the user session.
export const supabaseAdmin = createClient(
  safeUrl,
  supabaseServiceRoleKey || safeAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: 'scorna-admin-auth',
    },
  }
)

// Whether admin features can function (service role key present).
export const hasServiceRole = Boolean(supabaseServiceRoleKey)
