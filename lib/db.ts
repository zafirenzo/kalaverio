import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
// Server-only, service role. Never import this file from a client component.
export const db = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null

function need() {
  if (!db) throw new Error('Supabase is not configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).')
  return db
}

// Live count, uncached: checkout uses this so nobody pays for a set that is gone.
export async function paidCountsLive(): Promise<Record<string, number>> {
  if (!db) return {}
  const { data, error } = await db.from('orders').select('set_slug').eq('status', 'paid')
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const r of data) counts[r.set_slug] = (counts[r.set_slug] ?? 0) + 1
  return counts
}

// Cached for pages; the webhook revalidates the 'orders' tag the moment a payment lands.
export const paidCounts = unstable_cache(paidCountsLive, ['paid-counts'], { tags: ['orders'], revalidate: 30 })

export type RegisterRow = { register_number: number; display_name: string | null; set_slug: string; set_number: number; city: string | null }

export const getRegister = unstable_cache(
  async (): Promise<RegisterRow[]> => {
    if (!db) return []
    const { data, error } = await db.from('register_public').select('*').order('register_number')
    if (error) throw error
    return data
  },
  ['register'],
  { tags: ['orders'], revalidate: 30 },
)

export async function insertOrder(row: Record<string, unknown>) {
  const { data, error } = await need().from('orders').insert(row).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function attachGatewayOrder(id: string, gatewayOrderId: string) {
  const { error } = await need().from('orders').update({ gateway_order_id: gatewayOrderId }).eq('id', id)
  if (error) throw error
}

// Only what the confirmation page shows; the id is an unguessable uuid.
export async function getOrderPublic(id: string) {
  if (!db || !/^[0-9a-f-]{36}$/.test(id)) return null
  const { data } = await db
    .from('orders')
    .select('id, set_slug, size, status, register_number, set_number, register_name, show_in_register, gateway_order_id')
    .eq('id', id)
    .maybeSingle()
  return data
}

export async function markPaid(gatewayOrderId: string, paymentId: string, runSize: number) {
  const { data, error } = await need().rpc('mark_order_paid', {
    p_gateway_order_id: gatewayOrderId,
    p_payment_id: paymentId,
    p_run_size: runSize,
  })
  if (error) throw error
  return data as null | { fresh: boolean; id: string; status: string; set_slug: string; size: string; email: string; buyer_name: string; register_number: number; set_number: number; amount_paise: number }
}

export async function markRefunded(paymentId: string) {
  const { error } = await need().rpc('mark_order_refunded', { p_payment_id: paymentId })
  if (error) throw error
}

export async function orderSlugByGatewayId(gatewayOrderId: string) {
  const { data } = await need().from('orders').select('set_slug').eq('gateway_order_id', gatewayOrderId).maybeSingle()
  return data?.set_slug as string | undefined
}

const devWaitlist = new Set<string>()

export async function addToWaitlist(contact: string, source: string): Promise<'ok' | 'duplicate'> {
  if (!db) {
    if (process.env.NODE_ENV === 'production') need()
    console.warn('[waitlist] Supabase not configured; keeping in memory:', contact)
    if (devWaitlist.has(contact)) return 'duplicate'
    devWaitlist.add(contact)
    return 'ok'
  }
  const { error } = await db.from('waitlist').insert({ contact, source })
  if (error?.code === '23505') return 'duplicate'
  if (error) throw error
  return 'ok'
}
