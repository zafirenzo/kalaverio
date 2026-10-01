import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="wrap page-head" style={{ display: 'grid', gap: 24, paddingBottom: 'var(--section)' }}>
      <h1 className="sig">This page is not in the collection.</h1>
      <p className="lede">The link may be old, or the address mistyped.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Link href="/collection" className="btn">See the six sets</Link>
        <Link href="/" className="btn secondary">Go home</Link>
      </div>
    </section>
  )
}
