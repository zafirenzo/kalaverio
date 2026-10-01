import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, Inter, Cinzel } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { getLive } from '@/lib/live'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const serif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--f-serif', display: 'swap' })
const sans = Inter({ subsets: ['latin'], variable: '--f-sans', display: 'swap' })
// Cinzel carries the Nº labels and nothing else.
const cinzel = Cinzel({ weight: '500', subsets: ['latin'], variable: '--f-cinzel', display: 'swap' })

export const revalidate = 30

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Kalaverio · Volume I: Sanctuary.', template: '%s · Kalaverio' },
  description: 'Six sets. Sixty numbered places. Clothes cut slowly and released in small numbered runs. Pre-order opens 14 October.',
  openGraph: { siteName: 'Kalaverio', type: 'website', locale: 'en_IN' },
}

export const viewport: Viewport = { themeColor: '#F5F0E8' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { phase } = await getLive()
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable} ${cinzel.variable}`}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer phase={phase} />
        <Analytics />
      </body>
    </html>
  )
}
