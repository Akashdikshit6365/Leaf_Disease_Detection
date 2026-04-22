import { useLocation } from 'react-router-dom'
import ChatBox from '../components/ChatBox.jsx'

export default function Chat() {
  const { state } = useLocation()
  const disease = state?.disease || null

  const seed = disease
    ? [{ role: 'assistant',
         content: `Hi - I can help with ${disease}. Ask about cause, treatment, severity, or field management.` }]
    : []

  return (
    <div className="space-y-6">
      <header className="reveal-up">
        <span className="chip">AI Assistant</span>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold heading-gradient">
          Talk to the AI
        </h1>
        <p className="mt-3 text-white/60 text-sm md:text-base max-w-2xl">
          Powered by Groq · llama3-8b-8192.{` `}
          {disease ? (
            <span>Context: <span className="text-neon font-mono">{disease}</span></span>
          ) : (
            'Ask anything about leaf diseases, diagnosis, or treatment.'
          )}
        </p>
      </header>

      <ChatBox disease={disease} seedMessages={seed} />
    </div>
  )
}
