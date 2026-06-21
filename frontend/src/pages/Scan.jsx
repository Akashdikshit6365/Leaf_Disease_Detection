import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUpload from '../components/ImageUpload.jsx'
import CameraCapture from '../components/CameraCapture.jsx'
import Loader from '../components/Loader.jsx'
import FeatureIcon from '../components/FeatureIcon.jsx'
import { predictImage } from '../api/client.js'

const CAPTURE_TIPS = [
  { label: 'Single leaf focus', value: 'Best results when one leaf fills most of the frame.' },
  { label: 'Balanced lighting', value: 'Use bright, even light and avoid heavy shadows.' },
  { label: 'Clean background', value: 'Neutral surfaces help isolate the disease pattern.' },
]

function confidenceProfile(confidence, status) {
  if (status === 'uncertain' || confidence == null) {
    return {
      label: 'Review needed',
      tone: 'text-amber-100',
      border: 'border-amber-400/30',
      bg: 'bg-amber-400/8',
      guidance: 'Use this as a clue. Retake a clearer photo or verify with field inspection before treatment.',
    }
  }
  if (confidence >= 0.85) {
    return {
      label: 'Strong match',
      tone: 'text-neon',
      border: 'border-neon/35',
      bg: 'bg-neon/10',
      guidance: 'The visible pattern is strong. Still compare nearby leaves before applying treatment.',
    }
  }
  if (confidence >= 0.6) {
    return {
      label: 'Likely match',
      tone: 'text-accent-amber',
      border: 'border-accent-amber/30',
      bg: 'bg-accent-amber/8',
      guidance: 'The result is plausible. Verify symptoms on the plant before taking stronger action.',
    }
  }
  return {
    label: 'Low match',
    tone: 'text-accent-rose',
    border: 'border-accent-rose/30',
    bg: 'bg-accent-rose/8',
    guidance: 'Treat this as an early clue and retake the image if symptoms are not clear.',
  }
}

function parseExplanationSections(text) {
  if (!text) return {}
  const matches = [...text.matchAll(/(Cause|Impact|Treatment|Urgency):\s*([\s\S]*?)(?=(Cause|Impact|Treatment|Urgency):|$)/gi)]
  return Object.fromEntries(matches.map((match) => [match[1].toLowerCase(), match[2].trim()]))
}

