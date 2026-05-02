'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast, Toast } from '@/components/Toast'
import { getInitials } from '@/lib/utils'
import type { Invitation, EventContent, EventDetail } from '@/types'

// ── Alert ──────────────────────────────────────────────────────────────────
function Alert({ message, type }: { message: string; type: 'error' | 'success' }) {
  const base = 'mt-4 px-4 py-3 font-serif-body italic text-[13px] border-l-4 animate-fade-in-up'
  const styles =
    type === 'error'
      ? `${base} bg-red-50 border-red-700 text-red-800`
      : `${base} bg-green-50 border-green-700 text-green-800`
  return <div className={styles} dangerouslySetInnerHTML={{ __html: message }} />
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div
        className="w-6 h-6 rounded-full border-2 border-gold/30 border-t-gold animate-spin-slow"
      />
    </div>
  )
}

// ── Invite Row ─────────────────────────────────────────────────────────────
function InviteRow({
  invite,
  onDelete,
  onCopy,
}: {
  invite: Invitation
  onDelete: (id: string, name: string) => void
  onCopy: (url: string) => void
}) {
  return (
    <div className="animate-fade-in-up flex items-center gap-4 bg-white border border-gold/20 px-5 py-4 transition-colors hover:border-gold/50 max-sm:flex-wrap">
      {/* Avatar */}
      <div
        className="w-10 h-10 flex items-center justify-center font-serif-body text-[14px] text-ivory shrink-0"
        style={{ background: 'linear-gradient(135deg, #9A6A2A, #C0873F)' }}
      >
        {getInitials(invite.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-serif-body text-[17px] font-medium text-charcoal mb-0.5">{invite.name}</p>
        <p className="text-[11px] text-gold-dark truncate">{invite.url}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0 max-sm:w-full max-sm:justify-end flex-wrap">
        <a
          href={`/invite/${encodeURIComponent(invite.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-full border border-charcoal/20 text-charcoal-light hover:border-gold hover:text-gold transition-all"
        >
          Preview
        </a>
        <button
          onClick={() => onCopy(invite.url)}
          className="text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-full border border-charcoal/20 text-charcoal-light hover:border-gold hover:text-gold transition-all cursor-pointer"
        >
          Copy
        </button>
        <button
          onClick={() => onDelete(invite._id, invite.name)}
          className="text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-full border border-charcoal/20 text-charcoal-light hover:border-red-600 hover:text-red-600 transition-all cursor-pointer"
        >
          Revoke
        </button>
      </div>
    </div>
  )
}

// ── Admin Panel ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  // Invitations state
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [nameInput, setNameInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  
  // Event content state
  const [eventContent, setEventContent] = useState<EventContent>({
    title: '',
    details: [],
    date: '',
    time: '',
    venue: '',
    dressCode: '',
    rsvp: '',
  })
  const [contentLoading, setContentLoading] = useState(true)
  const [contentSubmitting, setContentSubmitting] = useState(false)
  const [contentAlert, setContentAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  
  const { toast, showToast } = useToast()

  // ── Fetch event content ────────────────────────────────────────────────
  const fetchEventContent = useCallback(async () => {
    try {
      const res = await fetch('/api/content')
      const json = await res.json()
      if (json.success && json.data) {
        setEventContent(json.data)
      }
    } catch {
      console.error('Failed to load event content')
    } finally {
      setContentLoading(false)
    }
  }, [])

  // ── Fetch all invitations ──────────────────────────────────────────────
  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch('/api/invitations')
      const json = await res.json()
      if (json.success) setInvitations(json.data)
    } catch {
      showToast('Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchEventContent()
    fetchInvitations()
  }, [fetchEventContent, fetchInvitations])

  // ── Show timed alert ───────────────────────────────────────────────────
  function showAlert(message: string, type: 'error' | 'success') {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 4500)
  }

  function showContentAlert(message: string, type: 'error' | 'success') {
    setContentAlert({ message, type })
    setTimeout(() => setContentAlert(null), 4500)
  }

  // ── Handle content update ──────────────────────────────────────────────
  async function handleContentSave() {
    if (!eventContent.title.trim()) {
      showContentAlert('Event title is required', 'error')
      return
    }
    if (!eventContent.rsvp.trim()) {
      showContentAlert('RSVP information is required', 'error')
      return
    }

    setContentSubmitting(true)
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventContent),
      })
      const json = await res.json()

      if (!json.success) {
        showContentAlert(json.error ?? 'Failed to save event content', 'error')
        return
      }

      showContentAlert('Event content updated successfully!', 'success')
      setEventContent(json.data)
    } catch {
      showContentAlert('Network error — please try again', 'error')
    } finally {
      setContentSubmitting(false)
    }
  }

  // ── Handle detail change ───────────────────────────────────────────────
  function handleDetailChange(index: number, field: 'label' | 'value', value: string) {
    const updated = [...(eventContent.details || [])]
    updated[index] = { ...updated[index], [field]: value }
    setEventContent({ ...eventContent, details: updated })
  }

  // ── Add detail row ─────────────────────────────────────────────────────
  function addDetailRow() {
    setEventContent({
      ...eventContent,
      details: [...(eventContent.details || []), { label: '', value: '' }],
    })
  }

  // ── Remove detail row ──────────────────────────────────────────────────
  function removeDetailRow(index: number) {
    const updated = (eventContent.details || []).filter((_, i) => i !== index)
    setEventContent({ ...eventContent, details: updated })
  }

  // ── Generate invitation ────────────────────────────────────────────────
  async function handleGenerate() {
    const raw = nameInput.trim()
    if (!raw) {
      showAlert('Please enter a recipient\'s name before generating.', 'error')
      return
    }

    setSubmitting(true)
    setGeneratedLink(null)

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: raw }),
      })
      const json = await res.json()

      if (!json.success) {
        showAlert(json.error ?? 'Something went wrong.', 'error')
        return
      }

      const inv: Invitation = json.data
      setInvitations((prev) => [inv, ...prev])
      setGeneratedLink(inv.url)
      setNameInput('')
      showAlert(`Invitation for <strong>${inv.name}</strong> created successfully!`, 'success')
    } catch {
      showAlert('Network error — please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete invitation ──────────────────────────────────────────────────
  async function handleDelete(id: string, name: string) {
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setInvitations((prev) => prev.filter((i) => i._id !== id))
        showToast(`Invitation for ${name} has been revoked`)
      } else {
        showToast('Failed to revoke invitation')
      }
    } catch {
      showToast('Network error — please try again')
    }
  }

  // ── Copy link ──────────────────────────────────────────────────────────
  function handleCopy(url: string) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard'))
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ivory">
      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 max-sm:px-4"
        style={{ background: '#2C2C2C' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-serif-body text-gold text-lg tracking-widest opacity-70">✦</span>
          <span className="font-display text-ivory text-[15px] tracking-wider">Invitations</span>
        </div>
        <nav className="flex gap-1">
          <a
            href="/admin"
            className="text-[10px] tracking-[2px] uppercase px-4 py-2 text-gold border-b-2 border-gold"
          >
            Admin
          </a>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 max-sm:px-4">
        {/* ── Page header ── */}
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[4px] uppercase text-gold mb-3">Management Console</p>
          <h1 className="font-display font-normal text-[36px] text-charcoal leading-tight">
            Invitation Manager
          </h1>
          <div className="w-16 h-px bg-gold mx-auto my-4" />
          <p className="text-[13px] text-charcoal-light tracking-wide">
            Manage event content and personalized invitations
          </p>
        </div>

        {/* ── Event Content Editor ── */}
        {contentLoading ? (
          <Spinner />
        ) : (
          <div className="relative bg-white border border-gold/30 px-10 py-9 mb-10 form-top-bar max-sm:px-5 max-sm:py-6">
            <h2 className="font-display font-normal text-[22px] text-charcoal mb-6">Event Details</h2>

            {/* Event Title */}
            <div className="mb-6">
              <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2.5">
                Event Title
              </label>
              <input
                type="text"
                value={eventContent.title}
                onChange={(e) => setEventContent({ ...eventContent, title: e.target.value })}
                placeholder="e.g. An Evening of Celebration"
                maxLength={200}
                disabled={contentSubmitting}
                className="w-full font-serif-body text-[16px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
              />
            </div>

            {/* Event Date */}
            <div className="mb-6">
              <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2.5">
                Event Date
              </label>
              <input
                type="text"
                value={eventContent.date || ''}
                onChange={(e) => setEventContent({ ...eventContent, date: e.target.value })}
                placeholder="e.g. Saturday, May 24, 2025"
                disabled={contentSubmitting}
                className="w-full font-serif-body text-[16px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
              />
            </div>

            {/* Event Time */}
            <div className="mb-6">
              <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2.5">
                Event Time
              </label>
              <input
                type="text"
                value={eventContent.time || ''}
                onChange={(e) => setEventContent({ ...eventContent, time: e.target.value })}
                placeholder="e.g. 7:00 PM Onwards"
                disabled={contentSubmitting}
                className="w-full font-serif-body text-[16px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
              />
            </div>

            {/* Event Venue */}
            <div className="mb-6">
              <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2.5">
                Event Venue
              </label>
              <input
                type="text"
                value={eventContent.venue || ''}
                onChange={(e) => setEventContent({ ...eventContent, venue: e.target.value })}
                placeholder="e.g. The Grand Hall, Colombo"
                disabled={contentSubmitting}
                className="w-full font-serif-body text-[16px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
              />
            </div>

            {/* Dress Code */}
            <div className="mb-6">
              <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2.5">
                Dress Code
              </label>
              <input
                type="text"
                value={eventContent.dressCode || ''}
                onChange={(e) => setEventContent({ ...eventContent, dressCode: e.target.value })}
                placeholder="e.g. Black Tie Preferred"
                disabled={contentSubmitting}
                className="w-full font-serif-body text-[16px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
              />
            </div>

            {/* Event Details */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark">
                  Event Details
                </label>
                <button
                  onClick={addDetailRow}
                  disabled={contentSubmitting}
                  className="text-[9px] tracking-[2px] uppercase bg-gold text-ivory px-3 py-1.5 rounded-full hover:bg-gold-dark transition-colors disabled:opacity-50 cursor-pointer"
                >
                  + Add Detail
                </button>
              </div>

              <div className="space-y-3">
                {(eventContent.details || []).map((detail, index) => (
                  <div key={index} className="flex gap-3 max-sm:flex-col">
                    <input
                      type="text"
                      value={detail.label}
                      onChange={(e) => handleDetailChange(index, 'label', e.target.value)}
                      placeholder="e.g. Date"
                      disabled={contentSubmitting}
                      className="w-32 font-serif-body text-[14px] text-charcoal bg-ivory border border-gold/40 px-3 py-2.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                    />
                    <textarea
                      value={detail.value}
                      onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                      placeholder="e.g. Saturday, May 24\n2025"
                      disabled={contentSubmitting}
                      className="flex-1 font-serif-body text-[14px] text-charcoal bg-ivory border border-gold/40 px-3 py-2.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50 resize-none"
                      rows={2}
                    />
                    <button
                      onClick={() => removeDetailRow(index)}
                      disabled={contentSubmitting || (eventContent.details || []).length <= 1}
                      className="text-[9px] tracking-[2px] uppercase bg-red-600 text-ivory px-3 py-2.5 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer self-start"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RSVP */}
            <div className="mb-6">
              <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2.5">
                RSVP Information
              </label>
              <textarea
                value={eventContent.rsvp}
                onChange={(e) => setEventContent({ ...eventContent, rsvp: e.target.value })}
                placeholder="e.g. Kindly RSVP by May 10, 2025"
                maxLength={300}
                disabled={contentSubmitting}
                className="w-full font-serif-body text-[14px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50 resize-none"
                rows={2}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleContentSave}
              disabled={contentSubmitting}
              className="w-full text-[10px] tracking-[2px] uppercase bg-charcoal text-ivory px-7 py-3.5 hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {contentSubmitting ? (
                <>
                  <div className="w-3 h-3 rounded-full border border-ivory/30 border-t-ivory animate-spin-slow" />
                  Saving…
                </>
              ) : (
                'Save Event Details'
              )}
            </button>

            {contentAlert && <Alert message={contentAlert.message} type={contentAlert.type} />}
          </div>
        )}

        {/* ── Generator form ── */}
        <div className="relative bg-white border border-gold/30 px-10 py-9 mb-10 form-top-bar max-sm:px-5 max-sm:py-6">
          <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2.5">
            Recipient Name
          </label>
          <div className="flex gap-3 max-sm:flex-col">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !submitting && handleGenerate()}
              placeholder="e.g. Sarah, John Smith, José…"
              maxLength={80}
              disabled={submitting}
              className="flex-1 font-serif-body text-[18px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleGenerate}
              disabled={submitting}
              className="text-[10px] tracking-[2px] uppercase bg-charcoal text-ivory px-7 py-3.5 hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 rounded-full border border-ivory/30 border-t-ivory animate-spin-slow" />
                  Generating…
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>

          {alert && <Alert message={alert.message} type={alert.type} />}

          {generatedLink && (
            <div className="animate-fade-in-up mt-5 flex items-center gap-3 bg-ivory-dark border border-gold/30 px-4 py-3.5">
              <span className="flex-1 text-[12px] text-charcoal-light break-all">{generatedLink}</span>
              <button
                onClick={() => handleCopy(generatedLink)}
                className="text-[9px] tracking-[2px] uppercase bg-gold text-ivory px-4 py-2 rounded-full hover:bg-gold-dark transition-colors shrink-0 cursor-pointer"
              >
                Copy
              </button>
            </div>
          )}
        </div>

        {/* ── Invitations list ── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-normal text-[22px] text-charcoal">All Invitations</h2>
          <span className="text-[11px] bg-gold text-ivory px-3 py-1 rounded-full">
            {invitations.length}
          </span>
        </div>

        {loading ? (
          <Spinner />
        ) : invitations.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-gold/30 bg-ivory-dark">
            <p className="text-3xl mb-3 opacity-40">✉</p>
            <p className="font-serif-body italic text-[16px] text-charcoal-light">
              No invitations yet. Generate your first one above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {invitations.map((inv) => (
              <InviteRow
                key={inv._id}
                invite={inv}
                onDelete={handleDelete}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </main>

      <Toast message={toast} />
    </div>
  )
}
