import { FileText } from 'lucide-react'

/**
 * Internal Blueprint Generator zone (admin only). Placeholder for the
 * foundation phase — the multi-step builder, live cost calculator, and
 * PDF document are ported from scorna-blueprint in a later phase.
 */
export default function BlueprintLayout() {
  return (
    <div className="zone-placeholder zone-fade">
      <div className="glass-card">
        <FileText size={28} color="var(--ember-glow)" />
        <h2 className="text-h2">Blueprint Generator</h2>
        <p className="text-body">
          The audit blueprint builder lives here. This zone is routable and
          admin-gated — the builder steps, live cost calculator, and PDF export
          are ported in the Blueprint phase.
        </p>
      </div>
    </div>
  )
}
