import Link from 'next/link'
import { ZariBand } from './Plate'
import { WaitlistForm } from './WaitlistForm'
import { SELLER, LAUNCH } from '@/lib/site'
import type { Phase } from '@/lib/state'

export function Footer({ phase }: { phase: Phase }) {
  const before = phase === 'before'
  return (
    <footer className="footer dark">
      <ZariBand className="band" />
      <div className="wrap">
        <div className="footer-grid">
          <div className="stack" style={{ '--s': '20px' } as React.CSSProperties}>
            <p className="serif" style={{ fontSize: 28, lineHeight: '34px', maxWidth: '18ch' }}>
              {before ? `Hear first when pre-order opens on ${LAUNCH.opensLabel}.` : 'Hear first about Volume II.'}
            </p>
            <WaitlistForm source="footer" id="footer-waitlist" />
            <p className="mute" style={{ fontSize: 14, lineHeight: '22px' }}>One message when it opens. Never shared, never shown.</p>
          </div>
          <nav aria-label="Footer">
            <Link href="/story">Story</Link>
            <Link href="/collection">Collection</Link>
            <Link href="/register">The Register</Link>
            <Link href="/policies">Policies and sizes</Link>
            <a href={SELLER.instagram} rel="noopener">Instagram</a>
          </nav>
          <address style={{ fontStyle: 'normal', fontSize: 14, lineHeight: '22px' }} className="mute">
            <span className="label" style={{ color: 'var(--ivory)', display: 'block', marginBottom: 12 }}>Seller</span>
            {SELLER.name}<br />
            {SELLER.address}<br />
            <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
            {SELLER.gst && <><br />GSTIN {SELLER.gst}</>}
          </address>
        </div>
        <div className="footer-base mute">
          <span>Zarbafini, by Zafirenzo</span>
          <span>Prices include GST. <Link href="/policies">Refunds, exchanges and delivery</Link></span>
        </div>
      </div>
    </footer>
  )
}
