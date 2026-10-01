import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const ogSize = { width: 1200, height: 630 }

// One share-card layout for every page: the valley painting, ink type set in its open sky.
export async function ogCard({ big, title, sub }: { big?: string; title: string; sub: string }) {
  const [serif, valley] = await Promise.all([
    readFile(join(process.cwd(), 'lib/og/DMSerifDisplay.ttf')),
    readFile(join(process.cwd(), 'lib/og/valley.jpg')),
  ])
  const bg = `data:image/jpeg;base64,${valley.toString('base64')}`
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#F5F0E8', color: '#0B0F1A', fontFamily: 'Serif' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bg} width={1200} height={630} style={{ position: 'absolute', inset: 0 }} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column', padding: '64px 72px', width: '100%' }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 9 }}>KALAVERIO</div>
          {big && <div style={{ fontSize: 120, lineHeight: 1, color: '#0B2A6F', marginTop: 36 }}>{big}</div>}
          <div style={{ fontSize: big ? 56 : 104, lineHeight: 1.02, marginTop: big ? 8 : 40, maxWidth: 720 }}>{title}</div>
          <div style={{ width: 48, height: 2, background: '#C9A227', margin: '24px 0' }} />
          <div style={{ fontSize: 26, lineHeight: 1.3, color: '#0B2A6F', maxWidth: 440 }}>{sub}</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: 'Serif', data: serif, weight: 400, style: 'normal' }] },
  )
}
