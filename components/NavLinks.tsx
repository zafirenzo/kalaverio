'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  ['/collection', 'Collection'],
  ['/story', 'Story'],
  ['/register', 'The Register'],
] as const

export function NavLinks({ className }: { className: string }) {
  const path = usePathname()
  return (
    <div className={className}>
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path.startsWith(href) ? 'page' : undefined}
          // closes the phone menu popover after a tap
          onClick={() => document.getElementById('menu')?.hidePopover?.()}>
          {label}
        </Link>
      ))}
    </div>
  )
}
