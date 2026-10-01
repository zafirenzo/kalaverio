// Everything a non-developer may need to change before launch lives here or in lib/sets.ts.
// Lines marked PLACEHOLDER must be replaced with confirmed facts before going live.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const LAUNCH = {
  // Pre-order opens on launch night, 14 October, IST.
  opensAt: '2026-10-14T20:00:00+05:30',
  // Last moment to pay: end of 24 October, IST.
  closesAt: '2026-10-25T00:00:00+05:30',
  // No set is made until this many are paid for across the collection.
  threshold: 30,
  decisionDate: '25 October',
  opensLabel: '14 October',
}

export const DELIVERY = 'within four weeks of 25 October' // PLACEHOLDER: confirm with the tailor
export const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const
export type Size = (typeof SIZES)[number]

export const SELLER = {
  name: 'Zafirenzo', // PLACEHOLDER: registered legal name of the seller
  address: 'Address to be confirmed, India', // PLACEHOLDER
  email: 'hello@zarbafini.com', // PLACEHOLDER
  gst: '', // PLACEHOLDER: GSTIN if registered; leave empty to hide
  instagram: 'https://instagram.com/zarbafini', // PLACEHOLDER
}

// PLACEHOLDER: replace with the tailor's measurements. Inches, body measurements.
export const SIZE_GUIDE: Record<Size, { chest: string; waist: string; length: string }> = {
  XS: { chest: '34', waist: '28', length: '40' },
  S: { chest: '36', waist: '30', length: '41' },
  M: { chest: '38–40', waist: '32–34', length: '42' },
  L: { chest: '42', waist: '36', length: '43' },
  XL: { chest: '44–46', waist: '38–40', length: '44' },
}

// PLACEHOLDER: confirm with a CA before launch.
export const EXCHANGE = 'One size exchange within 7 days of delivery, if the set is unworn with its tags, while that size remains in the run.'
