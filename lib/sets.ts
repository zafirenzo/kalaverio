// The six sets of Volume I. Sanity overrides these when SANITY_PROJECT_ID is set,
// so names, copy, prices, run sizes and the sold-out switch can change without a deploy.
// PLACEHOLDER: names other than The Honour, prices, garment lines and details are stand-ins.

export type Photo = { src: string; alt: string }

export type ZSet = {
  slug: string
  name: string
  for: 'men' | 'women'
  price: number // rupees, GST included
  runSize: number
  soldOut?: boolean // manual switch from Sanity
  line: string
  details: { fabric: string; fit: string; care: string }
  motif: number // which zari border the placeholder plate draws, 0-5
  photos: { worn?: Photo; flat?: Photo; closeup?: Photo }
}

const seed: ZSet[] = [
  {
    slug: 'the-honour', name: 'The Honour', for: 'men', price: 6400, runSize: 10, motif: 0,
    line: 'A long kurta and straight trousers, zari tape at the hem and cuffs.',
    details: { fabric: 'Cotton silk, zari border tape at hem and cuffs.', fit: 'Relaxed through the body, falls below the knee.', care: 'Dry clean. Store folded with the zari inside.' },
    photos: {},
  },
  {
    slug: 'the-vigil', name: 'The Vigil', for: 'men', price: 5800, runSize: 10, motif: 1,
    line: 'A short band-collar jacket over a plain kurta.',
    details: { fabric: 'Cotton, zari tape along the placket.', fit: 'Cut close at the shoulder, straight below.', care: 'Dry clean.' },
    photos: {},
  },
  {
    slug: 'the-keep', name: 'The Keep', for: 'men', price: 5200, runSize: 10, motif: 2,
    line: 'An overshirt and trousers, one gold line down the front.',
    details: { fabric: 'Linen blend, zari tape down the placket.', fit: 'Boxy, worn open or closed.', care: 'Gentle hand wash, dry in shade.' },
    photos: {},
  },
  {
    slug: 'the-haven', name: 'The Haven', for: 'women', price: 6400, runSize: 10, motif: 3,
    line: 'An A-line kurta and palazzo, zari at the neck and hem.',
    details: { fabric: 'Cotton silk, zari border tape at neck and hem.', fit: 'Fitted at the yoke, full below.', care: 'Dry clean.' },
    photos: {},
  },
  {
    slug: 'the-hearth', name: 'The Hearth', for: 'women', price: 5800, runSize: 10, motif: 4,
    line: 'A wrap top and wide trousers with a gold-edged tie.',
    details: { fabric: 'Cotton, zari tape along the wrap edge.', fit: 'Adjustable at the waist.', care: 'Gentle hand wash.' },
    photos: {},
  },
  {
    slug: 'the-lantern', name: 'The Lantern', for: 'women', price: 5200, runSize: 10, motif: 5,
    line: 'A short kurta and cigarette trousers, zari at the sleeve.',
    details: { fabric: 'Linen blend, zari tape at the sleeve.', fit: 'Straight, hip length.', care: 'Gentle hand wash, dry in shade.' },
    photos: {},
  },
]

const groq = encodeURIComponent(
  `*[_type == "zset"] | order(order asc){ "slug": slug.current, name, for, price, runSize, soldOut, line,
   details, motif, "photos": { "worn": worn{ "src": asset->url, alt }, "flat": flat{ "src": asset->url, alt }, "closeup": closeup{ "src": asset->url, alt } } }`,
)

export async function getSets(): Promise<ZSet[]> {
  const id = process.env.SANITY_PROJECT_ID
  if (!id) return seed
  try {
    const ds = process.env.SANITY_DATASET ?? 'production'
    const res = await fetch(`https://${id}.apicdn.sanity.io/v2025-01-01/data/query/${ds}?query=${groq}`, {
      next: { revalidate: 60 },
    })
    const { result } = await res.json()
    return result?.length ? result : seed
  } catch {
    return seed // ponytail: silent fallback keeps the shop up if Sanity is down; seed may be stale
  }
}

export async function getSet(slug: string) {
  return (await getSets()).find((s) => s.slug === slug)
}

export const rupees = (n: number) => '₹' + n.toLocaleString('en-IN')
