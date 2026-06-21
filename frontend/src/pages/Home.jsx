import { Link } from 'react-router-dom'
import FeatureIcon from '../components/FeatureIcon.jsx'
import HeroMockup from '../components/HeroMockup.jsx'
import { imageAssets } from '../assets/imageAssets.js'

const FEATURES = [
  {
    icon: 'scan',
    title: 'Fast diagnosis',
    body: 'Capture a leaf and move into a clean diagnosis flow without digging through controls or extra panels.',
  },
  {
    icon: 'brain',
    title: 'Visual evidence',
    body: 'The result experience stays transparent, helping users understand what the scan is seeing instead of dropping a cold label.',
  },
  {
    icon: 'chat',
    title: 'Care guidance',
    body: 'Treatment direction follows the diagnosis immediately, so the product feels useful beyond the prediction itself.',
  },
  {
    icon: 'history',
    title: 'Saved sessions',
    body: 'Previous scans remain available as part of the same journey, not as a disconnected archive page.',
  },
]

const NOTES = [
  'Single image upload or live camera capture',
  'Visual explanation for better trust in the result',
  'Care guidance connected directly to diagnosis',
]

const METRICS = [
  { value: 'Fast', label: 'scan to recommendation' },
  { value: 'Clear', label: 'evidence-led result' },
  { value: 'Guided', label: 'care steps included' },
]

export default function Home() {
  return (
    <div className="premium-shell space-y-14 md:space-y-24">
      <section className="relative pt-2 md:pt-8">
        <div className="absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        <div className="grid items-start gap-6 xl:grid-cols-[0.94fr_1.06fr]">
          <div className="enterprise-shell mobile-depth-card p-5 sm:p-7 md:p-10 xl:p-12 reveal-up">
            <div className="kinetic-band" />
            <img
              src={imageAssets.greenhouse}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-32 saturate-110"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/96 via-black/88 to-black/76" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/72" />
            <div className="ambient-frame" />
            <div className="enterprise-grid absolute inset-0 opacity-25" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent" />

            <div className="relative space-y-7">
              <div className="space-y-5">
                <div className="glass-strip inline-flex max-w-full items-center gap-3 px-3 py-2">
                  <span className="eyebrow-dot" />
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/55">Plant diagnostic workspace</span>
                  <span className="h-4 w-px bg-white/10" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-neon/80">Mobile ready</span>
                </div>
                <h1 className="headline-luxe max-w-3xl text-[38px] font-semibold heading-gradient drop-shadow-[0_8px_28px_rgba(0,0,0,0.82)] sm:text-5xl md:text-6xl xl:text-[64px]">
                  Diagnose leaf disease with a cleaner decision flow.
                </h1>
                <p className="max-w-2xl text-[15px] font-medium leading-7 text-white/78 drop-shadow-[0_4px_18px_rgba(0,0,0,0.86)] md:text-base md:leading-8">
                  Capture a leaf, review the finding with visual evidence, then move directly into practical care guidance. Built for phone-first field use.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
                <Link to="/scan" className="btn-primary w-full text-sm font-semibold sm:w-auto sm:text-base">
                  Start scanning
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <Link to="/history" className="btn-ghost w-full text-sm font-medium sm:w-auto sm:text-base">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  View history
                </Link>
              </div>

              <div className="divider-neon" />

              <div className="grid gap-3 sm:grid-cols-3">
                {METRICS.map((item) => (
                  <div key={item.value} className="metric-strip">
                    <p className="text-xl font-semibold text-white md:text-2xl">{item.value}</p>
                    <p className="mt-1 text-xs leading-5 text-white/48">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 border-t border-white/8 pt-5 md:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">Workflow</p>
                  <p className="mt-3 text-base font-semibold text-white">
                    One visual path from image capture to next action.
                  </p>
                </div>

                <div className="space-y-3">
                  {NOTES.map((note) => (
                    <div key={note} className="flex items-start gap-3 text-sm leading-7 text-white/62">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neon shadow-neon" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <HeroMockup />
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
        <div className="space-y-8">
          <div className="max-w-xl">
            <span className="luxury-kicker">
              <span className="eyebrow-dot" />
              Why LeafAI
            </span>
            <h2 className="mt-5 text-3xl font-semibold heading-gradient md:text-5xl">
              Designed for field decisions, not dashboard noise.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/62">
              The interface keeps capture, evidence, guidance, and history close together while avoiding repeated panels that slow users down on mobile.
            </p>
          </div>

          <div className="space-y-4 border-l border-white/10 pl-5 md:pl-7">
            {[
              'Large hero presence that sets the tone.',
              'Spatial depth and controlled glow instead of random gradients.',
              'Fewer containers, stronger hierarchy, better motion rhythm.',
            ].map((point) => (
              <div key={point} className="text-sm leading-7 text-white/58">
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="enterprise-shell mobile-depth-card overflow-hidden p-0">
          <div className="kinetic-band" />
          <img
            src={imageAssets.fieldCare}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-14"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/72" />
          <div className="ambient-frame" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(57,255,136,0.08),transparent_32%)] opacity-90" />

          <div className="relative divide-y divide-white/8">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="grid gap-4 px-5 py-6 sm:px-7 md:grid-cols-[88px_1fr] md:gap-6 md:px-8 md:py-7"
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <div className="flex items-start gap-4 md:block">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-neon/30 bg-gradient-to-br from-neon/16 to-neon/5 text-neon shadow-lg">
                    <FeatureIcon name={feature.icon} className="h-6 w-6" />
                  </div>
                  <p className="pt-3 text-[10px] font-mono uppercase tracking-[0.28em] text-white/34 md:pt-5">
                    0{index + 1}
                  </p>
                </div>

                <div className="max-w-2xl">
                  <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-8 text-white/62 md:text-[15px]">
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel-orbit relative overflow-hidden p-6 sm:p-8 md:p-10 xl:p-12">
        <div className="ambient-frame" />
        <div className="absolute inset-0 spot-grid opacity-10" />
        <div className="absolute -right-24 -top-24 h-96 w-96 orb orb-neon opacity-25" />
        <div className="absolute -left-32 -bottom-20 h-80 w-80 orb orb-sky opacity-20" />

        <div className="relative grid gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div className="space-y-6">
            <div>
              <span className="luxury-kicker">
                <span className="eyebrow-dot" />
                Ready to scan
              </span>
              <h2 className="mt-6 max-w-4xl text-4xl font-semibold heading-gradient md:text-5xl xl:text-6xl">
                Let the product feel premium through pace, clarity, and restraint.
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-8 text-white/66 md:text-lg">
              The strongest upgrade here is not more decoration. It is a cleaner hierarchy, larger moments, and fewer repeated boxes competing for attention.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/scan" className="btn-primary text-base font-semibold">
                Begin scan
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link to="/chat" className="btn-ghost text-base font-medium">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Ask assistant
              </Link>
            </div>
          </div>

          <div className="grid gap-6 border-t border-white/8 pt-6 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/38">Design direction</p>
              <p className="mt-3 text-2xl font-semibold text-white">Less boxed. More composed.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {[
                'Use larger sections instead of many small cards.',
                'Let typography carry more of the hierarchy.',
                'Keep supporting details lighter than primary actions.',
              ].map((line) => (
                <div key={line} className="rounded-[22px] surface-card px-4 py-4 text-sm leading-7 text-white/58">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
