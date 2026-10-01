import Link from 'next/link'
import type { RegisterRow } from '@/lib/db'
import { pad3 } from '@/lib/state'

// Sixty places, filling in order. Taken places are sapphire and link to their row; open ones stay quiet.
export function RegisterGrid({ rows, total }: { rows: RegisterRow[]; total: number }) {
  const taken = new Map(rows.map((r) => [r.register_number, r]))
  return (
    <ol className="reg-grid" aria-label={`${rows.length} of ${total} places taken`}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const r = taken.get(n)
        return (
          <li key={n}>
            {r ? (
              <Link href={`/register/${pad3(n)}`} className="cell taken label" title={r.display_name ?? 'Owner, name withheld'}>
                {pad3(n)}
              </Link>
            ) : (
              <span className="cell label" aria-label={`Nº ${pad3(n)} is open`}>{pad3(n)}</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
