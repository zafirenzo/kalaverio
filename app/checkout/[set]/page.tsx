import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getLive } from '@/lib/live'
import { rupees } from '@/lib/sets'
import { LAUNCH, SIZES, DELIVERY } from '@/lib/site'
import { Plate } from '@/components/Plate'
import { CheckoutForm } from '@/components/CheckoutForm'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

export default async function Checkout({ params, searchParams }: { params: Promise<{ set: string }>; searchParams: Promise<{ size?: string }> }) {
  const [{ set: slug }, { size }, { phase, sets }] = await Promise.all([params, searchParams, getLive()])
  const set = sets.find((s) => s.slug === slug)
  if (!set) notFound()
  if (phase !== 'open' || set.left === 0) redirect(`/collection/${slug}`)
  const chosen = (SIZES as readonly string[]).includes(size ?? '') ? size! : ''

  return (
    <div className="wrap checkout">
      <div className="checkout-main">
        <h1 className="sig" style={{ fontSize: 'clamp(34px, 5vw, 48px)', lineHeight: 1.15 }}>Reserve {set.name}</h1>
        <p className="rule-box">
          <b>One rule:</b> no set is made until {LAUNCH.threshold} are paid for. If fewer than {LAUNCH.threshold} are paid for by 24 October, everyone is refunded in full.
        </p>
        <CheckoutForm slug={set.slug} size={chosen} price={rupees(set.price)} setName={set.name} />
      </div>
      <aside className="checkout-summary">
        <Plate cut={set.for === 'women' ? 'aline' : 'long'} photo={set.photos.worn} motif={set.motif} tone={set.motif % 2 ? 'ink' : 'sapphire'} title={set.name} alt={`${set.name}, worn`} sizes="(min-width: 900px) 360px, 40vw" />
        <dl>
          <div><dt>Set</dt><dd>{set.name}</dd></div>
          <div><dt>Left</dt><dd className="nums">{set.left} of {set.runSize}</dd></div>
          <div><dt>Ships</dt><dd>{DELIVERY}</dd></div>
          <div><dt>Total</dt><dd className="nums" style={{ fontWeight: 600 }}>{rupees(set.price)} <span className="mute" style={{ fontWeight: 400, fontSize: 14 }}>incl. GST</span></dd></div>
        </dl>
      </aside>
    </div>
  )
}
