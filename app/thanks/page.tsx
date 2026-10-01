import Link from 'next/link'
import type { Metadata } from 'next'
import { getOrderPublic } from '@/lib/db'
import { getSet } from '@/lib/sets'
import { LAUNCH, DELIVERY } from '@/lib/site'
import { pad2, pad3 } from '@/lib/state'
import { Refresh } from '@/components/Refresh'
import { Arrow } from '@/components/Icons'

export const metadata: Metadata = { title: 'Thank you', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function Thanks({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order = '' } = await searchParams
  const o = await getOrderPublic(order)
  const set = o && (await getSet(o.set_slug))

  if (!o || !set) {
    return (
      <section className="wrap page-head thanks">
        <h1 className="sig">We could not find that order.</h1>
        <p className="lede">If you paid, your receipt is on its way by email. Write to us with the payment ID from your bank and we will find it.</p>
        <Link href="/register" className="link-arrow">See the Register <Arrow /></Link>
      </section>
    )
  }

  const ref = o.id.slice(0, 8).toUpperCase()

  if (o.status === 'created') {
    return (
      <section className="wrap page-head thanks" aria-live="polite">
        <Refresh every={3000} />
        <h1 className="sig">Confirming your payment.</h1>
        <p className="lede">The bank is confirming your payment for {set.name}, size {o.size}. This usually takes a few seconds; this page updates by itself.</p>
        <p className="mute">Order {ref}. If it takes longer than a few minutes, your receipt will still arrive by email once the bank confirms.</p>
      </section>
    )
  }

  if (o.status !== 'paid') {
    return (
      <section className="wrap page-head thanks">
        <h1 className="sig">{o.status === 'refunded' ? 'This order was refunded.' : `${set.name} filled while you paid.`}</h1>
        <p className="lede">
          {o.status === 'refunded'
            ? 'The refund has been sent to the account you paid from. Banks take 5 to 7 working days to show it.'
            : 'The last place went to someone a moment before you. You will be refunded in full within 5 to 7 working days; nothing else is needed from you.'}
        </p>
        <p className="mute">Order {ref}</p>
      </section>
    )
  }

  const nº = pad3(o.register_number!)
  return (
    <section className="wrap page-head thanks">
      <p className="thanks-no serif nums" aria-hidden="true">Nº {nº}</p>
      <h1 className="sig">You are Nº {nº} in the Register.</h1>
      <dl className="thanks-dl">
        <div><dt>Order</dt><dd>{ref}</dd></div>
        <div><dt>Set</dt><dd>{set.name} Nº {pad2(o.set_number!)} of {set.runSize}, size {o.size}</dd></div>
        <div><dt>Register</dt><dd>{o.show_in_register ? `${o.register_name}, listed` : 'Owner, name withheld'}</dd></div>
      </dl>
      <p className="lede">Next: on {LAUNCH.decisionDate} we write to every buyer at once. If {LAUNCH.threshold} or more sets are paid for, yours is cut and ships {DELIVERY}. If not, you are refunded in full. A receipt is on its way by email.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Link href={`/register/${nº}`} className="btn">See your place <Arrow /></Link>
        <Link href="/register" className="btn secondary">The full Register</Link>
      </div>
    </section>
  )
}
