'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast, Toast } from '@/components/Toast'
import { getInitials } from '@/lib/utils'
import type { Invitation, EventContent, EventDetail } from '@/types'

interface User {
  _id: string
  userName: string
  userEmail: string
  userRole: 'admin' | 'editor' | 'viewer'
  createdAt: string
}

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

// ── User Row ───────────────────────────────────────────────────────────────
function UserRow({
  user,
  onDelete,
}: {
  user: User
  onDelete: (id: string, name: string) => void
}) {
  const getRoleBgColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800'
      case 'viewer':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="animate-fade-in-up flex items-center gap-4 bg-white border border-gold/20 px-5 py-4 transition-colors hover:border-gold/50 max-sm:flex-wrap">
      {/* Avatar */}
      <div
        className="w-10 h-10 flex items-center justify-center font-serif-body text-[14px] text-ivory shrink-0"
        style={{ background: 'linear-gradient(135deg, #9A6A2A, #C0873F)' }}
      >
        {getInitials(user.userName)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-serif-body text-[17px] font-medium text-charcoal mb-0.5">{user.userName}</p>
        <p className="text-[11px] text-gold-dark truncate">{user.userEmail}</p>
      </div>

      {/* Role Badge */}
      <div className={`text-[10px] tracking-wide uppercase px-3 py-1 rounded-full font-medium ${getRoleBgColor(user.userRole)} shrink-0`}>
        {user.userRole}
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(user._id, user.userName)}
        className="text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-full border border-charcoal/20 text-charcoal-light hover:border-red-600 hover:text-red-600 transition-all cursor-pointer shrink-0"
      >
        Remove
      </button>
    </div>
  )
}

