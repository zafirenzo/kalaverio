import Link from 'next/link'
import type { Metadata } from 'next'
import { getRegister } from '@/lib/db'
import { getLive } from '@/lib/live'
import { pad2, pad3 } from '@/lib/state'
import { RegisterGrid } from '@/components/RegisterGrid'
import { Share } from '@/components/Icons'

export const metadata: Metadata = { title: 'The Register', description: 'Every set is numbered. Every owner is listed, if they choose.' }

export default async function Register() {
  const [rows, { sets, totalRun }] = await Promise.all([getRegister().catch(() => []), getLive()])
  const byN = new Map(rows.map((r) => [r.register_number, r]))
  const setOf = (slug: string) => sets.find((s) => s.slug === slug)

  return (
    <>
      <section className="wrap page-head reg-head">
        <div className="stack" style={{ '--s': '24px' } as React.CSSProperties}>
          <h1 className="sig">The Register</h1>
          <p className="lede">Every set is numbered. Every owner is listed, if they choose.</p>
          <p className="reg-count serif nums"><span>{rows.length}</span> of {totalRun} places taken</p>
        </div>
        <RegisterGrid rows={rows} total={totalRun} />
      </section>

      <section className="wrap" style={{ paddingBottom: 'var(--section)' }}>
        <ol className="reg-list">
          {Array.from({ length: totalRun }, (_, i) => {
            const n = i + 1
            const r = byN.get(n)
            if (!r) {
              return (
                <li key={n} className="reg-row open" id={pad3(n)}>
                  <span className="reg-n serif nums">Nº {pad3(n)}</span>
                  <span className="mute">Nº {pad3(n)} is open</span>
                </li>
              )
            }
            const s = setOf(r.set_slug)
            return (
              <li key={n} className="reg-row" id={pad3(n)}>
                <span className="reg-n serif nums">Nº {pad3(n)}</span>
                <span className="reg-name">{r.display_name ?? <span className="mute">Owner, name withheld</span>}</span>
                <span className="reg-set">{s?.name ?? r.set_slug} <span className="label">Nº {pad2(r.set_number)} of {s?.runSize ?? 10}</span></span>
                <span className="reg-city mute">{r.city}</span>
                <Link href={`/register/${pad3(n)}`} className="reg-share" aria-label={`Share place Nº ${pad3(n)}`}><Share /> Share</Link>
              </li>
            )
          })}
        </ol>
        <p className="mute" style={{ marginTop: 32, maxWidth: '60ch', fontSize: 14, lineHeight: '22px' }}>
          Rows appear once the bank confirms a payment and leave if an order is refunded. Names are first name and last initial, shown only when the owner, or a guardian for anyone under 18, chose it. No photographs, phone numbers or emails are ever listed.
        </p>
      </section>
    </>
  )
}
