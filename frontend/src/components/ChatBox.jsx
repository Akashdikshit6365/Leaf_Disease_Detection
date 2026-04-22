import { useEffect, useRef, useState } from 'react'
import { sendChat } from '../api/client.js'
import FeatureIcon from './FeatureIcon.jsx'

export default function ChatBox({ disease = null, seedMessages = [] }) {
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
      const { answer } = await sendChat({ messages: next, disease })
      setMessages(m => [...m, { role: 'assistant', content: answer }])
    } catch (err) {
      setError(err.message || 'Chat failed')
    } finally {
      setBusy(false)
    }
  }

  const suggest = (text) => { setInput(text); setTimeout(() => submit({ preventDefault: () => {} }), 0) }

  const suggestions = disease
    ? [`Severity of ${disease}?`, 'Best treatment options?', 'Is it contagious to other plants?']
    : ['Common leaf diseases?', 'How do I prevent leaf spot?', 'When should I spray fungicide?']

  return (
    <div className="glass-strong flex flex-col h-[75vh] overflow-hidden reveal-fade rounded-[28px]">
      <div className="flex items-center justify-between px-7 py-5 border-b border-white/8 bg-gradient-to-r from-white/[0.04] to-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/30 flex items-center justify-center text-neon shadow-lg">
            <span className="absolute inset-0 rounded-xl animate-pulseRing border border-neon/40" />
            <FeatureIcon name="brain" className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold text-white">AI Care Assistant</div>
            <div className="text-xs font-mono text-white/45 mt-1">
              Groq · Powered by LLaMA {disease && <span className="text-neon font-medium">· Analyzing {disease}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-neon/30 bg-neon/10">
          <span className="h-2 w-2 rounded-full bg-neon animate-glowPulse" />
          <span className="text-xs font-semibold text-neon">Live</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-7 space-y-6 bg-gradient-to-b from-transparent via-white/[0.01]">
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

      <form onSubmit={submit} className="border-t border-white/8 p-4 md:p-5 flex gap-3 bg-gradient-to-r from-white/[0.01] to-transparent backdrop-blur-xl">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about care, treatment, or severity..."
          disabled={busy}
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-white/40 transition-all duration-300 focus:border-neon/50 focus:ring-2 focus:ring-neon/15 focus:bg-white/8 outline-none backdrop-blur-sm"
        />
        <button 
          type="submit" 
          disabled={busy || !input.trim()} 
          className="btn-primary !py-3 !px-6 flex-shrink-0"
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
          'max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap',
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