function scrollToSection(node, offset = 24) {
  if (!node || typeof window === 'undefined') return
  const top = node.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

export default function Scan() {
  const navigate = useNavigate()
  const actionRef = useRef(null)
  const scanPanelRef = useRef(null)
  const resultsRef = useRef(null)
  
  const [mode, setMode] = useState('upload')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [scanProgress, setScanProgress] = useState(0)

  const normalizedConfidence = result?.confidence == null ? null : result.confidence > 1 ? result.confidence / 100 : result.confidence
  const confidenceInfo = confidenceProfile(normalizedConfidence, result?.status)
  const visibleSymptoms = Array.isArray(result?.visible_symptoms)
    ? result.visible_symptoms.filter(Boolean).slice(0, 4)
    : []
  const responseLevel =
    result?.status === 'uncertain'
      ? 1
      : normalizedConfidence >= 0.9
      ? 3
      : normalizedConfidence >= 0.75
      ? 2
      : 1
  const responseTone =
    result?.retake_recommended
      ? 'Image quality warning'
      : result?.status === 'uncertain'
      ? 'Needs review'
      : responseLevel >= 3
      ? 'High confidence'
      : responseLevel >= 2
      ? 'Moderate confidence'
      : 'Low confidence'
  const responseMessage =
    result?.retake_recommended
      ? 'Diagnosis is shown below. For best accuracy, recapture only if the photo looks blurry, dark, or poorly framed.'
      : result?.status === 'uncertain'
      ? 'The model could not find a strong match. Use this as a clue and compare it with nearby leaves.'
      : responseLevel >= 3
      ? 'This prediction is strong enough to act on, but field verification is still recommended.'
      : responseLevel >= 2
      ? 'Use this as a likely diagnosis and compare with nearby leaves before treatment.'
      : 'Treat this as an early clue rather than a final diagnosis and verify symptoms in the field.'
  const explanationSections = parseExplanationSections(result?.explanation)
  const actionPlan = result?.action_plan || {}
  const treatmentBody =
    actionPlan.treatment ||
    explanationSections.treatment ||
    result?.explanation ||
    'Consult an agricultural expert for a tailored recovery plan.'
  const treatmentSummary =
    treatmentBody.split('.').map((part) => part.trim()).find(Boolean) || treatmentBody
  const nextSteps = Array.isArray(actionPlan.next_steps) ? actionPlan.next_steps.filter(Boolean).slice(0, 3) : []
  const isReadyToScan = Boolean(file) && !busy

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  useEffect(() => {
    if (!file || busy || !actionRef.current) return
    const timeoutId = setTimeout(() => {
      scrollToSection(actionRef.current, 92)
    }, 220)
    return () => clearTimeout(timeoutId)
  }, [file, busy])

  // Auto-scroll to results when ready
  useEffect(() => {
    if (result && resultsRef.current) {
      const timeoutId = setTimeout(() => {
        scrollToSection(resultsRef.current, 72)
      }, 350)
      return () => clearTimeout(timeoutId)
    }
  }, [result])

  // Simulate progress during scanning
  useEffect(() => {
    if (!busy) return
    const interval = setInterval(() => {
      setScanProgress(prev => Math.min(prev + Math.random() * 25, 95))
    }, 400)
    return () => clearInterval(interval)
  }, [busy])

  const submit = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    setScanProgress(10)
    setTimeout(() => {
      scrollToSection(scanPanelRef.current || actionRef.current, 84)
    }, 80)
    
    try {
      const result = await predictImage(file)
      setScanProgress(100)

      setTimeout(() => {
        setResult({
          ...result,
          created_at: new Date().toISOString(),
        })
        setBusy(false)
      }, 800)
    } catch (err) {
      setError(err.message || 'Prediction failed')
      setBusy(false)
      setScanProgress(0)
    }
  }

  return (
    <div className="space-y-6 md:space-y-10">
      {/* TOP SECTION - HERO & UPLOAD */}
      <section className="enterprise-shell mobile-depth-card reveal-up px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-9">
        <div className="kinetic-band" />
        <div className="ambient-frame" />
        <div className="enterprise-grid absolute inset-0 opacity-45" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent" />

        <div className="relative space-y-6 md:space-y-8">
          {/* Title & Description */}
          <div className="space-y-5">
            <div>
              <span className="luxury-kicker">
                <span className="eyebrow-dot" />
                Leaf Analysis
              </span>
              <h1 className="headline-luxe mt-5 max-w-3xl text-[40px] font-semibold heading-gradient sm:text-6xl md:text-7xl">
                Capture, diagnose, act.
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/64 md:text-lg md:leading-8">
                Use one clear leaf image. The app checks image quality, returns a focused diagnosis, and keeps the next action visible.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 sm:flex sm:flex-wrap sm:gap-2.5">
              {[
                { icon: 'zap', label: 'Fast' },
                { icon: 'eye', label: 'Visual evidence' },
                { icon: 'brain', label: 'Guided' },
              ].map((item) => (
                <div key={item.label} className="chip justify-center bg-white/[0.05] px-3 py-2.5 text-white/75 transition-all sm:justify-start sm:px-4">
                  <FeatureIcon name={item.icon} className="h-4 w-4 text-neon" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start xl:grid-cols-[1.18fr_0.82fr]">
            <div className="panel-luxe mobile-depth-card p-3 sm:p-5 md:p-6">
              <div className="kinetic-band" />
              <div className="ambient-frame" />
              <div className="enterprise-grid absolute inset-0 opacity-25" />
              <div className="relative space-y-4 md:space-y-5">
                <div className="flex flex-col gap-4 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">Input</p>
                    <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">Choose capture mode</h2>
                  </div>
                  
                  <div className="inline-flex w-full items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur sm:w-auto">
                    {[
                      { k: 'upload', label: 'Upload', icon: 'upload' },
                      { k: 'camera', label: 'Camera', icon: 'camera' },
                    ].map(({ k, label, icon }) => (
                      <button
                        key={k}
                        onClick={() => { setMode(k); setFile(null); setError(null) }}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                          mode === k 
                            ? 'bg-neon text-ink-900 shadow-lg shadow-neon/40' 
                            : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                        } flex-1 justify-center sm:flex-none`}
                      >
                        <FeatureIcon name={icon} className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={scanPanelRef} className="mt-4">
                  {busy ? (
                    <div className="glass-strong overflow-hidden rounded-[20px]">
                      <div className="scan-shell relative mx-auto flex min-h-[340px] max-w-3xl items-center justify-center overflow-hidden rounded-[18px] bg-black/60 p-2 sm:min-h-[380px] sm:p-4 md:min-h-[420px]">
                        <div className="absolute inset-0 opacity-25" style={{
                          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                          backgroundSize: '26px 26px'
                        }} />
                        {previewUrl ? (
                          <>
                            <div className="relative w-full overflow-hidden rounded-[18px] border border-white/10 bg-black/40 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.95)]">
                              <img
                                src={previewUrl}
                                alt="Leaf being scanned"
                                className="h-full max-h-[340px] w-full rounded-[18px] object-contain sm:max-h-[380px] md:max-h-[420px]"
                              />
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,136,0.14),transparent_58%)]" />
                              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
                              <div className="absolute inset-[10px] rounded-[18px] border border-white/10 sm:inset-4 sm:rounded-[20px]" />
                              <div className="scan-vignette absolute inset-0" />
                            </div>

                            <div className="absolute inset-x-5 top-5 flex items-center justify-between rounded-full border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-md sm:inset-x-7 sm:top-6 sm:px-4 md:inset-x-9 md:top-8">
                              <div className="flex items-center gap-2">
                                <span className="status-dot status-online" />
                                <span className="text-xs font-mono uppercase tracking-[0.22em] text-white/72">Live scan</span>
                              </div>
                              <span className="text-sm font-semibold text-neon">{Math.round(scanProgress)}%</span>
                            </div>

                            <div className="pointer-events-none absolute inset-x-5 top-12 bottom-24 overflow-hidden rounded-[20px] sm:inset-x-7 sm:top-14 sm:bottom-28 md:inset-x-9 md:top-16 md:bottom-32">
                              <div className="scan-beam absolute inset-x-0 top-0 h-24 rounded-[20px]" />
                              <div className="scan-rings absolute inset-0" />
                              <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/20 sm:h-36 sm:w-36" />
                              <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8 sm:h-56 sm:w-56" />
                              <div className="absolute inset-[10px] rounded-[16px] border border-neon/15 sm:inset-4 sm:rounded-[18px]" />
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 rounded-[16px] border border-white/10 bg-black/72 p-3 backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 md:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-white">Processing selected leaf</p>
                                  <p className="mt-1 text-xs leading-6 text-white/58 sm:text-sm">
                                    Checking visible spots, texture, discoloration, and framing quality.
                                  </p>
                                </div>
                                <div className="hidden sm:block">
                                  <div className="flex justify-center gap-2">
                                    {[0, 1, 2].map(i => (
                                      <div
                                        key={i}
                                        className="h-2.5 w-2.5 rounded-full bg-neon shadow-lg shadow-neon/60"
                                        style={{
                                          animation: `bounce 1.4s infinite`,
                                          animationDelay: `${i * 0.2}s`
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full bg-gradient-to-r from-neon via-accent-amber to-accent-rose shadow-lg shadow-neon/40 transition-all duration-300"
                                  style={{ width: `${scanProgress}%` }}
                                />
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-neon sm:text-xs">
                                  {scanProgress < 30 && 'Preparing image analysis'}
                                  {scanProgress >= 30 && scanProgress < 60 && 'Detecting disease pattern'}
                                  {scanProgress >= 60 && scanProgress < 85 && 'Reviewing affected regions'}
                                  {scanProgress >= 85 && 'Finalizing diagnosis'}
                                </p>
                                <div className="hidden md:flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-white/40">
                                  <span className="h-2 w-2 rounded-full bg-neon/80" />
                                  Scan in progress
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Loader messages={[
                            'Preparing image analysis...',
                            'Extracting leaf features...',
                            'Running disease detection...',
                            'Reviewing scan evidence...',
                            'Finalizing diagnosis...',
                          ]} />
                        )}
                      </div>

                      <style>{`
                        @keyframes bounce {
                          0%, 80%, 100% { transform: translateY(0); }
                          40% { transform: translateY(-10px); }
                        }
                        @keyframes scanBeam {
                          0% { transform: translateY(-16%); opacity: 0; }
                          8% { opacity: 1; }
                          50% { opacity: 1; }
                          100% { transform: translateY(340px); opacity: 0; }
                        }
                        @keyframes pulseOrbit {
                          0% { transform: scale(0.92); opacity: 0.15; }
                          50% { transform: scale(1.02); opacity: 0.42; }
                          100% { transform: scale(0.92); opacity: 0.15; }
                        }
                        @keyframes shimmerX {
                          0% { transform: translateX(-120%); opacity: 0; }
                          35% { opacity: 1; }
                          100% { transform: translateX(120%); opacity: 0; }
                        }
                        .scan-shell::after {
                          content: '';
                          position: absolute;
                          inset: 0;
                          background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%);
                          animation: shimmerX 3.8s ease-in-out infinite;
                          pointer-events: none;
                        }
                        .scan-beam {
                          background:
                            linear-gradient(
                              180deg,
                              rgba(57,255,136,0) 0%,
                              rgba(57,255,136,0.12) 22%,
                              rgba(92,240,255,0.28) 42%,
                              rgba(57,255,136,0.82) 50%,
                              rgba(92,240,255,0.28) 58%,
                              rgba(57,255,136,0.12) 78%,
                              rgba(57,255,136,0) 100%
                            );
                          box-shadow:
                            0 0 26px rgba(57,255,136,0.35),
                            0 0 58px rgba(92,240,255,0.18);
                          animation: scanBeam 2.4s cubic-bezier(0.2, 0.7, 0.22, 1) infinite;
                        }
                        .scan-rings {
                          background:
                            radial-gradient(circle at center, rgba(57,255,136,0.22), transparent 30%),
                            radial-gradient(circle at center, rgba(56,189,248,0.12), transparent 54%);
                          animation: pulseOrbit 2.8s ease-in-out infinite;
                        }
                        .scan-vignette {
                          background:
                            linear-gradient(180deg, rgba(255,255,255,0.04), transparent 22%),
                            radial-gradient(circle at center, transparent 44%, rgba(0,0,0,0.42) 100%);
                        }
                      `}</style>
                    </div>
                  ) : mode === 'upload' ? (
                    <ImageUpload onFile={setFile} disabled={busy} />
                  ) : (
                    <CameraCapture onCapture={setFile} disabled={busy} />
                  )}
                </div>

                <div ref={actionRef} className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">Next step</p>
                      <p className="text-base font-semibold text-white sm:text-lg">
                        {isReadyToScan ? 'Image ready for diagnosis' : 'Upload or capture one clear leaf image'}
                      </p>
                      <p className="text-sm leading-6 text-white/55">
                        {isReadyToScan
                          ? 'Review the preview, then start the scan from here.'
                          : 'The preview updates here first so the user always knows what will be analyzed.'}
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[240px]">
                      <button
                        className="btn-primary w-full text-sm font-semibold"
                        onClick={submit}
                        disabled={!isReadyToScan}
                      >
                        <FeatureIcon name="zap" className="h-4 w-4" />
                        Scan & Analyze
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </button>
                      {file && !busy && (
                        <button className="btn-ghost text-sm font-medium w-full" onClick={() => setFile(null)}>
                          Clear image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="float-stack space-y-5">
              <div className="panel-luxe mobile-depth-card flex flex-col p-4 sm:p-5 md:min-h-[420px] md:p-6">
                <div className="ambient-frame" />
                <div className="enterprise-grid absolute inset-0 opacity-20" />
                <div className="relative flex flex-col">
                  <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/8">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">Preview</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">Image check</h3>
                    </div>
                    {file && (
                      <div className="chip-neon !text-[11px] font-medium">
                        <span className="status-dot status-online" />
                        Ready
                      </div>
                    )}
                  </div>

                  <div className="relative mt-5 flex-1 min-h-[240px] overflow-hidden rounded-[18px] border border-white/10 bg-gradient-to-b from-black/60 to-black/80 sm:min-h-[280px] md:mt-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,136,0.06),transparent_55%)]" />
                    <div className="absolute inset-0 spot-grid opacity-20" />
                    
                    {previewUrl ? (
                      <div className="relative flex h-full items-center justify-center p-5">
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="max-h-[100%] max-w-[100%] rounded-[14px] border border-white/10 object-contain shadow-lg"
                        />
                        <div className="absolute inset-5 rounded-[20px] border border-white/10 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-neon/30 bg-gradient-to-br from-neon/15 to-neon/5 text-neon shadow-lg shadow-neon/20">
                          <FeatureIcon name="image" className="h-10 w-10" />
                        </div>
                        <p className="text-base font-semibold text-white">Image preview</p>
                        <p className="mt-2 text-sm leading-6 text-white/50">
                          Upload or capture to see preview
                        </p>
                      </div>
                    )}
                  </div>

                  {file && (
                    <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-center justify-between gap-3 text-xs font-mono">
                        <span className="text-white/60 truncate">{file.name}</span>
                        <span className="text-neon font-semibold">{(file.size / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Card */}
              <div className="panel-luxe mobile-depth-card p-4 sm:p-5 md:p-6">
                <div className="ambient-frame" />
                <div className="relative space-y-5">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.26em] text-white/40">Best practices</p>
                    <h3 className="mt-3 text-lg font-semibold text-white">Capture tips</h3>
                  </div>

                  <div className="space-y-3">
                    {CAPTURE_TIPS.map((tip, index) => (
                      <div key={tip.label} className="group card-lift rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 hover:border-neon/30 hover:bg-white/[0.06] transition-all">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-neon/30 bg-neon/10 text-sm font-bold text-neon group-hover:border-neon/50 group-hover:bg-neon/15 transition-all">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white text-sm">{tip.label}</p>
                            <p className="mt-1 text-xs leading-6 text-white/55">{tip.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/8 px-5 py-4 backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
                        <div className="text-sm text-red-200">{error}</div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      {result && !busy && (
        <section ref={resultsRef} className="px-1 sm:px-2 md:px-4">
          <div className="enterprise-shell mobile-depth-card overflow-hidden p-4 sm:p-6 md:p-8">
            <div className="kinetic-band" />
            <div className="ambient-frame" />
            <div className="enterprise-grid absolute inset-0 opacity-20" />
            <div className="relative space-y-7">
              <div className="flex flex-col gap-5 border-b border-white/8 pb-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="luxury-kicker">
                    <span className="eyebrow-dot" />
                    Analysis complete
                  </span>
                  <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Diagnosis report</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                    Review the finding, confidence level, and recommended next step before taking treatment action.
                  </p>
                </div>
                <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  result.status === 'uncertain' || result.retake_recommended
                    ? 'border-amber-400/30 bg-amber-400/8 text-amber-100'
                    : /healthy/i.test(result.disease || '')
                    ? 'border-neon/35 bg-neon/10 text-neon'
                    : 'border-white/10 bg-white/[0.04] text-white/78'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    result.status === 'uncertain' || result.retake_recommended ? 'bg-amber-300' : /healthy/i.test(result.disease || '') ? 'bg-neon' : 'bg-white/60'
                  }`} />
                  {result.retake_recommended ? 'Quality warning' : result.status === 'uncertain' ? 'Needs review' : /healthy/i.test(result.disease || '') ? 'Healthy pattern' : 'Issue detected'}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="surface-card mobile-depth-card rounded-[16px] p-5 md:p-6">
                  <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">Primary finding</p>
                  <h3 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl">
                    {result.disease || 'Unknown diagnosis'}
                  </h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <ReportMetric label="Plant" value={result.plant || 'Unknown'} />
                    <ReportMetric label="Confidence" value={normalizedConfidence == null ? '--' : `${Math.round(normalizedConfidence * 100)}%`} />
                    <ReportMetric label="Priority" value={result.retake_recommended ? 'Retake optional' : result.status === 'uncertain' ? 'Review' : responseLevel >= 3 ? 'Act today' : responseLevel >= 2 ? 'Act soon' : 'Monitor'} />
                  </div>
                  <p className="mt-5 text-sm leading-7 text-white/58">{responseMessage}</p>
                </div>

                <div className="surface-card mobile-depth-card rounded-[16px] p-5 md:p-6">
                  <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">Recommended action</p>
                  <h3 className="mt-4 text-xl font-semibold leading-8 text-white">{treatmentSummary}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/60">{treatmentBody}</p>
                  {nextSteps.length > 0 && (
                    <div className="mt-5 space-y-2">
                      {nextSteps.map((step, index) => (
                        <div key={`${step}-${index}`} className="flex gap-3 rounded-lg border border-white/8 bg-black/18 px-3 py-2.5">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-neon/10 text-xs font-semibold text-neon">{index + 1}</span>
                          <p className="text-sm leading-6 text-white/64">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 rounded-lg border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/58">
                    {actionPlan.urgency || responseTone}. {actionPlan.prevention || 'Verify symptoms on nearby leaves and re-scan after visible changes.'}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className={`mobile-depth-card rounded-[16px] border ${confidenceInfo.border} ${confidenceInfo.bg} p-5 md:p-6`}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/42">Result strength</p>
                  <h3 className={`mt-4 text-2xl font-semibold ${confidenceInfo.tone}`}>{confidenceInfo.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">{confidenceInfo.guidance}</p>
                </div>

                <div className="surface-card mobile-depth-card rounded-[16px] p-5 md:p-6">
                  <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/42">Visible symptoms</p>
                  {visibleSymptoms.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {visibleSymptoms.map((symptom) => (
                        <span key={symptom} className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/72">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-white/58">No clear symptom list was extracted from this scan.</p>
                  )}
                </div>
              </div>

              {(result.image_url || result.heatmap_url) && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <EvidenceImage label="Original leaf" url={result.image_url} />
                  <EvidenceImage label="Attention map" url={result.heatmap_url} />
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <button 
                  onClick={() => setResult(null)}
                  className="btn-primary text-sm font-semibold"
                >
                  <FeatureIcon name="scan" className="h-4 w-4" />
                  Scan Another Leaf
                </button>
                <button 
                  onClick={() => navigate('/chat', { state: { disease: result.disease, diagnosisContext: result } })}
                  className="btn-ghost text-sm font-semibold"
                >
                  <FeatureIcon name="chat" className="h-4 w-4" />
                  Ask Assistant
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function ReportMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[9px] font-mono uppercase tracking-[0.24em] text-white/36">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function EvidenceImage({ label, url }) {
  if (!url) return null
  return (
    <div className="surface-card-dark overflow-hidden rounded-[16px]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/42">{label}</p>
      </div>
      <div className="flex aspect-square items-center justify-center bg-black/35 p-4">
        <img src={url} alt={label} className="max-h-full max-w-full rounded-lg object-contain" />
      </div>
    </div>
  )
}
