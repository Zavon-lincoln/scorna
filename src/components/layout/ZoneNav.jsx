import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'

/**
 * Slim top-level bar for switching between authenticated zones.
 * Admin-only — client users never see it. Rendered by AppShell on the
 * /dashboard and /blueprint zones.
 */
export default function ZoneNav() {
  const { user, signOut } = useAuthContext()

  return (
    <div className="zonenav glass-base">
      <NavLink to="/dashboard" className="wordmark zonenav-brand">
        <em>S</em>CORNA
      </NavLink>

      <nav className="zonenav-tabs">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `zonenav-tab${isActive ? ' active' : ''}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/blueprint"
          className={({ isActive }) =>
            `zonenav-tab${isActive ? ' active' : ''}`
          }
        >
          Blueprint
        </NavLink>
      </nav>

      <div className="zonenav-user">
        <span className="zonenav-name">{user?.full_name || user?.email}</span>
        <button
          className="btn btn-sm btn-default"
          onClick={signOut}
          aria-label="Sign out"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  )
}
