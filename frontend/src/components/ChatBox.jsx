import { useEffect, useRef, useState } from 'react'
import { sendChat } from '../api/client.js'
import FeatureIcon from './FeatureIcon.jsx'

export default function ChatBox({ disease = null, diagnosisContext = null, seedMessages = [] }) {
  const [messages, setMessages] = useState(seedMessages)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const submit = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || busy) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    setError(null)
    try {
      const { answer } = await sendChat({ messages: next, disease, diagnosisContext })
      setMessages(m => [...m, { role: 'assistant', content: answer }])
    } catch (err) {
      setError(err.message || 'Chat failed')
    } finally {
      setBusy(false)
    }
  }

  const suggest = async (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setBusy(true)
    setError(null)
    try {
      const { answer } = await sendChat({ messages: [...messages, { role: 'user', content: text }], disease, diagnosisContext })
      setMessages(m => [...m, { role: 'assistant', content: answer }])
    } catch (err) {
      setError(err.message || 'Chat failed')
    } finally {
      setBusy(false)
    }
  }

  const suggestions = disease
    ? [`Severity of ${disease}?`, 'Best treatment options?', 'Is it contagious to other plants?']
    : ['Common leaf diseases?', 'How do I prevent leaf spot?', 'When should I spray fungicide?']

  return (
    <div className="glass-strong mobile-depth-card flex h-[72vh] flex-col overflow-hidden rounded-[18px] reveal-fade md:h-[75vh] md:rounded-[24px]">
      <div className="kinetic-band" />
      <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-gradient-to-r from-white/[0.04] to-white/[0.02] px-4 py-4 backdrop-blur-xl md:px-7 md:py-5">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neon/30 bg-gradient-to-br from-neon/20 to-neon/5 text-neon shadow-lg md:h-11 md:w-11 md:rounded-xl">
            <span className="absolute inset-0 rounded-xl animate-pulseRing border border-neon/40" />
            <FeatureIcon name="brain" className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="truncate text-sm font-semibold text-white md:text-base">Care Assistant</div>
            <div className="mt-1 line-clamp-1 text-[10px] font-mono text-white/45 md:text-xs">
              Plant care guidance {disease && <span className="text-neon font-medium">· Reviewing {disease}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-neon/30 bg-neon/10 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-neon animate-glowPulse" />
          <span className="text-xs font-semibold text-neon">Live</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-transparent via-white/[0.01] p-4 md:space-y-6 md:p-7">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6">
            <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-neon/25 to-neon/5 border border-neon/30 flex items-center justify-center text-neon shadow-lg shadow-neon/20">
              <FeatureIcon name="chat" className="w-10 h-10" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Start a conversation</p>
              <p className="mt-2 text-sm text-white/55 max-w-sm">
                Ask questions about your {disease || 'plant'} diagnosis, treatment options, care steps, and more.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-4 max-w-md">
              {suggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => suggest(s)} 
                  className="chip hover:border-neon/60 hover:text-white hover:bg-neon/15 transition-all duration-300 text-white/70"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}
        {busy && <Message role="assistant" content={<TypingDots />} raw />}
      </div>

      {error && (
        <div className="mx-6 mb-4 px-5 py-4 text-sm text-red-200 border border-red-500/30 rounded-xl bg-red-500/8 backdrop-blur-sm flex items-start gap-3">
          <span className="mt-1 h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2 border-t border-white/8 bg-gradient-to-r from-white/[0.01] to-transparent p-3 backdrop-blur-xl md:gap-3 md:p-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about care, treatment, or severity..."
          disabled={busy}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none backdrop-blur-sm transition-all duration-300 placeholder-white/40 focus:border-neon/50 focus:bg-white/8 focus:ring-2 focus:ring-neon/15 md:rounded-xl md:px-5 md:py-3.5"
        />
        <button 
          type="submit" 
          disabled={busy || !input.trim()} 
          className="btn-primary flex-shrink-0 !px-4 !py-3 md:!px-6"
          title="Send message"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12h16m0 0l-6-6m6 6l-6 6" />
          </svg>
        </button>
      </form>
    </div>
  )
}

function Message({ role, content, raw = false }) {
  const mine = role === 'user'
  return (
    <div className={`flex gap-3 ${mine ? 'justify-end' : 'justify-start'} reveal-up`}>
      {!mine && (
        <div className="h-8 w-8 flex-shrink-0 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/30 flex items-center justify-center text-neon shadow-lg">
          <FeatureIcon name="brain" className="w-3.5 h-3.5" />
        </div>
      )}
      <div
        className={[
          'max-w-[86%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap md:max-w-[75%] md:rounded-2xl md:px-5 md:py-3.5',
          mine
            ? 'bg-gradient-to-br from-neon to-neon-600 text-ink-900 rounded-br-none shadow-lg shadow-neon/30 font-medium'
            : 'bg-white/[0.06] border border-white/10 text-white/90 rounded-bl-none backdrop-blur-sm',
        ].join(' ')}
      >
        {raw ? content : content}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      <span className="h-1.5 w-1.5 rounded-full bg-neon animate-typing" />
      <span className="h-1.5 w-1.5 rounded-full bg-neon animate-typing" style={{ animationDelay: '0.2s' }} />
      <span className="h-1.5 w-1.5 rounded-full bg-neon animate-typing" style={{ animationDelay: '0.4s' }} />
    </span>
  )
}
