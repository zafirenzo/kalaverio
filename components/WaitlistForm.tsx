'use client'
import { useActionState } from 'react'
import { track } from '@vercel/analytics'
import { joinWaitlist, type WaitlistState } from '@/app/actions'

export function WaitlistForm({ source, label = 'Join the waitlist', id }: { source: string; label?: string; id?: string }) {
  const [state, action, pending] = useActionState(async (prev: WaitlistState, fd: FormData) => {
    const next = await joinWaitlist(prev, fd)
    if (next.ok) track('Waitlist signup', { source })
    return next
  }, {})
  const errId = `${id ?? source}-err`
  if (state.ok) {
    return (
      <p role="status" className="fade-in" style={{ minHeight: 48, display: 'flex', alignItems: 'center' }}>
        {state.message}
      </p>
    )
  }
  return (
    <form action={action} id={id} className="waitlist" noValidate>
      <label className="sr" htmlFor={`${id ?? source}-contact`}>WhatsApp number or email</label>
      <input type="hidden" name="source" value={source} />
      <input className="sr" tabIndex={-1} autoComplete="off" name="company" aria-hidden="true" />
      <input id={`${id ?? source}-contact`} className="input" name="contact" placeholder="WhatsApp number or email" autoComplete="email"
        required aria-invalid={state.error ? true : undefined} aria-describedby={state.error ? errId : undefined} />
      <button className="btn" disabled={pending}>
        {pending ? 'Adding…' : label}
      </button>
      {state.error && <p id={errId} className="err" role="alert" style={{ gridColumn: '1 / -1' }}>{state.error}</p>}
    </form>
  )
}
