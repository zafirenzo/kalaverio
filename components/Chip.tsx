import { counter, type Phase } from '@/lib/state'
import { LAUNCH } from '@/lib/site'

// "Nº 07 of 10 left": ink chip, gold numeral. Words follow the launch state.
export function Chip({ phase, left, run }: { phase: Phase; left: number; run: number }) {
  const c = counter(phase, left, run, LAUNCH.opensLabel, LAUNCH.decisionDate)
  return (
    <span className="chip label" style={{ fontSize: 11 }}>
      {c.n && <b>{c.n}</b>}
      {c.text}
    </span>
  )
}
