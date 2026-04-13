export function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

export function formatName(name: string): string {
  return name
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] || '')
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export function getInviteURL(name: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${base}/invite/${encodeURIComponent(name)}`
}

export const REF_LINK =
  'https://anuruddha-watasha.netlify.app/?guest=UmF2aW5kdQ==&th=6b9e78-a8cdb4-0e2416-f3faf5-1a3a24'

export const EVENT = {
  title: 'An Evening of Celebration',
  details: [
    { label: 'Date', value: 'Saturday, May 24\n2025' },
    { label: 'Time', value: '7:00 PM\nOnwards' },
    { label: 'Venue', value: 'The Grand Hall\nColombo' },
    { label: 'Dress Code', value: 'Black Tie\nPreferred' },
  ],
  rsvp: 'Kindly RSVP by May 10, 2025',
}
