const LEAF_SRC =
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1100&h=1300&fit=crop&crop=entropy&auto=format&q=92'

export default function HeroMockup() {
  return (
    <div className="perspective-stage relative mx-auto w-full max-w-[560px] reveal-up delay-2">
      <div className="absolute -inset-4 rounded-[28px] border border-white/8 bg-white/[0.018] blur-sm" />
      <div className="absolute inset-x-10 -top-4 h-px bg-gradient-to-r from-transparent via-neon/55 to-transparent" />

      <div className="enterprise-shell device-stage overflow-hidden p-3 sm:p-4">
        <div className="ambient-frame" />
        <div className="enterprise-grid absolute inset-0 opacity-45" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between border-b border-white/8 px-1 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon shadow-neon" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45">Live capture</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/35">Mobile preview</span>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/60 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.96)]">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/0 via-transparent to-black/34" />
            <div className="absolute inset-0 z-10 opacity-20" style={{ background: 'linear-gradient(125deg, rgba(255,255,255,0.06), transparent 30%, transparent 70%, rgba(255,255,255,0.04))' }} />

            <div className="relative aspect-[0.76] sm:aspect-[0.9]">
              <img
                src={LEAF_SRC}
                alt="Leaf diagnosis preview"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover saturate-125 contrast-110"
              />

              <svg className="absolute inset-0 h-full w-full mix-blend-screen opacity-28" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ animation: 'subtle-pulse 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                <defs>
                  <radialGradient id="heroHeatA" cx="40%" cy="56%" r="35%">
                    <stop offset="0" stopColor="#ff6b6b" stopOpacity="0.68" />
                    <stop offset="0.4" stopColor="#fbbf24" stopOpacity="0.46" />
                    <stop offset="0.82" stopColor="#39FF88" stopOpacity="0.12" />
                    <stop offset="1" stopColor="#39FF88" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="heroHeatB" cx="70%" cy="35%" r="22%">
                    <stop offset="0" stopColor="#fb7185" stopOpacity="0.52" />
                    <stop offset="1" stopColor="#fb7185" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="100" height="100" fill="url(#heroHeatA)" />
                <rect width="100" height="100" fill="url(#heroHeatB)" />
              </svg>

              <div className="absolute inset-3 rounded-[16px] border border-white/10 sm:inset-4" />
              <div className="absolute left-1/2 top-1/2 z-20 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/15 opacity-55" style={{ animation: 'pulseRing 3s ease-out infinite' }} />

              <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md sm:left-5 sm:top-5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-neon opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/76">Live analysis</span>
                </div>
              </div>

              <div className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/38 px-3 py-2 backdrop-blur-md sm:right-5 sm:top-5">
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/58">Preview</span>
              </div>

              <div className="pointer-events-none absolute inset-x-3 top-14 bottom-28 z-20 overflow-hidden rounded-[18px] opacity-70 sm:inset-x-4 sm:bottom-32">
                <div className="scan-beam-pro absolute inset-x-0 top-0 h-24 rounded-[18px]" />
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/20 sm:h-40 sm:w-40" />
                <div className="hero-scan-rings absolute inset-0" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 z-20 rounded-[18px] border border-white/10 bg-black/74 p-3 backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45">Diagnosis</p>
                    <p className="mt-2 text-lg font-semibold leading-tight text-white sm:text-xl">Leaf Health Scan</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/64 sm:text-sm">
                      A clean close-up leaf preview with diagnosis and next action in one view.
                    </p>
                  </div>

                  <div className="min-w-[104px] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Confidence</p>
                    <p className="mt-2 text-lg font-semibold text-neon">88%</p>
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-neon via-accent-amber to-accent-rose shadow-[0_0_18px_rgba(57,255,136,0.38)]" style={{ animation: 'progress-pulse 3s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2 border-t border-white/8 pt-3 sm:grid-cols-3">
            {[
              { value: 'Visual', label: 'evidence first' },
              { value: 'Clean', label: 'decision flow' },
              { value: 'Guided', label: 'next action' },
            ].map((item) => (
              <div key={item.value} className="text-center sm:text-left">
                <p className="text-base font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-white/42">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-bg {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -10px); }
          50% { transform: translate(0, 18px); }
          75% { transform: translate(-10px, 8px); }
        }

        @keyframes subtle-pulse {
          0%, 100% { opacity: 0.62; }
          50% { opacity: 0.74; }
        }

        @keyframes heroScanBeam {
          0% { transform: translateY(-18%); opacity: 0; }
          10% { opacity: 1; }
          55% { opacity: 1; }
          100% { transform: translateY(330px); opacity: 0; }
        }

        @keyframes heroScanRing {
          0%, 100% { transform: scale(0.94); opacity: 0.18; }
          50% { transform: scale(1.02); opacity: 0.38; }
        }

        @keyframes progress-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(57, 255, 136, 0.25); }
          50% { box-shadow: 0 0 18px rgba(57, 255, 136, 0.45); }
        }

        .hero-scan-beam {
          background:
            linear-gradient(
              180deg,
              rgba(57,255,136,0) 0%,
              rgba(57,255,136,0.14) 22%,
              rgba(92,240,255,0.24) 42%,
              rgba(57,255,136,0.72) 50%,
              rgba(92,240,255,0.24) 58%,
              rgba(57,255,136,0.14) 76%,
              rgba(57,255,136,0) 100%
            );
          box-shadow:
            0 0 24px rgba(57,255,136,0.32),
            0 0 48px rgba(92,240,255,0.14);
          animation: heroScanBeam 2.8s cubic-bezier(0.2, 0.7, 0.22, 1) infinite;
        }

        .hero-scan-rings {
          background:
            radial-gradient(circle at center, rgba(57,255,136,0.18), transparent 28%),
            radial-gradient(circle at center, rgba(56,189,248,0.12), transparent 52%);
          animation: heroScanRing 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
