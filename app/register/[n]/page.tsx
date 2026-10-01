import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getRegister } from '@/lib/db'
import { getSet } from '@/lib/sets'
import { pad2, pad3 } from '@/lib/state'
import { Arrow } from '@/components/Icons'

type P = { params: Promise<{ n: string }> }

async function row(n: string) {
  if (!/^\d{3}$/.test(n)) return null
  const r = (await getRegister().catch(() => [])).find((x) => x.register_number === Number(n))
  if (!r) return null
  return { r, set: await getSet(r.set_slug) }
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { n } = await params
  const x = await row(n)
  if (!x) return { title: `Nº ${n}` }
  const who = x.r.display_name ?? 'An owner'
  return { title: `Nº ${n} in the Register`, description: `${who} holds ${x.set?.name} Nº ${pad2(x.r.set_number)} of ${x.set?.runSize}.` }
}

export default async function RegisterRow({ params }: P) {
  const { n } = await params
  const x = await row(n)
  if (!x) notFound()
  const { r, set } = x
  return (
    <section className="sapphire reg-card">
      <div className="wrap">
        <p className="reg-card-n serif nums">Nº {pad3(r.register_number)}</p>
        <h1 className="sig">{r.display_name ?? 'Owner, name withheld'}</h1>
        <p className="lede" style={{ color: 'var(--on-dark-mute)' }}>
          {set?.name} Nº {pad2(r.set_number)} of {set?.runSize}{r.city ? ` · ${r.city}` : ''}
        </p>
        <p className="label" style={{ color: 'var(--gold)', marginTop: 24 }}>Zarbafini, Volume I: Sanctuary</p>
        <Link href={`/register#${pad3(r.register_number)}`} className="link-arrow">See the full Register <Arrow /></Link>
      </div>
    </section>
  )
}
