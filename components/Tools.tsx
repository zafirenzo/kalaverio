// The tools of kala, drawn as a tailor would draw a flat: hairline, to scale, numbered.
// Two for art (brushes), two for craft (shears, needle and thread).

const ink = 'currentColor'

function Brush({ y, len, tip, belly, label }: { y: number; len: number; tip: 'round' | 'flat' | 'rigger'; belly: number; label: string }) {
  const x0 = 40
  const ferrule = x0 + len * 0.62
  const end = x0 + len
  const hair =
    tip === 'flat'
      ? `M${ferrule + 34} ${y - belly} L${end} ${y - belly * 0.9} L${end} ${y + belly * 0.9} L${ferrule + 34} ${y + belly} Z`
      : tip === 'round'
        ? `M${ferrule + 34} ${y - belly} C${ferrule + 70} ${y - belly * 1.4} ${end - 30} ${y - belly * 0.5} ${end} ${y} C${end - 30} ${y + belly * 0.5} ${ferrule + 70} ${y + belly * 1.4} ${ferrule + 34} ${y + belly} Z`
        : `M${ferrule + 34} ${y - belly} C${ferrule + 60} ${y - belly} ${end - 60} ${y - 1.2} ${end} ${y} C${end - 60} ${y + 1.2} ${ferrule + 60} ${y + belly} ${ferrule + 34} ${y + belly} Z`
  return (
    <g>
      {/* handle: tapered, with a painted band */}
      <path d={`M${x0} ${y - 4} Q${x0 + len * 0.3} ${y - 9} ${ferrule} ${y - 7} L${ferrule} ${y + 7} Q${x0 + len * 0.3} ${y + 9} ${x0} ${y + 4} Z`} />
      <path d={`M${x0 + len * 0.42} ${y - 8.4} V${y + 8.4}`} opacity="0.6" />
      {/* ferrule, crimped */}
      <path d={`M${ferrule} ${y - 7} L${ferrule + 34} ${y - belly} V${y + belly} L${ferrule} ${y + 7} Z`} />
      <path d={`M${ferrule + 8} ${y - 7.6} V${y + 7.6} M${ferrule + 13} ${y - 8} V${y + 8}`} opacity="0.6" />
      <path d={hair} />
      <path d={`M${ferrule + 40} ${y - belly * 0.4} Q${(ferrule + end) / 2 + 20} ${y - belly * 0.2} ${end - 16} ${y - 0.5}`} opacity="0.45" />
      <text x={x0} y={y - 18} className="tools-label">{label}</text>
    </g>
  )
}

export function Tools({ className = '' }: { className?: string }) {
  return (
    <figure className={`tools ${className}`}>
      <svg viewBox="0 0 640 420" role="img" aria-label="Drawing of a painter's round brush, flat brush and rigger, tailor's shears, and a needle with thread">
        <g fill="none" stroke={ink} strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round">
          <Brush y={70} len={420} tip="round" belly={11} label="Nº 01 · Round brush" />
          <Brush y={140} len={400} tip="flat" belly={13} label="Nº 02 · Flat brush" />
          <Brush y={204} len={440} tip="rigger" belly={5} label="Nº 03 · Rigger" />

          {/* Nº 04 · Tailor's shears, closed, blades pointing right */}
          <g transform="translate(40 300)">
            <ellipse cx="34" cy="-12" rx="30" ry="17" />
            <ellipse cx="34" cy="-12" rx="19" ry="8" />
            <path d="M14 22 Q10 8 34 6 Q60 6 70 18 Q60 34 34 34 Q14 34 14 22 Z" />
            <path d="M26 24 Q30 18 40 20" opacity="0.6" />
            <path d="M62 -10 L116 -2 L330 2 Q350 3 352 5 L330 7 L116 9 Z" />
            <path d="M68 20 L118 9 L330 7" />
            <circle cx="110" cy="3.5" r="4" />
            <circle cx="110" cy="3.5" r="1.2" fill={ink} />
            <text x="0" y="-42" className="tools-label">Nº 04 · Tailor&apos;s shears</text>
          </g>

          {/* Nº 05 · Needle, threaded, the thread falling in a slow loop */}
          <g transform="translate(430 300)">
            <path d="M0 0 L150 -1.6 L170 0 L150 1.6 Z" />
            <ellipse cx="10" cy="0" rx="6" ry="1.2" />
            <path d="M10 0 C-20 10 -40 60 10 76 C60 92 120 70 150 92 C170 108 150 124 128 118" stroke="var(--gold)" strokeWidth="1.2" />
            <text x="0" y="-42" className="tools-label">Nº 05 · Needle and thread</text>
          </g>
        </g>
      </svg>
    </figure>
  )
}
