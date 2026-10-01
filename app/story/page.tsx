import Link from 'next/link'
import type { Metadata } from 'next'
import { Plate } from '@/components/Plate'
import { Arrow } from '@/components/Icons'

export const metadata: Metadata = { title: 'Story', description: 'Kala is the Sanskrit word for art, craft and time. Why the label is named for it, and what the gold on each set really is.' }

export default function Story() {
  return (
    <>
      <section className="story-hero dark grain">
        <div className="wrap story-hero-grid">
          <div className="story-head">
            <h1 className="story-word rise">Kala</h1>
            <p className="lede rise" style={{ '--d': '160ms' } as React.CSSProperties}>From the Sanskrit: art, craft and time.</p>
          </div>
          <figure className="story-bust rise" style={{ '--d': '240ms' } as React.CSSProperties}>
            <img src="/images/bust.webp" alt="A classical marble bust in low light, toned sapphire" width={640} height={960} fetchPriority="high" />
          </figure>
        </div>
      </section>
      <section className="wrap story" style={{ paddingTop: 'var(--section)' }}>
        <div className="prose lede story-text">
          <p>Kala is the Sanskrit word for art, craft and time. Kalaverio is a house built on that idea: clothes for young people who make things, cut slowly and released in small numbered runs, under Zafirenzo, the era of sapphire. We begin with one collection and will grow, a piece at a time, into every kind of clothing.</p>
          <p>Volume I is called Sanctuary, and it is about being safe enough to be yourself. There are six sets and sixty places, and every owner may appear in a public Register.</p>
          <p className="story-truth">The gold on each set is zari border tape. It is real metallic weave, not hand-embroidered zardozi, and we will always say so.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px', marginTop: 40 }}>
            <Link href="/collection" className="link-arrow">See the six sets <Arrow /></Link>
            <Link href="/register" className="link-arrow">Read the Register <Arrow /></Link>
          </div>
        </div>
        <div className="story-plates">
          <Plate motif={0} ratio="r32" view="table" alt="The tailor's table, mid-cut, with zari tape laid out" sizes="(min-width: 900px) 460px, 100vw" />
          <Plate motif={3} ratio="r11" view="closeup" tone="ink" alt="Close-up of the zari border tape" sizes="(min-width: 900px) 300px, 70vw" className="story-close" />
        </div>
      </section>
    </>
  )
}
