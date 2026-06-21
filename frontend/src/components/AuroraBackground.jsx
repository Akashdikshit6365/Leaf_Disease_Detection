/**
 * Ambient premium background — aurora mesh + floating orbs + grid + noise.
 * Renders once at the app root behind all content.
 */
export default function AuroraBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-ink-900" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,4,5,0.04),rgba(2,3,3,0.82))]" />
      <div className="premium-grid" />

      <div className="absolute inset-0 opacity-[0.08] mix-blend-screen">
        <div
          className="absolute -left-24 top-[6%] h-[280px] w-[280px] rotate-[-18deg] bg-contain bg-center bg-no-repeat blur-[1px] md:h-[420px] md:w-[420px]"
          style={{ backgroundImage: "url('/leaf.svg')" }}
        />
        <div
          className="absolute right-[-110px] top-[18%] h-[220px] w-[220px] rotate-[22deg] bg-contain bg-center bg-no-repeat md:h-[340px] md:w-[340px]"
          style={{ backgroundImage: "url('/leaf.svg')" }}
        />
        <div
          className="absolute bottom-[-40px] left-[12%] h-[200px] w-[200px] rotate-[14deg] bg-contain bg-center bg-no-repeat md:h-[300px] md:w-[300px]"
          style={{ backgroundImage: "url('/leaf.svg')" }}
        />
      </div>

      <div className="absolute inset-0 opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/leaf.svg'), url('/leaf.svg')",
            backgroundPosition: '12% 24%, 88% 72%',
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundSize: '120px 120px, 150px 150px',
          }}
        />
      </div>

      <div className="absolute inset-0 mesh-bg opacity-90" />
      <div className="absolute inset-0 grid-bg opacity-45" />
      <div className="glow-pillar left-[-8rem] top-[6%] bg-[radial-gradient(circle,rgba(57,255,136,0.95),transparent_64%)]" style={{ animation: 'driftWide 16s ease-in-out infinite' }} />
      <div className="glow-pillar right-[-10rem] top-[18%] bg-[radial-gradient(circle,rgba(56,189,248,0.9),transparent_64%)]" style={{ animation: 'driftWide 18s ease-in-out infinite reverse' }} />
      <div className="absolute left-1/2 top-[14%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-white/[0.05]" style={{ animation: 'slowRotate 28s linear infinite' }} />
      <div className="absolute left-1/2 top-[14%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full border border-white/[0.03]" style={{ animation: 'slowRotate 38s linear infinite reverse' }} />

      <div className="orb orb-neon   w-[480px] h-[480px] -top-40 -left-24 animate-drift" />
      <div className="orb orb-violet w-[420px] h-[420px] top-[30%] -right-32 animate-drift" style={{ animationDelay: '-5s' }} />
      <div className="orb orb-sky    w-[520px] h-[520px] bottom-[-20%] left-[30%] animate-drift" style={{ animationDelay: '-9s' }} />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.07),transparent_18%),radial-gradient(circle_at_82%_30%,rgba(255,255,255,0.06),transparent_16%),radial-gradient(circle_at_56%_78%,rgba(255,255,255,0.05),transparent_20%)] opacity-60" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)' }}
      />

      <div className="noise" />
    </div>
  )
}
