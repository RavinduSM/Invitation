'use client'

import { useState, useCallback, useEffect } from 'react'

export function useToast() {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  return { toast, showToast }
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div
        className="bg-charcoal text-ivory font-body text-xs tracking-widest px-6 py-3 shadow-2xl"
        style={{ borderLeft: '3px solid #C0873F' }}
      >
        {message}
      </div>
    </div>
  )
}
