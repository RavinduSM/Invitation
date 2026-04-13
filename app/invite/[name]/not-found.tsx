import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(135deg, #2C2C2C 0%, #3a3228 45%, #2C2C2C 100%)' }}
    >
      <span className="font-serif-body text-gold text-2xl tracking-widest opacity-60 mb-6">✦</span>
      <h1 className="font-display font-normal text-ivory text-[42px] leading-tight mb-3">
        Invitation Not Found
      </h1>
      <p className="font-serif-body text-blush/60 text-[16px] italic mb-10 max-w-sm">
        This invitation does not exist or may have been revoked.
      </p>
      <Link
        href="/admin"
        className="text-[10px] tracking-[3px] uppercase text-blush/50 hover:text-gold transition-colors"
      >
        ← Return to Admin Panel
      </Link>
    </div>
  )
}
