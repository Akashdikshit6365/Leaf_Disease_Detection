/** Refined brand mark — concentric pulsing rings over a leaf glyph. */
export default function Logo({ size = 36, ring = true }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-xl bg-neon/15 border border-neon/30 shadow-neon"
      style={{ width: size, height: size }}
    >
      {ring && <span className="absolute inset-0 rounded-xl animate-pulseRing border border-neon/60" />}
      <svg viewBox="0 0 24 24" className="relative z-10" style={{ width: size * 0.55, height: size * 0.55 }}
           fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#5bff9f" />
            <stop offset="1" stopColor="#16d86a" />
          </linearGradient>
        </defs>
        <path d="M20 4C11 3 4 10 5 20c9 1 16-6 15-16Z" fill="url(#lg)" />
        <path d="M6 19 17 8" stroke="#050608" strokeWidth="1.6" />
      </svg>
    </span>
  )
}
