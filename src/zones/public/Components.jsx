import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'

/**
 * Internal component library browser (admin only). Placeholder for the
 * foundation phase — the PreviewApp component browser is ported here later.
 */
export default function Components() {
  return (
    <div className="zone-placeholder zone-fade">
      <div className="glass-card">
        <LayoutGrid size={28} color="var(--bone)" />
        <h2 className="text-h2">Component Library</h2>
        <p className="text-body">
          The internal component browser used for client-site deployment will
          render here. Admin-gated and intentionally unlinked from the public
          nav.
        </p>
        <Link to="/dashboard" className="btn btn-default">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
