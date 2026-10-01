export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Indian mobile: 10 digits starting 6-9, with or without +91 / 0.
export function normPhone(s: string) {
  const d = s.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '')
  return /^[6-9]\d{9}$/.test(d) ? d : null
}

// Waitlist accepts either; stored normalised so duplicates are caught.
export function normContact(s: string) {
  const t = s.trim().toLowerCase()
  if (t.includes('@')) return EMAIL.test(t) ? t : null
  const p = normPhone(t)
  return p ? `+91${p}` : null
}

// "aarav sharma" -> null, "aarav s" -> "Aarav S." : first name and last initial only.
export function normRegisterName(s: string) {
  const m = s.trim().match(/^([\p{L}'-]{1,24})\s+([\p{L}])\.?$/u)
  if (!m) return null
  return `${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} ${m[2].toUpperCase()}.`
}
