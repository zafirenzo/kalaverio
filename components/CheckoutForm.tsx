'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCheckout, checkCallback } from '@/app/actions'
import { SIZES, LAUNCH } from '@/lib/site'

type Rzp = { open: () => void; on: (e: string, cb: () => void) => void }
declare global { interface Window { Razorpay?: new (o: object) => Rzp } }

function loadRazorpay() {
  return new Promise<void>((ok, fail) => {
    if (window.Razorpay) return ok()
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => ok()
    s.onerror = () => fail(new Error('Could not load the payment window. Check your connection and try again.'))
    document.body.appendChild(s)
  })
}

// Outside the form component so inputs keep their typed values across re-renders.
function F({ name, label, hint, err, ...rest }: { name: string; label: string; hint?: string; err?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" name={name} id={name} aria-invalid={err ? true : undefined}
        aria-describedby={[hint && `${name}-hint`, err && `${name}-err`].filter(Boolean).join(' ') || undefined} {...rest} />
      {hint && <small id={`${name}-hint`}>{hint}</small>}
      {err && <span id={`${name}-err`} className="err">{err}</span>}
    </label>
  )
}

export function CheckoutForm({ slug, size, price, setName }: { slug: string; size: string; price: string; setName: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [adult, setAdult] = useState(false)
  const [ack, setAck] = useState(false)
  const [pending, setPending] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError('')
    try {
      const res = await createCheckout(new FormData(e.currentTarget))
      if (!res.ok) {
        setFields(res.fields ?? {})
        setError(res.error ?? (res.fields ? 'Some details need fixing. They are marked below.' : ''))
        const first = res.fields && Object.keys(res.fields)[0]
        if (first) requestAnimationFrame(() => (formRef.current?.querySelector(`[name="${first}"]`) as HTMLElement | null)?.focus())
        return setPending(false)
      }
      setFields({})
      await loadRazorpay()
      const rzp = new window.Razorpay!({
        key: res.keyId,
        amount: res.amount,
        currency: 'INR',
        name: 'Kalaverio',
        description: `${setName}, pre-order`,
        order_id: res.gatewayOrderId,
        prefill: res.prefill,
        theme: { color: '#0B2A6F' },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await checkCallback(r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature)
          router.push(`/thanks?order=${res.orderId}`)
        },
        modal: {
          ondismiss: () => {
            setPending(false)
            setError('Payment was not completed and nothing was charged. Your details are still here; press Pay to try again.')
          },
        },
      })
      rzp.on('payment.failed', () => setError('The bank declined the payment. Try another card or UPI app.'))
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="co-form" noValidate>
      <input type="hidden" name="set" value={slug} />
      {error && <p className="co-alert" role="alert">{error}</p>}

      <fieldset className="sizes">
        <legend>Size</legend>
        {SIZES.map((s) => (
          <label key={s}><input type="radio" name="size" value={s} defaultChecked={s === size} required /><span>{s}</span></label>
        ))}
        {fields.size && <span className="err" style={{ flexBasis: '100%' }}>{fields.size}</span>}
      </fieldset>

      <fieldset className="co-group">
        <legend>You</legend>
        <F err={fields.buyer_name} name="buyer_name" label="Full name" autoComplete="name" required />
        <div className="co-two">
          <F err={fields.phone} name="phone" label="WhatsApp number" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" hint="For order updates. Never shown." required />
          <F err={fields.email} name="email" label="Email" type="email" autoComplete="email" hint="For your receipt. Never shown." required />
        </div>
      </fieldset>

      <fieldset className="co-group">
        <legend>Delivery</legend>
        <F err={fields.address} name="address" label="House, street and area" autoComplete="street-address" required />
        <div className="co-three">
          <F err={fields.city} name="city" label="City" autoComplete="address-level2" required />
          <F err={fields.state} name="state" label="State" autoComplete="address-level1" required />
          <F err={fields.pin} name="pin" label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={6} pattern="[1-9][0-9]{5}" required />
        </div>
      </fieldset>

      <fieldset className="co-group">
        <legend>Age</legend>
        <label className="check">
          <input type="checkbox" name="adult" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
          <span>I am 18 or over.</span>
        </label>
        {!adult && (
          <div className="co-guardian fade-in">
            <p className="mute">Under 18? A parent or guardian pays. Add their details, or tick the box above if you are 18 or over.</p>
            <div className="co-two">
              <F err={fields.guardian_name} name="guardian_name" label="Guardian's full name" autoComplete="off" />
              <F err={fields.guardian_phone} name="guardian_phone" label="Guardian's phone" type="tel" inputMode="numeric" autoComplete="off" />
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="co-group">
        <legend>The Register</legend>
        <F err={fields.register_name} name="register_name" label="Name for the Register" autoComplete="off" placeholder="Aarav S." hint="First name and the first letter of your last name. Your Nº is printed beside it." required />
        <label className="check">
          <input type="checkbox" name="show_in_register" />
          <span>{adult ? 'Show my name in the public Register.' : 'My guardian agrees to show my name in the public Register.'} <span className="mute">Off unless ticked; your row then reads “Owner, name withheld”.</span></span>
        </label>
        <label className="check">
          <input type="checkbox" name="show_city" />
          <span>Show my city beside it.</span>
        </label>
      </fieldset>

      <label className="check co-ack">
        <input type="checkbox" name="ack" checked={ack} onChange={(e) => setAck(e.target.checked)} aria-describedby={fields.ack ? 'ack-err' : undefined} />
        <span>I understand no set is made until {LAUNCH.threshold} are paid for, and that I am refunded in full if that does not happen by 24 October.</span>
      </label>
      {fields.ack && <span id="ack-err" className="err">{fields.ack}</span>}

      <button className="btn block" disabled={!ack || pending} aria-describedby="pay-note">
        {pending ? 'Opening payment…' : `Pay ${price}`}
      </button>
      <p id="pay-note" className="mute" style={{ fontSize: 14, lineHeight: '22px' }}>
        {ack ? 'Card, UPI or netbanking through Razorpay. Your Nº is assigned when the bank confirms.' : 'Tick the box above to enable payment.'}
      </p>
    </form>
  )
}
