'use server'
import { headers } from 'next/headers'
import { addToWaitlist, insertOrder, attachGatewayOrder, paidCountsLive, db } from '@/lib/db'
import { getSet } from '@/lib/sets'
import { createGatewayOrder, paymentsReady, razorpayKeyId, checkoutSignatureOk } from '@/lib/razorpay'
import { LAUNCH, SIZES } from '@/lib/site'
import { phaseAt, left } from '@/lib/state'
import { normContact, normPhone, normRegisterName, EMAIL } from '@/lib/validate'

export type WaitlistState = { ok?: boolean; message?: string; error?: string }

// ponytail: per-instance memory throttle; move to the database if bots get past the honeypot
const recent = new Map<string, number>()

export async function joinWaitlist(_: WaitlistState, fd: FormData): Promise<WaitlistState> {
  if (fd.get('company')) return { ok: true, message: 'You are on the list.' } // honeypot
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  const now = Date.now()
  if (now - (recent.get(ip) ?? 0) < 8000) return { error: 'You just signed up. Wait a few seconds before trying again.' }

  const contact = normContact(String(fd.get('contact') ?? ''))
  if (!contact) return { error: 'Enter a 10-digit WhatsApp number or an email address.' }
  recent.set(ip, now)

  const source = String(fd.get('source') ?? 'site').slice(0, 40)
  const res = await addToWaitlist(contact, source)
  if (res === 'duplicate') return { ok: true, message: 'You are already on the list. We will write when pre-order opens.' }
  return { ok: true, message: `You are on the list. We will write on ${LAUNCH.opensLabel}, when pre-order opens.` }
}

export type CheckoutResult =
  | { ok: true; orderId: string; gatewayOrderId: string; keyId: string; amount: number; prefill: { name: string; email: string; contact: string } }
  | { ok: false; error?: string; fields?: Record<string, string> }

async function pinExists(pin: string) {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: AbortSignal.timeout(3000), cache: 'force-cache' })
    const [r] = await res.json()
    return r?.Status !== 'Error'
  } catch {
    return true // lookup service down: the format check already passed
  }
}

export async function createCheckout(fd: FormData): Promise<CheckoutResult> {
  const get = (k: string) => String(fd.get(k) ?? '').trim()
  const set = await getSet(get('set'))
  if (!set) return { ok: false, error: 'That set does not exist.' }

  const counts = await paidCountsLive()
  const paid = counts[set.slug] ?? 0
  const phase = phaseAt(new Date(), Object.values(counts).reduce((a, b) => a + b, 0), LAUNCH, process.env.LAUNCH_STATE)
  if (phase !== 'open') return { ok: false, error: 'Pre-order is not open right now.' }
  if (set.soldOut || left(set.runSize, paid) === 0) return { ok: false, error: `${set.name} has just sold out. Join the waitlist for Volume II on the set page.` }

  const f: Record<string, string> = {}
  const size = get('size')
  if (!(SIZES as readonly string[]).includes(size)) f.size = 'Choose a size.'
  const buyer = get('buyer_name')
  if (buyer.length < 2) f.buyer_name = 'Enter your full name.'
  const registerName = normRegisterName(get('register_name'))
  if (!registerName) f.register_name = 'Use your first name and the first letter of your last name, like Aarav S.'
  const phone = normPhone(get('phone'))
  if (!phone) f.phone = 'Enter a 10-digit WhatsApp number.'
  const email = get('email').toLowerCase()
  if (!EMAIL.test(email)) f.email = 'Enter an email address, like name@example.com.'
  const line = get('address'), city = get('city'), state = get('state'), pin = get('pin')
  if (line.length < 6) f.address = 'Enter your house number and street.'
  if (!city) f.city = 'Enter your city.'
  if (!state) f.state = 'Enter your state.'
  if (!/^[1-9]\d{5}$/.test(pin)) f.pin = 'Enter a 6-digit PIN code.'
  else if (!(await pinExists(pin))) f.pin = 'That PIN code does not exist. Check it and try again.'
  const adult = fd.get('adult') === 'on'
  const guardianName = get('guardian_name')
  const guardianPhone = normPhone(get('guardian_phone'))
  if (!adult && guardianName.length < 2) f.guardian_name = "Enter your parent or guardian's name."
  if (!adult && !guardianPhone) f.guardian_phone = "Enter your parent or guardian's 10-digit phone number."
  if (fd.get('ack') !== 'on') f.ack = 'Tick the box to confirm you have read the refund rule.'
  if (Object.keys(f).length) return { ok: false, fields: f }

  if (!paymentsReady || !db) return { ok: false, error: 'Payments are not connected yet. Add the Razorpay and Supabase keys to the environment.' }

  const amount = set.price * 100
  const orderId = await insertOrder({
    set_slug: set.slug, size, buyer_name: buyer, register_name: registerName,
    show_in_register: fd.get('show_in_register') === 'on', city, show_city: fd.get('show_city') === 'on',
    phone, email, address: `${line}, ${city}, ${state} ${pin}`, pin,
    is_minor: !adult, guardian_name: adult ? null : guardianName, guardian_phone: adult ? null : guardianPhone,
    amount_paise: amount,
  })
  const gatewayOrderId = await createGatewayOrder(amount, orderId.slice(0, 40))
  await attachGatewayOrder(orderId, gatewayOrderId)
  return { ok: true, orderId, gatewayOrderId, keyId: razorpayKeyId!, amount, prefill: { name: adult ? buyer : guardianName, email, contact: `+91${adult ? phone : guardianPhone}` } }
}

// The browser callback. Checked for tampering, but it never marks an order paid: only the webhook does.
export async function checkCallback(gatewayOrderId: string, paymentId: string, signature: string) {
  return checkoutSignatureOk(gatewayOrderId, paymentId, signature)
}
