import { revalidatePath, revalidateTag } from 'next/cache'
import { track } from '@vercel/analytics/server'
import { webhookSignatureOk } from '@/lib/razorpay'
import { markPaid, markRefunded, orderSlugByGatewayId } from '@/lib/db'
import { getSet, rupees } from '@/lib/sets'
import { sendReceipt } from '@/lib/email'

// Razorpay -> Settings -> Webhooks: point at /api/razorpay/webhook with events
// payment.captured and refund.processed. This is the only place an order becomes paid.
export async function POST(req: Request) {
  const raw = await req.text()
  if (!webhookSignatureOk(raw, req.headers.get('x-razorpay-signature') ?? '')) {
    return new Response('bad signature', { status: 401 })
  }
  const evt = JSON.parse(raw)

  if (evt.event === 'payment.captured') {
    const p = evt.payload.payment.entity as { id: string; order_id: string }
    const slug = await orderSlugByGatewayId(p.order_id)
    const set = slug && (await getSet(slug))
    if (!set) return new Response('unknown order', { status: 200 }) // not ours; don't make Razorpay retry
    const o = await markPaid(p.order_id, p.id, set.runSize)
    if (o?.fresh && o.status === 'paid') {
      await sendReceipt({
        to: o.email, buyerName: o.buyer_name, setName: set.name, size: o.size, amount: rupees(o.amount_paise / 100),
        registerNumber: o.register_number, setNumber: o.set_number, runSize: set.runSize, orderId: o.id,
      })
      await track('Paid order', { set: set.slug }).catch(() => {})
    }
    if (o?.fresh && o.status === 'refund_due') console.error('[oversold] refund due for order', o.id, 'payment', p.id)
  }

  if (evt.event === 'refund.processed') {
    await markRefunded(evt.payload.refund.entity.payment_id)
  }

  revalidateTag('orders', { expire: 0 })
  revalidatePath('/', 'layout')
  return Response.json({ ok: true })
}
