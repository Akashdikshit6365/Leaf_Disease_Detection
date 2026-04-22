const LEAF_SRC_LOCAL = '/assets/hero-leaf.jpg'
const LEAF_SRC_REMOTE = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=960&h=960&fit=crop'

export default function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] reveal-up delay-2">
      <div className="absolute -inset-10 rounded-[48px] bg-gradient-to-r from-neon/18 via-accent-rose/8 to-sky-400/10 blur-3xl" style={{ animation: 'float-bg 7s ease-in-out infinite' }} />
      <div className="absolute -inset-14 rounded-full bg-gradient-to-br from-white/6 via-transparent to-neon/6 blur-[90px]" />

      <div className="panel-luxe overflow-hidden p-4 sm:p-5">
        <div className="ambient-frame" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_28%)] opacity-80" />

        <div className="relative space-y-5">
          <div className="flex items-center justify-between border-b border-white/8 px-1 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-rose/75" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent-amber/75" />
              <span className="h-2.5 w-2.5 rounded-full bg-neon/80 shadow-neon" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/35">Leaf scan preview</span>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/55">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/50" />
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(57,255,136,0.14),transparent_48%)]" />

            <div className="relative aspect-[0.98]">
              <img
                src={LEAF_SRC_LOCAL}
                alt="Leaf diagnosis preview"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  if (e.currentTarget.src !== LEAF_SRC_REMOTE) e.currentTarget.src = LEAF_SRC_REMOTE
                  else e.currentTarget.style.display = 'none'
                }}
              />

              <svg className="absolute inset-0 h-full w-full mix-blend-screen opacity-65" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ animation: 'subtle-pulse 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
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

              <div className="absolute inset-4 rounded-[24px] border border-white/10 sm:inset-5" />

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
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/48">Heatmap</span>
              </div>

              <div className="pointer-events-none absolute inset-x-4 top-16 bottom-28 z-20 overflow-hidden rounded-[24px] sm:inset-x-5 sm:top-18 sm:bottom-32">
                <div className="hero-scan-beam absolute inset-x-0 top-0 h-24 rounded-[24px]" />
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/20 sm:h-40 sm:w-40" />
                <div className="hero-scan-rings absolute inset-0" />
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-20 rounded-[24px] border border-white/10 bg-black/60 p-4 backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:p-5">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.26em] text-white/45">Detected condition</p>
                    <p className="mt-2 text-xl font-semibold leading-tight text-white sm:text-2xl">Tomato Early Blight</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                      Distinct fungal stress is visible around the mid-leaf region with spreading damage patterns.
                    </p>
                  </div>

                  <div className="min-w-[120px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">Result</p>
                    <p className="mt-2 text-xl font-semibold text-neon">Ready</p>
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-neon via-accent-amber to-accent-rose shadow-[0_0_18px_rgba(57,255,136,0.38)]" style={{ animation: 'progress-pulse 3s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/8 pt-4 sm:grid-cols-3">
            {[
              { value: 'Visual', label: 'evidence first' },
              { value: 'Clean', label: 'decision flow' },
              { value: 'Guided', label: 'next action' },
            ].map((item) => (
              <div key={item.value} className="text-center sm:text-left">
                <p className="text-lg font-semibold text-white">{item.value}</p>
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
