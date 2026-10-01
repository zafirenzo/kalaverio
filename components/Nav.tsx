import Link from 'next/link'
import { NavLinks } from './NavLinks'
import { Chip } from './Chip'
import { Menu } from './Icons'
import { getLive } from '@/lib/live'

export async function Nav() {
  const { phase, totalLeft, totalRun } = await getLive()
  return (
    <header className="nav">
      <div className="wrap">
        <Link href="/" className="wordmark" aria-label="Zarbafini, home">ZARBAFINI</Link>
        <NavLinks className="nav-links" />
        <Link href="/collection" style={{ textDecoration: 'none' }} aria-label="Sets left, see the collection">
          <Chip phase={phase} left={totalLeft} run={totalRun} />
        </Link>
        <button className="menu-btn" popoverTarget="menu" aria-label="Menu">
          <Menu />
        </button>
      </div>
      <div id="menu" popover="auto" className="menu">
        <NavLinks className="" />
        <Link href="/policies">Policies and sizes</Link>
      </div>
    </header>
  )
}
