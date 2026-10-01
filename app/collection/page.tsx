import Link from 'next/link'
import type { Metadata } from 'next'
import { getLive } from '@/lib/live'
import { SetCard } from '@/components/SetCard'

export const metadata: Metadata = { title: 'Collection', description: 'Volume I: Sanctuary. Six sets, ten of each, numbered.' }

const FILTERS = [['all', 'All'], ['men', 'Men'], ['women', 'Women']] as const

export default async function Collection({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const [{ phase, sets }, { for: f = 'all' }] = await Promise.all([getLive(), searchParams])
  const shown = f === 'men' || f === 'women' ? sets.filter((s) => s.for === f) : sets
  return (
    <>
      <section className="wrap page-head">
        <h1 className="sig">Volume I: Sanctuary</h1>
        <p className="lede mute" style={{ marginTop: 24, maxWidth: '46ch' }}>Six sets, ten of each. Every one is numbered, and its owner can take a place in the Register.</p>
      </section>
      <section className="wrap" style={{ paddingBottom: 'var(--section)' }}>
        <nav className="seg" aria-label="Filter sets">
          {FILTERS.map(([k, label]) => (
            <Link key={k} href={k === 'all' ? '/collection' : `/collection?for=${k}`} aria-current={f === k || (k === 'all' && !['men', 'women'].includes(f)) ? 'true' : undefined} scroll={false}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="sets-grid">
          {shown.map((s) => (
            <SetCard key={s.slug} set={s} phase={phase} sizes="(min-width: 1120px) 360px, (min-width: 700px) 33vw, 50vw" />
          ))}
        </div>
      </section>
    </>
  )
}
