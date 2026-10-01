'use client'
import { track } from '@vercel/analytics'

export function ReserveButton({ slug, label }: { slug: string; label: string }) {
  return (
    <button className="btn block reserve-btn" onClick={() => track('Reserve click', { set: slug })}>
      {label}
    </button>
  )
}
