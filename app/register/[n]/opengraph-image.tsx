import { ogCard, ogSize } from '@/lib/og/card'
import { getRegister } from '@/lib/db'
import { getSet } from '@/lib/sets'
import { pad2 } from '@/lib/state'

export const size = ogSize
export const contentType = 'image/png'
export const alt = 'A place in the Kalaverio Register'

export default async function Image({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params
  const r = (await getRegister().catch(() => [])).find((x) => x.register_number === Number(n))
  const set = r && (await getSet(r.set_slug))
  return ogCard({
    big: `Nº ${n}`,
    title: r?.display_name ?? 'Owner, name withheld',
    sub: set ? `${set.name} Nº ${pad2(r.set_number)} of ${set.runSize} · The Register` : 'The Register',
  })
}
