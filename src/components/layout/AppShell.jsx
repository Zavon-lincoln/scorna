import { Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import ZoneNav from './ZoneNav'

/**
 * Outermost wrapper for every route.
 * Renders the void background + ambient ember glows (via .app-bg) and,
 * for admins inside an authenticated zone, the persistent ZoneNav for
 * switching between Dashboard and Blueprint.
 */
export default function AppShell() {
  const { user } = useAuthContext()
  const location = useLocation()

  const inAuthedZone =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/blueprint')
  const showZoneNav = user?.role === 'admin' && inAuthedZone

  return (
    <div className={`app-bg${showZoneNav ? ' with-zonenav' : ''}`}>
      {showZoneNav && <ZoneNav />}
      <Outlet />
    </div>
  )
}
