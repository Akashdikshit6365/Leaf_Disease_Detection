import { useState } from 'react'

export default function HeatmapViewer({ imageUrl, heatmapUrl }) {
  const [show, setShow] = useState(true)
  const [opacity, setOpacity] = useState(0.78)
  const [mode, setMode] = useState('overlay')

  if (!imageUrl && !heatmapUrl) {
    return (
      <div className="panel-luxe p-8 md:p-10 reveal-fade">
        <div className="ambient-frame" />
        <div className="relative space-y-6">
          <div>
            <span className="luxury-kicker">
              <span className="eyebrow-dot" />
              Visual diagnostics
            </span>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Heatmap analysis</h2>
          </div>
          <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.02] p-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mx-auto mb-6">
              <svg className="h-10 w-10 text-white/40" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">No heatmap available</p>
            <p className="mt-2 text-sm text-white/55">Visual evidence will appear here for supported diagnoses.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel-luxe reveal-fade p-8 md:p-10">
      <div className="ambient-frame" />
      <div className="absolute inset-0 dot-bg opacity-15" />
      <div className="relative space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex-1">
            <span className="luxury-kicker">
              <span className="eyebrow-dot" />
              Visual diagnostics
            </span>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Heatmap analysis</h2>
            <p className="mt-3 max-w-xl text-base leading-8 text-white/62">
              See exactly where the diagnosis is focusing. The attention map shows the neural network's strongest indicators of disease patterns.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur">
            {['overlay', 'split'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] transition-all duration-300 capitalize ${
                  mode === m 
                    ? 'bg-neon text-ink-900 shadow-lg shadow-neon/40' 
                    : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {m} mode
              </button>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_bottom,rgba(57,255,136,0.10),transparent_40%)]" />

          {mode === 'overlay' ? (
            <div className="relative aspect-square">
              <img src={imageUrl} alt="Original leaf" className="absolute inset-0 h-full w-full object-contain" />
              {heatmapUrl && (
                <img
                  src={heatmapUrl}
                  alt="Grad-CAM heatmap"
                  className="absolute inset-0 h-full w-full object-contain transition-opacity duration-500"
                  style={{ opacity: show ? opacity : 0, mixBlendMode: 'screen' }}
                />
              )}
              {show && <div className="absolute inset-0 scanline pointer-events-none" />}
              <div className="absolute inset-6 rounded-[28px] border border-white/10 pointer-events-none" />
              <div className="absolute left-6 top-6 chip !bg-black/50 !border-white/20 !text-white/80 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                Original
              </div>
              {heatmapUrl && (
                <div className="absolute right-6 top-6 chip-neon !bg-black/40 !border-neon/40 font-medium">
                  <span className="status-dot status-online" />
                  Attention map
                </div>
              )}
            </div>
          ) : (
            <div className="grid aspect-square grid-cols-2 divide-x divide-white/10">
              <div className="relative bg-black/50 flex items-center justify-center">
                <div className="relative flex-1 h-full flex items-center justify-center p-8">
                  <img src={imageUrl} alt="Original" className="max-h-full max-w-full object-contain" />
                </div>
                <span className="absolute bottom-6 left-6 chip !bg-black/50 !border-white/20 !text-white/80 font-medium">
                  Original
                </span>
              </div>
              <div className="relative bg-black/50 flex items-center justify-center">
                <div className="relative flex-1 h-full flex items-center justify-center p-8">
                  <img src={heatmapUrl || imageUrl} alt="Heatmap" className="max-h-full max-w-full object-contain" />
                </div>
                <span className="absolute bottom-6 left-6 chip-neon !bg-black/40 !border-neon/40 font-medium">
                  Attention
                </span>
              </div>
            </div>
          )}
        </div>

        {mode === 'overlay' && heatmapUrl && (
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6 space-y-5">
            <label className="inline-flex cursor-pointer select-none items-center gap-4">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="peer sr-only" />
              <div className="relative h-7 w-12 rounded-full bg-white/10 transition peer-checked:bg-neon peer-checked:shadow-lg peer-checked:shadow-neon/40">
                <span className="absolute left-0.5 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-semibold text-white">Show attention map</span>
            </label>

            {show && (
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex flex-1 items-center gap-4">
                  <span className="font-mono text-xs text-white/50 whitespace-nowrap">Opacity</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="flex-1 accent-neon cursor-pointer"
                  />
                  <span className="w-12 text-right font-mono text-xs font-semibold text-neon">{Math.round(opacity * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.28em] text-white/45">
            <span>Attention scale</span>
            <div
              className="h-2.5 flex-1 overflow-hidden rounded-full border border-white/10"
              style={{ background: 'linear-gradient(90deg, #39FF88 0%, #fbbf24 50%, #fb7185 100%)' }}
            />
            <span>Low  ·  High</span>
          </div>
        </div>
      </div>
    </div>
  )
}
