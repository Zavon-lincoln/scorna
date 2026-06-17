import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

/**
 * Public website wrapper. Has its own navbar (distinct from the admin
 * ZoneNav) — this is the chrome used for Scorna's marketing site and the
 * basis for deployed client sites.
 */
export default function PublicLayout() {
  const { session } = useAuthContext()

  return (
    <div className="public-shell">
      <header className="public-nav">
        <Link to="/" className="wordmark public-nav-brand">
          <em>S</em>CORNA
        </Link>
        <nav className="public-nav-links">
          <a href="#process" className="public-nav-link">
            How it works
          </a>
          <a href="#contact" className="public-nav-link">
            Free audit
          </a>
          {session ? (
            <NavLink to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </NavLink>
          ) : (
            <NavLink to="/login" className="btn btn-default btn-sm">
              Sign in
            </NavLink>
          )}
        </nav>
      </header>

      <main className="public-main zone-fade">
        <Outlet />
      </main>

      <footer className="public-foot">
        <span className="wordmark" style={{ fontSize: 14 }}>
          <em>S</em>CORNA
        </span>
        <span className="text-meta">
          © {new Date().getFullYear()} Scorna — Execution. Clarity. Growth.
        </span>
      </footer>
    </div>
  )
}
