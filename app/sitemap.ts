import type { MetadataRoute } from 'next'
import { getSets } from '@/lib/sets'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sets = await getSets()
  return ['', '/story', '/collection', '/register', '/policies', ...sets.map((s) => `/collection/${s.slug}`)].map((p) => ({ url: SITE_URL + p }))
}
