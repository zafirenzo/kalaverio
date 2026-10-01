import Link from 'next/link'
import { Plate } from './Plate'
import { Chip } from './Chip'
import { rupees } from '@/lib/sets'
import type { LiveSet } from '@/lib/live'
import type { Phase } from '@/lib/state'

export function SetCard({ set, phase, sizes }: { set: LiveSet; phase: Phase; sizes: string }) {
  return (
    <Link href={`/collection/${set.slug}`} className="card">
      <Plate cut={set.for === 'women' ? 'aline' : 'long'} photo={set.photos.worn} motif={set.motif} tone={set.motif % 2 ? 'ink' : 'sapphire'} alt={`${set.name}, worn`} sizes={sizes} />
      <span className="card-name serif">{set.name}</span>
      <span className="card-meta">
        <span className="nums">{rupees(set.price)}</span>
        <Chip phase={phase} left={set.left} run={set.runSize} />
      </span>
    </Link>
  )
}
