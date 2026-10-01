// The launch state machine. Pure, so it can be tested without a server.

export type Phase = 'before' | 'open' | 'closed-under' | 'closed-over'

export function phaseAt(
  now: Date,
  totalPaid: number,
  cfg: { opensAt: string; closesAt: string; threshold: number },
  override?: string,
): Phase {
  const p =
    override === 'before' || override === 'open'
      ? override
      : override === 'closed' || now >= new Date(cfg.closesAt)
        ? 'closed'
        : now >= new Date(cfg.opensAt)
          ? 'open'
          : 'before'
  if (p !== 'closed') return p
  return totalPaid >= cfg.threshold ? 'closed-over' : 'closed-under'
}

export const left = (runSize: number, paid: number) => Math.max(0, runSize - paid)

export const pad2 = (n: number) => String(n).padStart(2, '0')
export const pad3 = (n: number) => String(n).padStart(3, '0')

// The words for each state, written once (the brief's table).
export function heroButton(phase: Phase) {
  return {
    before: { label: 'Join the waitlist', href: '#waitlist' },
    open: { label: 'Choose your set', href: '/collection' },
    'closed-under': { label: 'Follow the decision', href: '/register' },
    'closed-over': { label: 'See the Register', href: '/register' },
  }[phase]
}

export function setButton(phase: Phase, setsLeft: number) {
  if (phase === 'before') return 'Join the waitlist'
  if (phase !== 'open') return 'Closed'
  return setsLeft > 0 ? 'Reserve your set' : 'Join the waitlist for Volume II'
}

export function counter(phase: Phase, setsLeft: number, runSize: number, opensLabel: string, decisionDate: string) {
  if (phase === 'before') return { n: null, text: `Opens ${opensLabel}` }
  if (phase === 'closed-under') return { n: null, text: `Decision on ${decisionDate}` }
  if (phase === 'closed-over') return { n: null, text: 'In production' }
  if (setsLeft === 0) return { n: null, text: 'Sold out' }
  return { n: `Nº ${pad2(setsLeft)}`, text: `of ${runSize} left` }
}
