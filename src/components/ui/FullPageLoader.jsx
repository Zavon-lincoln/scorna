import { Loader2 } from 'lucide-react'

/** Centered brand loader used while auth/session resolves. */
export default function FullPageLoader() {
  return (
    <div className="full-loader">
      <div className="wordmark">
        <em>S</em>CORNA
      </div>
      <Loader2 size={22} className="spin" color="var(--ash)" />
    </div>
  )
}
