import 'server-only'
import { SITE_URL, LAUNCH, DELIVERY, SELLER } from './site'
import { pad2, pad3 } from './state'

type Receipt = { to: string; buyerName: string; setName: string; size: string; amount: string; registerNumber: number; setNumber: number; runSize: number; orderId: string }

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

export async function sendReceipt(r: Receipt) {
  const key = process.env.RESEND_API_KEY
  if (!key) return console.warn('[email] RESEND_API_KEY missing; receipt not sent for', r.orderId)
  const nº = pad3(r.registerNumber)
  const html = `
  <div style="background:#F5F0E8;padding:40px 24px;font-family:Georgia,serif;color:#0B0F1A">
    <div style="max-width:520px;margin:0 auto">
      <p style="letter-spacing:.3em;font-size:12px;margin:0 0 32px">KALAVERIO</p>
      <h1 style="font-weight:400;font-size:32px;line-height:40px;margin:0 0 8px">You are Nº ${nº} in the Register.</h1>
      <div style="width:48px;height:1px;background:#C9A227;margin:16px 0 24px"></div>
      <p style="font-family:Arial,sans-serif;font-size:16px;line-height:26px">Thank you, ${esc(r.buyerName)}. Your payment for <b>${esc(r.setName)}</b>, size ${esc(r.size)}, is confirmed. Your set is ${esc(r.setName)} Nº ${pad2(r.setNumber)} of ${r.runSize}.</p>
      <table style="font-family:Arial,sans-serif;font-size:15px;line-height:24px;border-collapse:collapse;width:100%;margin:24px 0">
        <tr><td style="padding:6px 0;color:#5B6070">Order</td><td style="text-align:right">${esc(r.orderId.slice(0, 8).toUpperCase())}</td></tr>
        <tr><td style="padding:6px 0;color:#5B6070">Paid</td><td style="text-align:right">${esc(r.amount)}</td></tr>
        <tr><td style="padding:6px 0;color:#5B6070">Register</td><td style="text-align:right">Nº ${nº}</td></tr>
      </table>
      <p style="font-family:Arial,sans-serif;font-size:16px;line-height:26px">What happens next: no set is made until ${LAUNCH.threshold} are paid for. On ${LAUNCH.decisionDate} we write to everyone at once. If we reach ${LAUNCH.threshold}, your set is cut and ships ${DELIVERY}. If we don't, you are refunded in full.</p>
      <p style="font-family:Arial,sans-serif;font-size:16px;line-height:26px"><a style="color:#0B2A6F" href="${SITE_URL}/register/${nº}">See your place in the Register</a></p>
      <p style="font-family:Arial,sans-serif;font-size:13px;line-height:20px;color:#5B6070;margin-top:40px">Kalaverio, by Zafirenzo · ${esc(SELLER.email)}</p>
    </div>
  </div>`
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'Kalaverio <orders@kalaverio.com>',
      to: r.to,
      subject: `Nº ${nº}: your Kalaverio pre-order is confirmed`,
      html,
    }),
  })
  if (!res.ok) console.error('[email] Resend failed', res.status, await res.text())
}
