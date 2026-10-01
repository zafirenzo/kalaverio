import Image from 'next/image'
import { useId } from 'react'
import type { Photo } from '@/lib/sets'

// Six zari border motifs, each one 24x16 tile, drawn as a single gold stroke.
const MOTIFS = [
  'M0 8 6 2l6 6-6 6zM12 8l6-6 6 6-6 6z', // lozenge
  'M0 12 6 4l6 8 6-8 6 8', // chevron
  'M6 8a2.4 2.4 0 1 0 0 .01M18 8a2.4 2.4 0 1 0 0 .01M12 3v2M12 11v2', // buta dots
  'M0 0l24 16M0 16 24 0M12 0v16', // lattice
  'M0 8c3-6 9-6 12 0s9 6 12 0', // wave
  'M0 12V4h6v8h6V4h6v8h6', // step
]

// Tailor's flats: front-view line drawings, the drawing a tailor cuts from. 400x500 space.
const CUTS = {
  long: {
    body: 'M180 68 120 88 84 250l26 6 26-106-10 248h148l-10-248 26 106 26-6-36-162-60-20q-20 14-40 0z',
    lower: 'M150 398l-2 80h46l6-58 6 58h46l-2-80',
    detail: 'M182 70q18 16 36 0M200 80v86M131 346l-4 52M269 346l4 52',
    buttons: [96, 116, 136, 156],
    hem: 384,
    hemX: [126, 274],
  },
  aline: {
    body: 'M182 68l-52 18-26 124 22 4 14-74-32 280h184l-32-280 14 74 22-4-26-124-52-18q-18 24-36 0z',
    lower: 'M140 420l-22 62h78l4-40 4 40h78l-22-62',
    detail: 'M184 70q16 22 32 0M200 92v40',
    buttons: [104, 120],
    hem: 404,
    hemX: [108, 292],
  },
}

function Flat({ cut, ink, motif, id }: { cut: 'long' | 'aline'; ink: string; motif: number; id: string }) {
  const c = CUTS[cut]
  return (
    <g fill="none" stroke={ink} strokeWidth="1.3" strokeLinejoin="round">
      <defs>
        <clipPath id={`k${id}`}><path d={c.body} /></clipPath>
        <pattern id={`m${id}`} width="12" height="8" patternUnits="userSpaceOnUse" y={c.hem + 2}>
          <path d={MOTIFS[motif % 6]} transform="scale(.5)" stroke="#C9A227" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </pattern>
      </defs>
      <path d={c.lower} opacity="0.7" />
      <g clipPath={`url(#k${id})`} stroke="none">
        <rect x="0" y={c.hem} width="400" height="1" fill="#C9A227" />
        <rect x="0" y={c.hem + 2} width="400" height="8" fill={`url(#m${id})`} />
        <rect x="0" y={c.hem + 11} width="400" height="1" fill="#C9A227" />
      </g>
      <path d={c.body} />
      <path d={c.detail} opacity="0.7" />
      {c.buttons.map((y) => <circle key={y} cx="200" cy={y} r="1.6" fill="#C9A227" stroke="none" />)}
    </g>
  )
}

function Band({ motif, y, scale = 1, id }: { motif: number; y: number; scale?: number; id: string }) {
  const h = 16 * scale
  return (
    <g>
      <defs>
        <pattern id={id} width={24 * scale} height={h} patternUnits="userSpaceOnUse" y={y}>
          <path d={MOTIFS[motif % 6]} transform={`scale(${scale})`} fill="none" stroke="#C9A227" strokeWidth={1.1 / scale} vectorEffect="non-scaling-stroke" />
        </pattern>
      </defs>
      <rect x="0" y={y - 6 * scale} width="100%" height={1} fill="#C9A227" />
      <rect x="0" y={y - 3.5 * scale} width="100%" height={0.6} fill="#C9A227" opacity="0.7" />
      <rect x="0" y={y} width="100%" height={h} fill={`url(#${id})`} />
      <rect x="0" y={y + h + 3.5 * scale} width="100%" height={0.6} fill="#C9A227" opacity="0.7" />
      <rect x="0" y={y + h + 6 * scale} width="100%" height={1} fill="#C9A227" />
    </g>
  )
}

