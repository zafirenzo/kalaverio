import { ogCard, ogSize } from '@/lib/og/card'
import { getSet } from '@/lib/sets'

export const size = ogSize
export const contentType = 'image/png'
export const alt = 'A Kalaverio set'

export default async function Image({ params }: { params: Promise<{ set: string }> }) {
  const set = await getSet((await params).set)
  return ogCard({ title: set?.name ?? 'Kalaverio', sub: set ? `INR ${set.price.toLocaleString('en-IN')} · Ten made, each numbered. Volume I: Sanctuary.` : 'Volume I: Sanctuary' })
}
