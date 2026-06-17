import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Overview from '../../pages/Overview'
import Leads from '../../pages/Leads'
import Schedule from '../../pages/Schedule'
import Team from '../../pages/Team'
import Content from '../../pages/Content'
import Marketing from '../../pages/Marketing'
import Notifications from '../../pages/Notifications'

/**
 * Thin route wrappers that adapt the existing prop-driven dashboard pages
 * to React Router. Pages are reused unchanged; navigation callbacks they
 * expect (onNavigate / onOpenLead) are translated into router navigation.
 */

// Map the legacy navKey vocabulary onto dashboard routes.
const NAV_PATHS = {
  overview: '/dashboard',
  leads: '/dashboard/leads',
  schedule: '/dashboard/schedule',
  team: '/dashboard/team',
  content: '/dashboard/content',
  marketing: '/dashboard/marketing',
  notifications: '/dashboard/notifications',
  admin: '/dashboard/admin',
}

function useDashNav() {
  const navigate = useNavigate()
  return (key) => navigate(NAV_PATHS[key] || '/dashboard')
}

export function OverviewRoute() {
  const { clientId } = useOutletContext()
  const navigate = useNavigate()
  const onNavigate = useDashNav()
  return (
    <Overview
      clientId={clientId}
      onOpenLead={(id) => navigate(`/dashboard/leads/${id}`)}
      onNavigate={onNavigate}
    />
  )
}

export function LeadsRoute() {
  const { clientId, userId } = useOutletContext()
  const navigate = useNavigate()
  const { id } = useParams()
  return (
    <Leads
      clientId={clientId}
      userId={userId}
      openLeadId={id || null}
      onOpenLead={(leadId) =>
        navigate(leadId ? `/dashboard/leads/${leadId}` : '/dashboard/leads')
      }
    />
  )
}

export function ScheduleRoute() {
  const { clientId } = useOutletContext()
  return <Schedule clientId={clientId} />
}

export function TeamRoute() {
  const { clientId } = useOutletContext()
  return <Team clientId={clientId} />
}

export function ContentRoute() {
  const { clientId } = useOutletContext()
  return <Content clientId={clientId} />
}

export function MarketingRoute() {
  const { clientId } = useOutletContext()
  return <Marketing clientId={clientId} />
}

export function NotificationsRoute() {
  const { clientId } = useOutletContext()
  const onNavigate = useDashNav()
  return <Notifications clientId={clientId} onNavigate={onNavigate} />
}
