import { useLocation } from 'react-router-dom'
import ChatBox from '../components/ChatBox.jsx'
import FeatureIcon from '../components/FeatureIcon.jsx'
import { imageAssets } from '../assets/imageAssets.js'

export default function Chat() {
  const { state } = useLocation()
  const diagnosisContext = state?.diagnosisContext || state?.result || null
  const disease = state?.disease || diagnosisContext?.disease || null
  const plant = diagnosisContext?.plant
  const symptoms = Array.isArray(diagnosisContext?.visible_symptoms)
    ? diagnosisContext.visible_symptoms.filter(Boolean)
    : []

  const seed = disease
    ? [{ role: 'assistant',
         content: `Hi - I can help with ${plant ? `${plant} - ` : ''}${disease}. Ask about cause, treatment, severity, or field management.${symptoms.length ? ` I can also use the visible symptoms from your scan: ${symptoms.join(', ')}.` : ''}` }]
    : []

  return (
    <div className="premium-shell space-y-10 md:space-y-14">
      {/* HERO HEADER */}
      <section className="relative pt-4 md:pt-6">
        <div className="absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        
        <div className="enterprise-shell mobile-depth-card reveal-up px-5 py-6 sm:px-8 sm:py-10 md:px-10 md:py-12">
          <div className="kinetic-band" />
          <img
            src={imageAssets.fieldCare}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 saturate-125"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/76 to-black/58" />
          <div className="ambient-frame" />
          <div className="enterprise-grid absolute inset-0 opacity-30" />

          <div className="relative space-y-7">
            <div className="space-y-5">
              <div className="glass-strip inline-flex items-center gap-3 px-4 py-2 reveal-up" style={{ animationDelay: '0.1s' }}>
                <span className="eyebrow-dot" />
                <span className="text-[10px] uppercase tracking-[0.34em] text-white/55">Expert Assistant</span>
                <span className="h-4 w-px bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-neon/80">
                  {disease ? 'Contextual' : 'General'} Knowledge
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="headline-luxe text-[38px] font-semibold heading-gradient sm:text-6xl md:text-7xl">
                  {disease ? (
                    <>Talk about <span className="text-neon">{disease}</span></>
                  ) : (
                    'Ask the assistant'
                  )}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/66 md:text-lg md:leading-9">
                  {disease
                    ? `Your diagnosis context is set to ${disease}. Ask about cause, treatment, management, or severity.`
                    : 'Ask anything about leaf diseases, diagnosis strategies, treatment options, or field management techniques.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2 md:gap-4 md:pt-4">
                {[
                  { icon: 'chat', label: disease ? 'Contextual answers' : 'Free-form Q&A' },
                  { icon: 'brain', label: 'Guided support' },
                  { icon: 'zap', label: 'Instant response' },
                ].map((item) => (
                  <div key={item.label} className="chip bg-white/[0.05] px-4 py-2.5 text-white/75 hover:bg-white/[0.08] transition-all">
                    <FeatureIcon name={item.icon} className="h-4 w-4 text-neon" />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="divider-neon" />

              <div className="grid gap-4 border-t border-white/8 pt-6 md:pt-8">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">Assistant mode</p>
                  <p className="mt-2 text-base font-semibold text-white md:text-lg">Plant care guidance</p>
                </div>
                <p className="text-sm leading-7 text-white/62 max-w-2xl">
                  Responses use the latest scan context to provide practical guidance tailored to your situation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAT BOX */}
      <ChatBox disease={disease} diagnosisContext={diagnosisContext} seedMessages={seed} />
    </div>
  )
}