// ── Admin Panel ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [showUserModal, setShowUserModal] = useState(false)

  // Invitations state
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)
  const [userFormData, setUserFormData] = useState({
    userName: '',
    userEmail: '',
    userPwd: '',
    userRole: 'viewer' as 'admin' | 'editor' | 'viewer',
  })
  const [userSubmitting, setUserSubmitting] = useState(false)
  const [userAlert, setUserAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null)

  // Event content templates state
  const [contents, setContents] = useState<EventContent[]>([])
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)
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
  const [showModal, setShowModal] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const router = useRouter()
  const { toast, showToast } = useToast()

  // ── Fetch content templates ────────────────────────────────────────────────
  const fetchContents = useCallback(async () => {
    try {
      const res = await fetch('/api/content')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setContents(json.data)
        setSelectedContentId((current) => current ?? (json.data.length > 0 ? json.data[0]._id : null))
      }
    } catch {
      console.error('Failed to load content templates')
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

  // ── Fetch all users ────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const res = await fetch('/api/users')
      const json = await res.json()
      if (json.success) {
        setUsers(json.data)
      }
    } catch {
      showToast('Failed to load users')
    } finally {
      setUsersLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    async function validateSession() {
      try {
        const res = await fetch('/api/auth/me')
        const json = await res.json()

        if (!json.success || json.data.userRole !== 'admin') {
          router.replace('/login')
          return
        }

        setAuthLoading(false)
      } catch {
        router.replace('/login')
      }
    }

    validateSession()
  }, [router])

  useEffect(() => {
    if (!authLoading) {
      fetchContents()
      fetchInvitations()
      fetchUsers()
    }
  }, [authLoading, fetchContents, fetchInvitations, fetchUsers])

  // ── Show timed alert ───────────────────────────────────────────────────
  function showAlert(message: string, type: 'error' | 'success') {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 4500)
  }

  function showContentAlert(message: string, type: 'error' | 'success') {
    setContentAlert({ message, type })
    setTimeout(() => setContentAlert(null), 4500)
  }

  function showUserAlert(message: string, type: 'error' | 'success') {
    setUserAlert({ message, type })
    setTimeout(() => setUserAlert(null), 4500)
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventContent),
      })
      const json = await res.json()

      if (!json.success) {
        showContentAlert(json.error ?? 'Failed to create content template', 'error')
        return
      }

      showContentAlert('Content template created successfully!', 'success')
      setContents((prev) => [json.data, ...prev])
      setSelectedContentId(json.data._id)
      setEventContent({
        title: '',
        details: [],
        date: '',
        time: '',
        venue: '',
        dressCode: '',
        rsvp: '',
      })
      setShowModal(false)
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

  // ── Create user ────────────────────────────────────────────────────────
  async function handleCreateUser() {
    if (!userFormData.userName.trim()) {
      showUserAlert('Username is required', 'error')
      return
    }
    if (!userFormData.userEmail.trim()) {
      showUserAlert('Email is required', 'error')
      return
    }
    if (!userFormData.userPwd.trim()) {
      showUserAlert('Password is required', 'error')
      return
    }
    if (userFormData.userPwd.length < 6) {
      showUserAlert('Password must be at least 6 characters', 'error')
      return
    }

    setUserSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData),
      })
      const json = await res.json()

      if (!json.success) {
        showUserAlert(json.error ?? 'Failed to create user', 'error')
        return
      }

      showUserAlert(`User ${userFormData.userName} created successfully!`, 'success')
      setUsers([json.data, ...users])
      setUserFormData({
        userName: '',
        userEmail: '',
        userPwd: '',
        userRole: 'viewer',
      })
      setShowUserForm(false)
    } catch {
      showUserAlert('Network error — please try again', 'error')
    } finally {
      setUserSubmitting(false)
    }
  }

  // ── Delete user ────────────────────────────────────────────────────────
  async function handleDeleteUser(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id))
        showToast(`User ${name} has been removed`)
      } else {
        showToast('Failed to remove user')
      }
    } catch {
      showToast('Network error — please try again')
    }
  }

  // ── Generate invitation ────────────────────────────────────────────────
  async function handleGenerate() {
    const raw = nameInput.trim()
    const recipientEmail = emailInput.trim()

    if (!raw) {
      showAlert('Please enter a recipient\'s name before generating.', 'error')
      return
    }

    if (!recipientEmail) {
      showAlert('Please enter a recipient email before generating.', 'error')
      return
    }

    if (!selectedContentId) {
      showAlert('Please select a content template before generating invitations.', 'error')
      return
    }

    setSubmitting(true)
    setGeneratedLink(null)

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: raw, email: recipientEmail, contentId: selectedContentId }),
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
      setEmailInput('')
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

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/login')
    } catch {
      setIsLoggingOut(false)
      showToast('Failed to log out')
    }
  }

  // ── Copy link ──────────────────────────────────────────────────────────
  function handleCopy(url: string) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard'))
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center px-4 py-8 rounded-xl bg-white border border-gold/30 shadow-lg">
          <p className="text-[16px] font-medium text-charcoal mb-3">Checking authentication…</p>
          <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 max-sm:px-4"
        style={{ background: '#2C2C2C' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-serif-body text-gold text-lg tracking-widest opacity-70">✦</span>
          <span className="font-display text-ivory text-[15px] tracking-wider">Management</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUserModal(true)}
            className="text-[10px] tracking-[2px] uppercase bg-transparent border border-gold text-gold px-4 py-2 rounded-md hover:bg-gold hover:text-ivory transition-all"
          >
            Manage Users
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-[10px] tracking-[2px] uppercase bg-transparent border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-ivory transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? 'Signing out…' : 'Logout'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 max-sm:px-4">
        {/* ── Page header ── */}
        <div className="text-center mb-12 relative">
          <p className="text-[10px] tracking-[4px] uppercase text-gold mb-3">Management Console</p>
          <h1 className="font-display font-normal text-[36px] text-charcoal leading-tight">
            Invitation Manager
          </h1>
          <button
            onClick={() => setShowModal(true)}
            disabled={contentLoading}
            className="absolute right-4 top-[60px] text-[8px] tracking-[1px] uppercase bg-transparent border border-gold text-gold px-3 py-1 rounded-md hover:bg-gold hover:text-ivory transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {contentLoading ? 'Loading...' : 'Create Template'}
          </button>
          <div className="w-16 h-px bg-gold mx-auto my-4" />
          <p className="text-[13px] text-charcoal-light tracking-wide">
            Manage event content and personalized invitations
          </p>
        </div>

        {/* ── Generator form ── */}
        <div className="relative bg-white border border-gold/30 px-10 py-9 mb-10 form-top-bar max-sm:px-5 max-sm:py-6">
          <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2.5">
            Content Template
          </label>
          {contentLoading ? (
            <p className="text-sm text-charcoal-light mb-4">Loading templates…</p>
          ) : contents.length === 0 ? (
            <p className="text-sm text-red-700 mb-4">No templates yet. Create one first.</p>
          ) : (
            <select
              value={selectedContentId ?? ''}
              onChange={(e) => setSelectedContentId(e.target.value)}
              disabled={submitting || contentLoading}
              className="w-full mb-5 font-serif-body text-[18px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
            >
              {contents.map((content) => (
                <option key={content._id} value={content._id}>
                  {content.title}
                </option>
              ))}
            </select>
          )}

          <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2.5">
            Recipient Name
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !submitting && handleGenerate()}
            placeholder="e.g. Sarah, John Smith, José…"
            maxLength={80}
            disabled={submitting}
            className="w-full font-serif-body text-[18px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
          />

          <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mt-5 mb-2.5">
            Recipient Email
          </label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="guest@example.com"
            disabled={submitting}
            className="w-full font-serif-body text-[18px] text-charcoal bg-ivory border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
          />

          <div className="flex gap-3 mt-5 max-sm:flex-col">
            <button
              onClick={handleGenerate}
              disabled={
                submitting || contentLoading || !selectedContentId || !nameInput.trim() || !emailInput.trim()
              }
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

      {/* ── User Management Modal ── */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white border border-gold/30 px-10 py-9 mx-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto max-sm:px-5 max-sm:py-6">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 text-charcoal hover:text-gold text-xl"
            >
              ×
            </button>
            <h2 className="font-display font-normal text-[22px] text-charcoal mb-4">Manage Users</h2>
            <p className="text-[13px] text-charcoal-light mb-8">
              Create and manage application users in one place.
            </p>

            {!showUserForm ? (
              <button
                onClick={() => setShowUserForm(true)}
                className="w-full text-[10px] tracking-[2px] uppercase bg-charcoal text-ivory px-7 py-3.5 hover:bg-gold-dark transition-colors cursor-pointer mb-8"
              >
                + Add New User
              </button>
            ) : (
              <div className="relative bg-ivory/80 border border-gold/30 px-8 py-8 mb-8 rounded-lg">
                <button
                  onClick={() => setShowUserForm(false)}
                  className="absolute top-4 right-4 text-charcoal hover:text-gold text-xl"
                >
                  ×
                </button>
                <h3 className="font-display font-normal text-[20px] text-charcoal mb-5">Create New User</h3>

                <div className="mb-4">
                  <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={userFormData.userName}
                    onChange={(e) => setUserFormData({ ...userFormData, userName: e.target.value })}
                    placeholder="e.g. John Doe"
                    disabled={userSubmitting}
                    className="w-full font-serif-body text-[16px] text-charcoal bg-white border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userFormData.userEmail}
                    onChange={(e) => setUserFormData({ ...userFormData, userEmail: e.target.value })}
                    placeholder="e.g. john@example.com"
                    disabled={userSubmitting}
                    className="w-full font-serif-body text-[16px] text-charcoal bg-white border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={userFormData.userPwd}
                    onChange={(e) => setUserFormData({ ...userFormData, userPwd: e.target.value })}
                    placeholder="Min 6 characters"
                    disabled={userSubmitting}
                    className="w-full font-serif-body text-[16px] text-charcoal bg-white border border-gold/40 px-4 py-3.5 placeholder:text-charcoal/30 placeholder:italic focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-2">
                    Role
                  </label>
                  <select
                    value={userFormData.userRole}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        userRole: e.target.value as 'admin' | 'editor' | 'viewer',
                      })
                    }
                    disabled={userSubmitting}
                    className="w-full font-serif-body text-[16px] text-charcoal bg-white border border-gold/40 px-4 py-3.5 focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateUser}
                    disabled={userSubmitting}
                    className="flex-1 text-[10px] tracking-[2px] uppercase bg-charcoal text-ivory px-7 py-3.5 hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {userSubmitting ? (
                      <>
                        <div className="w-3 h-3 rounded-full border border-ivory/30 border-t-ivory animate-spin-slow" />
                        Creating…
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                  <button
                    onClick={() => setShowUserForm(false)}
                    disabled={userSubmitting}
                    className="flex-1 text-[10px] tracking-[2px] uppercase bg-gray-400 text-white px-7 py-3.5 hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                {userAlert && <Alert message={userAlert.message} type={userAlert.type} />}
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-normal text-[18px] text-charcoal">Active Users</h3>
              <span className="text-[11px] bg-gold text-ivory px-3 py-1 rounded-full">{users.length}</span>
            </div>

            {usersLoading ? (
              <Spinner />
            ) : users.length === 0 ? (
              <div className="text-center py-14 border border-dashed border-gold/30 bg-ivory-dark">
                <p className="text-3xl mb-3 opacity-40">👤</p>
                <p className="font-serif-body italic text-[16px] text-charcoal-light">
                  No users yet. Create your first user to get started.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {users.map((user) => (
                  <UserRow key={user._id} user={user} onDelete={handleDeleteUser} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Event Details Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white border border-gold/30 px-10 py-9 mx-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto max-sm:px-5 max-sm:py-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-charcoal hover:text-gold text-xl"
            >
              ×
            </button>
            <h2 className="font-display font-normal text-[22px] text-charcoal mb-6">Edit Event Details</h2>

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
              <label className="block text-[10px] tracking-[3px] uppercase text-gold-dark mb-4">
                Event Details
              </label>

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

              <button
                onClick={addDetailRow}
                disabled={contentSubmitting}
                className="mt-3 text-[9px] tracking-[2px] uppercase border border-gold text-gold px-3 py-2 rounded hover:bg-gold hover:text-ivory transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                + Add Detail
              </button>
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
        </div>
      )}

      <Toast message={toast} />
    </div>
  )
}
