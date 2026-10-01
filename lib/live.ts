import 'server-only'
import { getSets, type ZSet } from './sets'
import { paidCounts } from './db'
import { LAUNCH } from './site'
import { phaseAt, left, type Phase } from './state'

export type LiveSet = ZSet & { paid: number; left: number }

export async function getLive(): Promise<{ phase: Phase; sets: LiveSet[]; totalLeft: number; totalRun: number; totalPaid: number }> {
  const [sets, counts] = await Promise.all([getSets(), paidCounts().catch(() => ({}) as Record<string, number>)])
  const live = sets.map((s) => {
    const paid = counts[s.slug] ?? 0
    return { ...s, paid, left: s.soldOut ? 0 : left(s.runSize, paid) }
  })
  const totalPaid = live.reduce((a, s) => a + s.paid, 0)
  return {
    phase: phaseAt(new Date(), totalPaid, LAUNCH, process.env.LAUNCH_STATE),
    sets: live,
    totalLeft: live.reduce((a, s) => a + s.left, 0),
    totalRun: live.reduce((a, s) => a + s.runSize, 0),
    totalPaid,
  }
}
