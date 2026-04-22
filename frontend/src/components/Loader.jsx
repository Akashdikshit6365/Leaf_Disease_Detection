import { useEffect, useState } from 'react'

const DEFAULT_MESSAGES = [
  'Analyzing leaf patterns...',
  'Detecting disease...',
  'Generating insights...',
  'Rendering heatmap...',
]

export default function Loader({ messages = DEFAULT_MESSAGES, interval = 1400 }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), interval)
    return () => clearInterval(t)
  }, [messages, interval])

  return (
    <div className="relative flex flex-col items-center justify-center gap-8 py-16" role="status" aria-live="polite">
      {/* orb ring */}
      <div className="relative h-28 w-28">
        <div className="absolute inset-0 rounded-full border border-neon/30 animate-pulseRing" />
        <div className="absolute inset-3 rounded-full border border-neon/50 animate-pulseRing" style={{ animationDelay: '0.4s' }} />
        <div className="absolute inset-6 rounded-full border border-neon/70 animate-pulseRing" style={{ animationDelay: '0.8s' }} />
        <div className="absolute inset-[38%] rounded-full bg-neon shadow-neon-lg animate-glowPulse" />
        {/* orbit dots */}
        <svg viewBox="0 0 120 120" className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
          <circle cx="60" cy="6"   r="3" fill="#39FF88" />
          <circle cx="114" cy="60" r="2" fill="#5bff9f" opacity="0.7" />
        </svg>
      </div>

      {/* rotating caption */}
      <div className="relative text-center">
        <p key={idx} className="text-sm md:text-base font-mono tracking-wider text-white/80 reveal-fade">
          {messages[idx]}
        </p>
        <div className="mt-2 flex justify-center gap-1">
          <span className="h-1 w-1 rounded-full bg-neon animate-typing" />
          <span className="h-1 w-1 rounded-full bg-neon animate-typing" style={{ animationDelay: '0.2s' }} />
          <span className="h-1 w-1 rounded-full bg-neon animate-typing" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* progress bar */}
      <div className="w-64 h-1.5 rounded-full overflow-hidden bg-white/5 border border-white/5">
        <div className="h-full shimmer rounded-full" />
      </div>
    </div>
  )
}
