import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ResultCard from '../components/ResultCard.jsx'
import HeatmapViewer from '../components/HeatmapViewer.jsx'
import Loader from '../components/Loader.jsx'
import FeatureIcon from '../components/FeatureIcon.jsx'
import { askAI } from '../api/client.js'

const SECTION_ICONS = {
  Cause: 'brain',
  Impact: 'shield',
  Treatment: 'spark',
  Urgency: 'clock',
}

export default function Result() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const result = state?.result
  const isModelResult = result?.source === 'model' || !!result?.status
  const isUncertain = result?.status === 'uncertain'

  useEffect(() => {
    if (!result) navigate('/scan', { replace: true })
  }, [result, navigate])

  const [explanation, setExplanation] = useState(result?.explanation || '')
  const [loadingExpl, setLoadingExpl] = useState(isModelResult && !result?.explanation && !isUncertain)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!result || !isModelResult || result.explanation || isUncertain) return
    let alive = true
    ;(async () => {
      try {
        const { answer } = await askAI({ disease: result.disease })
        if (alive) setExplanation(answer)
      } catch (e) {
        if (alive) setErr(e.message)
      } finally {
        if (alive) setLoadingExpl(false)
      }
    })()
    return () => { alive = false }
  }, [result, isModelResult, isUncertain])

  const sections = useMemo(() => parseSections(explanation), [explanation])
  if (!result) return null

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="panel-hero surface-mist reveal-up px-8 py-10 md:px-12 md:py-14">
        <div className="ambient-frame" />
        <div className="noise opacity-12" />
        <div className="orb orb-neon -right-16 -top-20 h-64 w-64 opacity-30" />
        <div className="orb orb-sky left-12 top-16 h-48 w-48 opacity-25" />

        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-8">
            <div>
              <span className="luxury-kicker">
                <span className="eyebrow-dot" />
                Your diagnosis
              </span>
              <h1 className="headline-luxe mt-8 text-7xl font-semibold heading-gradient md:text-8xl">
                Results with clarity.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-9 text-white/66 md:text-xl">
                Below you'll find the diagnosis result, visual evidence from the heatmap, and expert care guidance to help you act.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { icon: 'eye', label: 'Visual evidence' },
                { icon: 'target', label: 'Exact diagnosis' },
                { icon: 'book', label: 'Care guidance' },
              ].map((item) => (
                <div key={item.label} className="chip bg-white/[0.05] px-4 py-2.5 text-white/75 hover:bg-white/[0.08] transition-all">
                  <FeatureIcon name={item.icon} className="h-4 w-4 text-neon" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                label: 'Diagnosis',
                value: result.disease || 'Analysis',
                detail: 'Lead finding'
              },
              {
                label: 'Plant',
                value: result.plant || 'Specimen',
                detail: 'Identified type'
              },
              {
                label: 'Status',
                value: isUncertain ? 'Review' : 'Confirmed',
                detail: isUncertain ? 'Needs clarification' : 'High confidence'
              },
            ].map((item) => (
              <div key={item.label} className="card-lift surface-card rounded-2xl px-5 py-5 hover:border-white/15">
                <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white truncate">{item.value}</p>
                <p className="mt-1 text-xs text-white/45">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <Link to="/scan" className="btn-ghost text-sm font-medium">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            New scan
          </Link>
          {isModelResult && !isUncertain && (
            <Link to="/chat" state={{ disease: result.disease }} className="btn-primary text-sm font-medium">
              <FeatureIcon name="chat" className="h-4 w-4" />
              Ask assistant
            </Link>
          )}
        </div>
        {result.id && (
          <div className="chip bg-white/[0.04] px-4 py-2 font-mono text-xs text-white/55 hover:bg-white/[0.08] transition-all">
            <span className="text-neon font-semibold">#{result.id}</span> · Scan record
          </div>
        )}
      </div>

      <section className={`grid gap-8 ${result.image_url || result.heatmap_url ? 'xl:grid-cols-[1.1fr_0.9fr]' : 'xl:grid-cols-1'}`}>
        {(result.image_url || result.heatmap_url) && (
          <HeatmapViewer imageUrl={result.image_url} heatmapUrl={result.heatmap_url} />
        )}
        <ResultCard
          plant={result.plant}
          disease={result.disease}
          predictedLabel={result.predicted_label}
          status={result.status}
          confidence={result.confidence}
          severity={result.severity}
          treatment={result.treatment}
          createdAt={result.created_at}
        />
      </section>

      <section className="panel-luxe p-8 md:p-10">
        <div className="ambient-frame" />
        <div className="absolute inset-0 dot-bg opacity-12" />
        <div className="relative space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="luxury-kicker">
                <span className="eyebrow-dot" />
                Expert guidance
              </span>
              <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">
                {isUncertain ? 'Additional information' : 'What to do next'}
              </h2>
            </div>
            {loadingExpl && (
              <div className="chip-neon">
                <span className="status-dot status-online animate-glowPulse" />
                Generating
              </div>
            )}
          </div>

          <div className="mt-2">
            {result.source === 'gemini' ? (
              <div className="grid gap-5 md:grid-cols-2">
                <GuidanceTile title="Plant" body={result.plant || 'Unknown'} icon="scan" />
                <GuidanceTile title="Diagnosis" body={result.disease || 'Unknown disease'} icon="shield" />
                {result.severity && <GuidanceTile title="Severity" body={result.severity} icon="clock" />}
                {result.treatment && <GuidanceTile title="Treatment" body={result.treatment} icon="spark" />}
              </div>
            ) : isUncertain ? (
              <div className="grid gap-5 md:grid-cols-2">
                <GuidanceTile
                  title="Best current match"
                  body={result.predicted_label || 'No strong match'}
                  icon="scan"
                />
                <GuidanceTile
                  title="Recommended next step"
                  body="Capture another clear image in good light with one leaf filling most of the frame."
                  icon="spark"
                />
              </div>
            ) : loadingExpl ? (
              <Loader messages={[
                'Analyzing findings...',
                'Generating care steps...',
                'Preparing guidance...',
              ]} />
            ) : err ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/8 px-6 py-5 backdrop-blur-sm">
                <p className="text-sm text-red-200">Unable to generate explanation: {err}</p>
              </div>
            ) : sections.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {sections.map((section, index) => (
                  <div
                    key={section.heading}
                  className="card-lift surface-card rounded-2xl p-6 reveal-up hover:border-white/15"
                  style={{ animationDelay: `${0.08 * index}s` }}
                >
                    <div className="flex items-center gap-3 pb-4 border-b border-white/8">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-neon/30 bg-gradient-to-br from-neon/15 to-neon/5 text-neon shadow-lg">
                        <FeatureIcon name={SECTION_ICONS[section.heading] || 'spark'} className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{section.heading}</h3>
                    </div>
                    <p className="mt-5 text-sm leading-8 text-white/70 whitespace-pre-wrap">{section.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="surface-card rounded-2xl p-6">
                <p className="text-sm leading-8 text-white/70 whitespace-pre-wrap">{explanation}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function GuidanceTile({ title, body, icon }) {
  return (
    <div className="card-lift surface-card rounded-2xl p-6 hover:border-white/15 transition-all">
      <div className="flex items-center gap-3 pb-4 border-b border-white/8">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-neon/30 bg-gradient-to-br from-neon/15 to-neon/5 text-neon shadow-lg">
          <FeatureIcon name={icon} className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-5 text-sm leading-8 text-white/70">{body}</p>
    </div>
  )
}

function parseSections(text) {
  if (!text) return []
  const re = /\*\*(.+?)\*\*\s*:?\s*/g
  const matches = [...text.matchAll(re)]
  if (matches.length === 0) return []
  const sections = []
  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][1].trim()
    const start = matches[i].index + matches[i][0].length
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length
    const body = text.slice(start, end).trim()
    if (heading && body) sections.push({ heading, body })
  }
  return sections
}
