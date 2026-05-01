import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Personalized Invitations',
  description: 'Send beautiful, personalized event invitations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory antialiased">{children}</body>
    </html>
  )
}
