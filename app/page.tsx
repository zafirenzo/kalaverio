import Link from 'next/link'
import { getLive } from '@/lib/live'
import { getRegister } from '@/lib/db'
import { LAUNCH, DELIVERY } from '@/lib/site'
import { heroButton, pad3 } from '@/lib/state'
import { Plate } from '@/components/Plate'
import { SetCard } from '@/components/SetCard'
import { RegisterGrid } from '@/components/RegisterGrid'
import { WaitlistForm } from '@/components/WaitlistForm'
import { Arrow } from '@/components/Icons'

export default async function Home() {
  const [{ phase, sets, totalRun }, rows] = await Promise.all([getLive(), getRegister().catch(() => [])])
  const honour = sets.find((s) => s.slug === 'the-honour') ?? sets[0]
  const cta = heroButton(phase)
  const nextOpen = Array.from({ length: totalRun }, (_, i) => i + 1).find((n) => !rows.some((r) => r.register_number === n))
  const named = rows.filter((r) => r.display_name).slice(-4).reverse()

  return (
    <>
      {/* 2. Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-media">
            <Plate cut={honour.for === 'women' ? 'aline' : 'long'} className="only-phone" photo={honour.photos.worn} motif={honour.motif} ratio="r45" title="The Honour" alt="The Honour, worn" sizes="100vw" priority />
            <Plate cut={honour.for === 'women' ? 'aline' : 'long'} className="only-desk" photo={honour.photos.worn} motif={honour.motif} ratio="r32" title="The Honour" alt="The Honour, worn" sizes="(min-width: 900px) 640px, 100vw" />
          </div>
          <div className="hero-copy">
            <h1 className="hero-title">Cut<br />slowly.</h1>
            <p className="hero-vol serif sig">Volume I: Sanctuary.</p>
            <p className="lede">Six sets. Sixty numbered places. Pre-order opens {LAUNCH.opensLabel}.</p>
            {phase === 'before' ? (
              <WaitlistForm source="hero" id="waitlist" />
            ) : (
              <Link href={cta.href} className="btn">{cta.label} <Arrow /></Link>
            )}
          </div>
        </div>
      </section>

      {/* 3. Name strip */}
      <section className="strip sand">
        <div className="wrap strip-inner">
          <p className="strip-line serif">
            Kala: <span>art, craft and time.</span>
          </p>
          <p className="strip-note">
            <span className="mute">From the Sanskrit kala, with an Italian ending.</span>
            <Link href="/story" className="link-arrow">Read the story <Arrow /></Link>
          </p>
        </div>
      </section>

      {/* 4. The six sets */}
      <section className="section">
        <div className="wrap">
          <div className="head-row">
            <h2 className="sig">The six sets</h2>
            <Link href="/collection" className="link-arrow">See the collection <Arrow /></Link>
          </div>
          <div className="sets-grid six">
            {sets.map((s) => (
              <SetCard key={s.slug} set={s} phase={phase} sizes="(min-width: 1100px) 180px, (min-width: 700px) 33vw, 50vw" />
            ))}
          </div>
        </div>
      </section>

      {/* 5. The Register */}
      <section className="section rule-top">
        <div className="wrap reg-teaser">
          <div className="stack" style={{ '--s': '20px' } as React.CSSProperties}>
            <h2 className="sig">Owners, in order.</h2>
            <p className="lede">
              {rows.length === 0
                ? 'Nº 001 is open. Every set is numbered, and every owner can appear here by name.'
                : `${rows.length} of ${totalRun} places taken. Nº ${pad3(nextOpen ?? totalRun)} is next.`}
            </p>
            {named.length > 0 && (
              <ul className="reg-recent">
                {named.map((r) => (
                  <li key={r.register_number}><span className="label">Nº {pad3(r.register_number)}</span> {r.display_name}</li>
                ))}
              </ul>
            )}
            <Link href="/register" className="link-arrow">See the Register <Arrow /></Link>
          </div>
          <RegisterGrid rows={rows} total={totalRun} />
        </div>
      </section>

      {/* 6. How it works */}
      <section className="section sapphire">
        <div className="wrap how">
          <h2 className="sig">How it works</h2>
          <ol className="how-steps">
            <li><span className="label">I</span><b className="serif">Choose</b><span>One set, one size, from six.</span></li>
            <li><span className="label">II</span><b className="serif">Pay</b><span>Online, once. Your Nº is given when the bank confirms.</span></li>
            <li><span className="label">III</span><b className="serif">Wear</b><span>Sets are cut after {LAUNCH.decisionDate} and ship {DELIVERY}.</span></li>
          </ol>
          <p className="how-promise">
            No set is made until {LAUNCH.threshold} are paid for. If fewer than {LAUNCH.threshold} are paid for by 24 October, everyone is refunded in full.{' '}
            <Link href="/policies">Read the policies</Link>
          </p>
        </div>
      </section>
    </>
  )
}
