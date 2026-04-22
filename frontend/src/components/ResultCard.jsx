const severityStyle = (conf) => {
  if (conf == null) return { bar: 'bg-white/20', label: 'text-white/70', glow: '', tone: 'Awaiting analysis' }
  if (conf >= 0.85) return { bar: 'bg-neon', label: 'text-neon', glow: 'shadow-lg shadow-neon/40', tone: 'High confidence' }
  if (conf >= 0.6) return { bar: 'bg-accent-amber', label: 'text-accent-amber', glow: '', tone: 'Moderate confidence' }
  return { bar: 'bg-accent-rose', label: 'text-accent-rose', glow: '', tone: 'Low confidence' }
}

export default function ResultCard({
  plant,
  disease,
  predictedLabel,
  status = 'confirmed',
  confidence,
  severity,
  treatment,
  createdAt,
}) {
  const normalizedConfidence = confidence == null ? null : confidence > 1 ? confidence / 100 : confidence
  const pct = normalizedConfidence == null ? null : Math.round(normalizedConfidence * 100)
  const sev = severityStyle(normalizedConfidence)
  const isUncertain = status === 'uncertain'
  const isHealthy = /healthy/i.test((isUncertain ? predictedLabel : disease) || '')

  const ringRadius = 48
  const circumference = 2 * Math.PI * ringRadius
  const dash = circumference * (1 - ((pct || 0) / 100))

  return (
    <div className="panel-luxe p-8 md:p-10 reveal-fade">
      <div className="ambient-frame" />
      <div className="absolute inset-0 dot-bg opacity-15" />
      <div className="absolute -right-12 -top-16 h-64 w-64 orb orb-neon opacity-30" />

      <div className="relative space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1">
            <span className="luxury-kicker">
              <span className="eyebrow-dot" />
              Clinical finding
            </span>
            {plant && <p className="mt-4 text-xs font-mono uppercase tracking-[0.28em] text-white/40">{plant}</p>}
            <h2 className={`mt-4 text-4xl font-semibold tracking-tight md:text-5xl leading-tight ${isHealthy ? 'text-neon' : 'text-gradient-soft'}`}>
              {disease || 'Analysis'}
            </h2>
            {isUncertain && predictedLabel && (
              <p className="mt-4 text-sm leading-7 text-white/62">
                Best match: <span className="font-semibold text-neon">{predictedLabel}</span> · Needs clarification
              </p>
            )}
          </div>

          <div className={`inline-flex items-center gap-3 rounded-full border px-5 py-3 backdrop-blur-sm ${
            isUncertain 
              ? 'border-amber-400/30 bg-amber-400/8' 
              : isHealthy 
              ? 'border-neon/40 bg-neon/10' 
              : 'border-white/10 bg-white/5'
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full animate-glowPulse ${
              isUncertain ? 'bg-amber-400' : isHealthy ? 'bg-neon' : 'bg-white/70'
            }`} />
            <span className={`text-sm font-semibold ${
              isUncertain 
                ? 'text-amber-200' 
                : isHealthy 
                ? 'text-neon' 
                : 'text-white/80'
            }`}>
              {isUncertain ? 'Needs review' : isHealthy ? 'Healthy' : 'Diseased'}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="surface-card rounded-[28px] p-7 flex flex-col">
            {pct != null ? (
              <>
                <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/42">Confidence level</p>
                <div className="relative mt-7 flex-1 flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="rotate-[-90deg] w-full max-w-[160px]">
                    <circle cx="60" cy="60" r={ringRadius} stroke="rgba(255,255,255,0.08)" strokeWidth="9" fill="none" />
                    <circle
                      cx="60"
                      cy="60"
                      r={ringRadius}
                      stroke="currentColor"
                      strokeWidth="9"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dash}
                      className={`${sev.label} transition-all duration-1200 ${sev.glow}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${sev.label}`}>{pct}%</span>
                    <span className="mt-1 text-[9px] font-mono uppercase tracking-[0.24em] text-white/40">confidence</span>
                  </div>
                </div>
                <p className={`mt-7 text-center text-sm font-semibold ${sev.label}`}>{sev.tone}</p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/42">Analysis status</p>
                <div className="mt-7 flex-1 rounded-[20px] border border-white/10 bg-black/30 p-6 flex flex-col items-center justify-center text-center">
                  <p className="text-lg font-semibold text-white">Leaf scan analysis</p>
                  <p className="mt-3 text-xs font-mono uppercase tracking-[0.24em] text-white/38">Awaiting result</p>
                </div>
              </>
            )}
          </div>

          <div className="surface-card rounded-[28px] p-7">
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/42 mb-5">Diagnosis details</p>

            {pct != null ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-mono text-white/50">Confidence</span>
                    <span className={`text-sm font-semibold ${sev.label}`}>{pct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/8 relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${sev.bar}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoTile label="Condition" value={isHealthy ? 'Healthy' : disease || 'Unknown'} icon="check" />
                  <InfoTile label="Accuracy" value={`${pct}%`} icon="target" />
                  {createdAt && (
                    <InfoTile 
                      label="Scanned" 
                      value={new Date(createdAt).toLocaleDateString()} 
                      icon="calendar" 
                    />
                  )}
                  {severity && <InfoTile label="Severity" value={severity} icon="alert" />}
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {plant && <InfoTile label="Plant" value={plant} icon="leaf" />}
                <InfoTile label="Diagnosis" value={disease || 'Unknown'} icon="check" />
                {severity && <InfoTile label="Severity" value={severity} icon="alert" />}
                {treatment && <InfoTile label="Treatment" value={treatment} icon="spark" />}
                {createdAt && (
                  <InfoTile 
                    label="Scanned" 
                    value={new Date(createdAt).toLocaleDateString()} 
                    icon="calendar" 
                  />
                )}
              </div>
            )}

            {isUncertain && (
              <div className="mt-6 rounded-[20px] border border-amber-500/25 bg-amber-500/8 px-5 py-4 text-sm leading-6 text-amber-100">
                <p className="font-semibold mb-1">Clarification needed</p>
                <p className="text-amber-50/80">Please capture a clearer image with better lighting and one leaf prominently featured for accurate diagnosis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoTile({ label, value, icon }) {
  return (
    <div className="surface-card rounded-[18px] px-4 py-4 hover:border-white/15 hover:bg-white/[0.04] transition-all">
      <p className="text-[9px] font-mono uppercase tracking-[0.26em] text-white/40">{label}</p>
      <p className="mt-3 text-sm font-semibold text-white/88 line-clamp-2">{value}</p>
    </div>
  )
}
