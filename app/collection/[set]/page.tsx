import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getLive } from '@/lib/live'
import { getSets, rupees } from '@/lib/sets'
import { LAUNCH, DELIVERY, SIZES, SITE_URL, EXCHANGE } from '@/lib/site'
import { setButton } from '@/lib/state'
import { Plate } from '@/components/Plate'
import { Chip } from '@/components/Chip'
import { WaitlistForm } from '@/components/WaitlistForm'
import { ReserveButton } from '@/components/ReserveButton'
import { SizeTable } from '@/components/SizeTable'
import { Plus } from '@/components/Icons'

type P = { params: Promise<{ set: string }> }

export async function generateStaticParams() {
  return (await getSets()).map((s) => ({ set: s.slug }))
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { set: slug } = await params
  const set = (await getSets()).find((s) => s.slug === slug)
  if (!set) return {}
  return { title: set.name, description: `${set.line} ${rupees(set.price)}. Ten made, each numbered.` }
}

export default async function SetPage({ params }: P) {
  const [{ set: slug }, { phase, sets }] = await Promise.all([params, getLive()])
  const set = sets.find((s) => s.slug === slug)
  if (!set) notFound()
  const label = setButton(phase, set.left)
  const tone = set.motif % 2 ? 'ink' : 'sapphire'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${set.name}, Kalaverio Volume I`,
    description: set.line,
    brand: { '@type': 'Brand', name: 'Kalaverio' },
    image: set.photos.worn?.src ? [set.photos.worn.src] : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/collection/${set.slug}`,
      priceCurrency: 'INR',
      price: set.price,
      availability: set.left > 0 && phase !== 'closed-under' && phase !== 'closed-over' ? 'https://schema.org/PreOrder' : 'https://schema.org/SoldOut',
      availabilityStarts: LAUNCH.opensAt,
    },
  }

  return (
    <div className="wrap set-grid">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <div className="set-photos" tabIndex={0} aria-label={`Photographs of ${set.name}`}>
        <Plate cut={set.for === 'women' ? 'aline' : 'long'} photo={set.photos.worn} motif={set.motif} tone={tone} title={set.name} alt={`${set.name}, worn, front`} sizes="(min-width: 900px) 640px, 88vw" priority />
        <Plate cut={set.for === 'women' ? 'aline' : 'long'} photo={set.photos.flat} motif={set.motif} tone={tone === 'ink' ? 'sapphire' : 'ink'} view="flat" alt={`${set.name}, laid flat on ivory`} sizes="(min-width: 900px) 640px, 88vw" />
        <Plate photo={set.photos.closeup} motif={set.motif} tone={tone} view="closeup" ratio="r11" alt={`${set.name}, close-up of the zari border`} sizes="(min-width: 900px) 640px, 88vw" />
      </div>

      <aside className="set-buy">
        <h1 className="set-name">{set.name}</h1>
        <div className="set-price">
          <span className="nums" style={{ fontSize: 20, fontWeight: 500 }}>{rupees(set.price)}</span>
          <Chip phase={phase} left={set.left} run={set.runSize} />
        </div>
        <p className="set-line">{set.line}</p>

        {phase === 'open' && set.left > 0 ? (
          <form action={`/checkout/${set.slug}`} method="get" className="reserve">
            <fieldset className="sizes">
              <legend>Size</legend>
              {SIZES.map((s) => (
                <label key={s}><input type="radio" name="size" value={s} required /><span>{s}</span></label>
              ))}
            </fieldset>
            <div className="reserve-bar"><ReserveButton slug={set.slug} label={`${label} · ${rupees(set.price)}`} /></div>
          </form>
        ) : phase === 'before' || phase === 'open' ? (
          <div className="reserve">
            {phase === 'before' && (
              <fieldset className="sizes" disabled>
                <legend>Sizes, XS to XL, open on {LAUNCH.opensLabel}</legend>
                {SIZES.map((s) => (<label key={s}><input type="radio" name="size" value={s} /><span>{s}</span></label>))}
              </fieldset>
            )}
            <WaitlistForm source={phase === 'before' ? set.slug : `volume-ii:${set.slug}`} label={label} />
          </div>
        ) : (
          <div className="reserve"><button className="btn block" disabled>{label}</button></div>
        )}

        <ul className="promises">
          <li>No set is made until {LAUNCH.threshold} are paid for. Otherwise everyone is refunded in full.</li>
          <li>Ships {DELIVERY}.</li>
          <li>The gold is zari border tape: real metallic weave, not hand-embroidered zardozi.</li>
        </ul>

        <div className="folds">
          <details className="fold"><summary>The set <Plus /></summary><div><p>{set.details.fabric}</p><p>{set.details.fit}</p></div></details>
          <details className="fold"><summary>Size guide <Plus /></summary><div><SizeTable /><p style={{ marginTop: 12 }}>Between sizes? Take the larger. <a href="/policies#sizes">Full guide</a></p></div></details>
          <details className="fold"><summary>Delivery <Plus /></summary><div><p>Pay by 24 October. On {LAUNCH.decisionDate} we write to every buyer at once. If {LAUNCH.threshold} or more are paid for, your set is cut and ships {DELIVERY}.</p></div></details>
          <details className="fold"><summary>Refunds and care <Plus /></summary><div><p>If fewer than {LAUNCH.threshold} are paid for, you are refunded in full. {EXCHANGE}</p><p>{set.details.care}</p></div></details>
        </div>
      </aside>
    </div>
  )
}
