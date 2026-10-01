import Link from 'next/link'
import type { Metadata } from 'next'
import { Plate } from '@/components/Plate'
import { Arrow } from '@/components/Icons'

export const metadata: Metadata = { title: 'Story', description: 'Zarbaft is an old word for cloth woven with gold thread. Why the label borrows it, and what the gold on each set really is.' }

export default function Story() {
  return (
    <>
      <section className="wrap page-head story-head">
        <h1 className="story-word">Zarbaft</h1>
        <p className="lede mute">From the Persian zar, gold, and baft, woven.</p>
      </section>
      <section className="wrap story">
        <div className="prose lede story-text">
          <p>Zarbaft is an old word for cloth woven with gold thread. It was made for courts and worn when someone was being honoured.</p>
          <p>Zarbafini borrows the word and the idea: clothes for young people who make things, cut slowly and released in small numbered runs.</p>
          <p>Volume I is called Sanctuary, and it is about being safe enough to be yourself. There are six sets and sixty places, and every owner may appear in a public Register.</p>
          <p className="story-truth">The gold on each set is zari border tape. It is real metallic weave, but it is not handwoven zarbaft, and we will always say so.</p>
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