type Props = {
  photo?: Photo
  motif: number
  ratio?: 'r45' | 'r32' | 'r11'
  tone?: 'sapphire' | 'ink'
  view?: 'worn' | 'flat' | 'closeup' | 'table'
  cut?: 'long' | 'aline'
  title?: string
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
}

// A real photograph when one exists. Until then, a woven plate: weave texture, the set's zari border,
// and a caption that says plainly which photograph belongs here.
export function Plate({ photo, motif, ratio = 'r45', tone = 'sapphire', view = 'worn', cut = 'long', title, alt, sizes = '50vw', priority, className = '' }: Props) {
  const uid = useId().replace(/[^a-z0-9]/gi, '')
  if (photo?.src) {
    return (
      <figure className={`plate ${ratio} ${className}`}>
        <Image src={photo.src} alt={photo.alt || alt} fill sizes={sizes} priority={priority} />
      </figure>
    )
  }
  const [w, h] = ratio === 'r45' ? [400, 500] : ratio === 'r32' ? [600, 400] : [400, 400]
  const onSand = view === 'flat' // "flat on ivory": the drawing sits on a light ground
  const field = onSand ? '#EAD2A8' : tone === 'ink' ? '#0B0F1A' : '#0B2A6F'
  const line = onSand ? '#0B0F1A' : '#F5F0E8'
  const close = view === 'closeup'
  // Fit the 400x500 drawing into the plate, centred, filling ~86% of the height.
  const k = (h * 0.86) / 500
  const fit = `translate(${(w - 400 * k) / 2} ${(h - 500 * k) / 2 + h * 0.02}) scale(${k})`
  return (
    <figure className={`plate ${ratio} ${className}`} style={{ background: field }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${alt} (photograph to come)`}>
        <defs>
          <pattern id={`w${uid}`} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="1" fill={onSand ? '#0B0F1A' : '#C9A227'} opacity={close ? 0.1 : onSand ? 0.03 : 0.05} />
            <rect width="1" height="4" fill={onSand ? '#0B0F1A' : '#F5F0E8'} opacity={close ? 0.06 : onSand ? 0.02 : 0.035} />
          </pattern>
        </defs>
        <rect width={w} height={h} fill={field} />
        <rect width={w} height={h} fill={`url(#w${uid})`} />
        {close ? (
          <Band motif={motif} y={h / 2 - 32} scale={4} id={`b${uid}`} />
        ) : view === 'table' ? (
          <>
            <Band motif={motif} y={h * 0.62} id={`b${uid}`} />
            <Band motif={(motif + 3) % 6} y={h * 0.62 + 40} scale={0.75} id={`c${uid}`} />
          </>
        ) : (
          <g transform={fit} opacity={onSand ? 0.9 : 0.95}>
            <Flat cut={cut} ink={line} motif={motif} id={uid} />
          </g>
        )}
      </svg>
      <figcaption className="plate-cap" style={{ color: onSand ? '#5B6070' : 'rgb(245 240 232 / 0.74)' }}>
        {title ? <span className="serif plate-title" style={{ color: onSand ? '#0B0F1A' : '#F5F0E8' }}>{title}</span> : <span />}
        <span className="label plate-note">
          Photograph to come
          <br />
          {view === 'closeup' ? 'Zari, close' : view === 'flat' ? 'Flat, on ivory' : view === 'table' ? "The tailor's table" : 'Worn, front'}
        </span>
      </figcaption>
    </figure>
  )
}

// The woven border on its own, for the top edge of the footer.
export function ZariBand({ motif = 0, className = '' }: { motif?: number; className?: string }) {
  const uid = useId().replace(/[^a-z0-9]/gi, '')
  return (
    <svg className={className} width="100%" height="18" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <pattern id={`z${uid}`} width="24" height="16" patternUnits="userSpaceOnUse" y="1">
          <path d={MOTIFS[motif]} fill="none" stroke="#C9A227" strokeWidth="1" opacity="0.85" />
        </pattern>
      </defs>
      <rect width="100%" height="18" fill={`url(#z${uid})`} />
      <rect width="100%" height="1" y="17" fill="#C9A227" opacity="0.5" />
    </svg>
  )
}
