export function Divider() {
  return (
    <div className="flex items-center gap-4 my-7">
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(to right, transparent, #C0873F, transparent)' }}
      />
      <div className="w-1.5 h-1.5 rotate-45 bg-gold" />
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(to right, transparent, #C0873F, transparent)' }}
      />
    </div>
  )
}
