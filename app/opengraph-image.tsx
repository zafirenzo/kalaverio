import { ogCard, ogSize } from '@/lib/og/card'

export const size = ogSize
export const contentType = 'image/png'
export const alt = 'Kalaverio. Volume I: Sanctuary.'

export default function Image() {
  return ogCard({ title: 'Cut slowly.', sub: 'Volume I: Sanctuary. Six sets, sixty numbered places.' })
}
