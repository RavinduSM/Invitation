import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import Invitation from '@/models/Invitation'
import { normalizeName, EVENT } from '@/lib/utils'
import { Divider } from '@/components/Divider'

interface PageProps {
  params: Promise<{ name: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { name } = await params
  const decoded = decodeURIComponent(name)

  // Verify this invitation exists in DB
  await connectDB()
  const invitation = await Invitation.findOne({ normalizedName: normalizeName(decoded) }).lean()

  if (!invitation) notFound()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #2C2C2C 0%, #3a3228 45%, #2C2C2C 100%)' }}
    >
      {/* Ambient radial glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(192,135,63,0.13) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(242,215,192,0.08) 0%, transparent 50%)',
        }}
      />

      {/* Floating card */}
      <div className="relative w-full max-w-[540px] bg-ivory text-center px-14 py-14 invite-card-border animate-card-float max-sm:px-7 max-sm:py-10">

        {/* Ornament */}
        <span className="animate-fade-in-up stagger-1 block font-serif-body text-gold text-xl tracking-[6px] mb-5 opacity-70">
          ✦ ✦ ✦
        </span>

        {/* Pre-title */}
        <p className="animate-fade-in-up stagger-2 text-[10px] tracking-[4px] uppercase text-gold mb-4">
          You are cordially invited
        </p>

        {/* Name */}
        <h1
          className="animate-name-reveal stagger-2 font-display font-normal leading-tight mb-2"
          style={{ fontSize: 'clamp(34px, 6vw, 52px)' }}
        >
          Dear{' '}
          <em className="italic" style={{ color: '#9A6A2A' }}>
            {decoded}
          </em>
          ,
        </h1>

        <Divider />

        {/* Event title */}
        <p className="animate-fade-in-up stagger-3 font-serif-body font-light text-[22px] tracking-wide text-charcoal mb-6">
          {EVENT.title}
        </p>

        {/* Details grid */}
        <div className="animate-fade-in-up stagger-4 grid grid-cols-2 gap-5 mb-8 max-sm:grid-cols-1">
          {EVENT.details.map(({ label, value }) => (
            <div key={label} className="text-center">
              <span className="block text-[9px] tracking-[3px] uppercase text-gold mb-1.5">
                {label}
              </span>
              <span className="font-serif-body text-[15px] text-charcoal leading-snug whitespace-pre-line">
                {value}
              </span>
            </div>
          ))}
        </div>

        

        {/* RSVP footer */}
        <p className="animate-fade-in-up stagger-5 mt-8 font-serif-body text-[12px] italic text-charcoal-light opacity-60">
          {EVENT.rsvp}
        </p>
      </div>

      {/* Back link */}
      <a
        href="/admin"
        className="mt-8 text-blush/50 text-[10px] tracking-[2px] uppercase hover:text-gold transition-colors"
      >
        ← Admin Panel
      </a>
    </div>
  )
}
