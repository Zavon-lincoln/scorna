import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'

/**
 * App-wide auth context. Wraps the existing useAuth hook so router-mounted
 * layouts, route guards, and pages can read auth state without prop drilling.
 *
 * Shape (from useAuth): { session, user, role, clientId, clientName, loading,
 * signOut, refresh }.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuthContext must be used within an <AuthProvider>')
  }
  return ctx
}
