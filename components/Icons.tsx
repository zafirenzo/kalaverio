const base = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, 'aria-hidden': true } as const

export const Arrow = () => (
  <svg {...base}><path d="M2 8h11M9 4l4 4-4 4" /></svg>
)
export const Plus = () => (
  <svg {...base}><path d="M8 2.5v11M2.5 8h11" /></svg>
)
export const Menu = () => (
  <svg {...base} width={22} height={22} viewBox="0 0 22 22"><path d="M3 8h16M3 14h16" /></svg>
)
export const Share = () => (
  <svg {...base}><path d="M8 10V2M5 5l3-3 3 3M3 9v5h10V9" /></svg>
)
