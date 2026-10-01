'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Re-reads the server page until the webhook has marked the order paid.
export function Refresh({ every }: { every: number }) {
  const router = useRouter()
  useEffect(() => {
    const t = setInterval(() => router.refresh(), every)
    return () => clearInterval(t)
  }, [router, every])
  return null
}
