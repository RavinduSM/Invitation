'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast, Toast } from '@/components/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast, showToast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Invalid credentials')
        return
      }

      showToast('Logged in successfully')
      router.replace('/admin')
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gold/20 rounded-3xl p-10 shadow-xl">
        <div className="text-center mb-8">
          <p className="text-sm tracking-[4px] uppercase text-gold mb-2">Admin Login</p>
          <h1 className="font-display text-3xl text-charcoal">Sign in to continue</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full mb-5 font-serif-body text-[16px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
            placeholder="admin@example.com"
          />

          <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full mb-6 font-serif-body text-[16px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
            placeholder="********"
          />

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-[10px] tracking-[2px] uppercase bg-charcoal text-ivory px-7 py-3.5 rounded-full hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-charcoal-light">
          Only admin users can access this panel.
        </p>
      </div>
      <Toast message={toast} />
    </div>
  )
}
