import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const ogSize = { width: 1200, height: 630 }

// One share-card layout for every page: sapphire field, gold numeral, ivory serif.
export async function ogCard({ big, title, sub }: { big?: string; title: string; sub: string }) {
  const serif = await readFile(join(process.cwd(), 'lib/og/DMSerifDisplay.ttf'))
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0B2A6F', color: '#F5F0E8', padding: 72, fontFamily: 'Serif' }}>
        <div style={{ display: 'flex', fontSize: 22, letterSpacing: 9 }}>KALAVERIO</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {big && <div style={{ fontSize: 168, lineHeight: 1, color: '#C9A227' }}>{big}</div>}
          <div style={{ fontSize: big ? 64 : 112, lineHeight: 1.05, marginTop: big ? 16 : 0 }}>{title}</div>
          <div style={{ width: 48, height: 2, background: '#C9A227', margin: '28px 0' }} />
          <div style={{ fontSize: 30, color: 'rgba(245,240,232,0.8)' }}>{sub}</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: 'Serif', data: serif, weight: 400, style: 'normal' }] },
  )
}
