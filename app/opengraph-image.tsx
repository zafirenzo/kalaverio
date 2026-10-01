import { ogCard, ogSize } from '@/lib/og/card'

export const size = ogSize
export const contentType = 'image/png'
export const alt = 'Zarbafini. Woven gold. Volume I: Sanctuary.'

export default function Image() {
  return ogCard({ title: 'Woven gold.', sub: 'Volume I: Sanctuary. Six sets, sixty numbered places.' })
}
