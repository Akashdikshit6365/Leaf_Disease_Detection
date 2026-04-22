import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUpload from '../components/ImageUpload.jsx'
import CameraCapture from '../components/CameraCapture.jsx'
import Loader from '../components/Loader.jsx'
import FeatureIcon from '../components/FeatureIcon.jsx'
import { diagnoseImage } from '../api/client.js'

const CAPTURE_TIPS = [
  { label: 'Single leaf focus', value: 'Best results when one leaf fills most of the frame.' },
  { label: 'Balanced lighting', value: 'Use bright, even light and avoid heavy shadows.' },
  { label: 'Clean background', value: 'Neutral surfaces help isolate the disease pattern.' },
]

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

  const severityLevel = result?.severity || 1
  const severityTone =
    severityLevel >= 3
      ? 'High severity'
      : severityLevel >= 2
      ? 'Moderate severity'
      : 'Low severity'
  const severityMessage =
    severityLevel >= 3
      ? 'Immediate treatment is recommended to contain spread.'
      : severityLevel >= 2
      ? 'Start treatment soon and monitor the next few days closely.'
      : 'Symptoms look manageable with preventive care and observation.'
  const treatmentSummary = result?.treatment
    ? result.treatment.split('.').map((part) => part.trim()).find(Boolean) || result.treatment
    : 'Consult an agricultural expert for a tailored recovery plan.'
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
      const result = await diagnoseImage(file)
      setScanProgress(100)
      
      if (result?.source === 'none') {
        setError(result.error || 'Not a plant leaf')
        setBusy(false)
        setScanProgress(0)
        return
      }

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
    <div className="space-y-8 md:space-y-12">
      {/* TOP SECTION - HERO & UPLOAD */}
      <section className="panel-hero surface-mist reveal-up px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-12">
        <div className="ambient-frame" />
        <div className="noise opacity-12" />
        <div className="orb orb-neon -top-24 -right-16 h-56 w-56 opacity-30" />
        <div className="orb orb-sky -bottom-16 left-20 h-48 w-48 opacity-25" />

        <div className="relative space-y-8 md:space-y-10">
          {/* Title & Description */}
          <div className="space-y-6">
            <div>
              <span className="luxury-kicker">
                <span className="eyebrow-dot" />
                AI-Powered Analysis
              </span>
              <h1 className="headline-luxe mt-6 text-5xl font-semibold heading-gradient sm:text-6xl md:mt-8 md:text-7xl lg:text-8xl">
                Scan a leaf.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/66 md:mt-6 md:text-lg md:leading-9 lg:text-xl">
                Upload or capture with your camera. Our AI will analyze every pixel to deliver precision diagnostics with visual evidence.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1 md:gap-3 md:pt-2">
              {[
                { icon: 'zap', label: 'Instant analysis' },
                { icon: 'eye', label: 'Visual evidence' },
                { icon: 'brain', label: 'AI-powered' },
              ].map((item) => (
                <div key={item.label} className="chip bg-white/[0.05] px-4 py-2.5 text-white/75 hover:bg-white/[0.08] transition-all">
                  <FeatureIcon name={item.icon} className="h-4 w-4 text-neon" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start xl:grid-cols-[1.22fr_0.78fr]">
            <div className="panel-luxe p-4 sm:p-5 md:p-7">
              <div className="ambient-frame" />
              <div className="absolute inset-0 spot-grid opacity-15" />
              <div className="relative space-y-5 md:space-y-6">
                <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.26em] text-white/40">Capture method</p>
                    <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Choose your mode</h2>
                  </div>
                  
                  <div className="inline-flex w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur sm:w-auto">
                    {[
                      { k: 'upload', label: 'Upload', icon: 'upload' },
                      { k: 'camera', label: 'Camera', icon: 'camera' },
                    ].map(({ k, label, icon }) => (
                      <button
                        key={k}
                        onClick={() => { setMode(k); setFile(null); setError(null) }}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
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
                    <div className="glass-strong overflow-hidden rounded-[28px]">
                      <div className="scan-shell relative mx-auto flex min-h-[320px] max-w-3xl items-center justify-center overflow-hidden rounded-[24px] bg-black/55 p-3 sm:min-h-[360px] sm:p-4 md:min-h-[400px] md:p-5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_bottom,rgba(57,255,136,0.16),transparent_46%)]" />
                        <div className="absolute inset-0 opacity-25" style={{
                          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                          backgroundSize: '26px 26px'
                        }} />
                        {previewUrl ? (
                          <>
                            <div className="relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-black/40 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.95)]">
                              <img
                                src={previewUrl}
                                alt="Leaf being scanned"
                                className="h-full max-h-[320px] w-full rounded-[24px] object-contain sm:max-h-[360px] md:max-h-[400px]"
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

                            <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-white/10 bg-black/65 p-4 backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 md:bottom-7 md:left-7 md:right-7 md:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-white">Analyzing the selected leaf</p>
                                  <p className="mt-1 text-xs leading-6 text-white/58 sm:text-sm">
                                    Spot pattern, edge texture, and discoloration are being reviewed directly on this image.
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
                                  Premium scan mode
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Loader messages={[
                            'Initializing AI analysis...',
                            'Extracting leaf features...',
                            'Running disease detection...',
                            'Generating heatmap...',
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

                <div ref={actionRef} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-mono uppercase tracking-[0.26em] text-white/40">Next step</p>
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
                        className="btn-primary text-sm font-semibold w-full"
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
            <div className="space-y-5">
              <div className="panel-luxe flex flex-col p-4 sm:p-5 md:min-h-[420px] md:p-7">
                <div className="ambient-frame" />
                <div className="absolute inset-0 dot-bg opacity-15" />
                <div className="relative flex flex-col">
                  <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/8">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-[0.26em] text-white/40">Preview</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">Image check</h3>
                    </div>
                    {file && (
                      <div className="chip-neon !text-[11px] font-medium">
                        <span className="status-dot status-online" />
                        Ready
                      </div>
                    )}
                  </div>

                  <div className="relative mt-5 flex-1 min-h-[220px] overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-black/60 to-black/80 sm:min-h-[260px] md:mt-6 md:min-h-[280px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,136,0.06),transparent_55%)]" />
                    <div className="absolute inset-0 spot-grid opacity-20" />
                    
                    {previewUrl ? (
                      <div className="relative flex h-full items-center justify-center p-5">
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="max-h-[100%] max-w-[100%] rounded-[20px] border border-white/10 object-contain shadow-lg"
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
              <div className="panel-luxe p-4 sm:p-5 md:p-7">
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

      {/* RESULTS SECTION - 3 Different Cards */}
      {result && !busy && (
        <section ref={resultsRef} className="px-1 sm:px-2 md:px-4">
          <div className="space-y-8">
            {/* Results header */}
            <div className="text-center space-y-4">
              <div className="inline-block px-4 py-2 rounded-full bg-neon/10 border border-neon/30">
                <p className="text-sm font-semibold text-neon">Analysis Complete</p>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Your Diagnosis</h2>
              <p className="text-white/60 text-lg">Detailed insights from our AI analysis</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr] xl:items-start">
              <div className="panel-luxe relative overflow-hidden p-8 group hover:border-neon/50 transition-all">
                <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-neon/10 blur-3xl" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-neon/6 via-transparent to-transparent" />

                <div className="relative z-10 flex h-full flex-col gap-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-neon/40 bg-neon/15 p-3">
                        <FeatureIcon name="shield" className="h-6 w-6 text-neon" />
                      </div>
                      <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-white/60">Primary finding</p>
                        <p className="mt-1 text-sm text-white/45">Diagnosis from the uploaded leaf image</p>
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/72">
                      Scan complete
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-sm text-white/60">Identified disease</p>
                      <h3 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-white md:text-4xl">
                        {result.disease || 'Unknown'}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                        This is the condition detected from the visible leaf symptoms in the current scan.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="surface-card rounded-[24px] p-4">
                        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">Detected issue</p>
                        <p className="mt-3 text-lg font-semibold text-white">{result.disease || 'Unknown'}</p>
                      </div>
                      <div className="surface-card rounded-[24px] p-4">
                        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">Leaf status</p>
                        <p className="mt-3 text-lg font-semibold text-white">
                          {severityLevel >= 3 ? 'Needs urgent care' : severityLevel >= 2 ? 'Needs attention' : 'Early signs visible'}
                        </p>
                      </div>
                      <div className="surface-card rounded-[24px] p-4">
                        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">Recommended pace</p>
                        <p className="mt-3 text-lg font-semibold text-white">
                          {severityLevel >= 3 ? 'Act today' : severityLevel >= 2 ? 'Act soon' : 'Monitor closely'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="surface-card-dark space-y-3 rounded-[28px] p-5">
                    <p className="text-sm font-semibold text-white">What this means</p>
                    <p className="text-sm leading-7 text-white/60">
                      The visible pattern is consistent with <span className="font-semibold text-white">{result.disease || 'the detected issue'}</span>. Review the plant-specific impact and treatment guidance below before the symptoms spread further.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
                <div className="panel-luxe relative overflow-hidden p-7 group hover:border-accent-amber/50 transition-all">
                  <div className="absolute -right-12 -top-10 h-32 w-32 rounded-full bg-accent-amber/10 blur-3xl" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent-amber/6 via-transparent to-transparent" />

                  <div className="relative z-10 flex h-full flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-accent-amber/40 bg-accent-amber/15 p-3">
                        <FeatureIcon name="scan" className="h-5 w-5 text-accent-amber" />
                      </div>
                      <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-white/60">Plant insight</p>
                        <p className="mt-1 text-sm text-white/45">Host impact and urgency</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-white/60">Host plant</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">{result.plant || 'Unknown'}</h3>
                        <p className="mt-3 text-sm leading-7 text-white/58">
                          This section focuses on how strongly the issue appears on this plant and how quickly you should respond in the field.
                        </p>
                      </div>

                      <div className="surface-card rounded-[24px] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">Severity level</p>
                          <p className="text-sm font-bold text-accent-amber">{severityLevel}/3</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-full transition-all ${
                                i <= severityLevel ? 'bg-gradient-to-r from-accent-amber to-accent-rose' : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-4 text-sm leading-7 text-white/58">{severityMessage}</p>
                      </div>

                      <div className="surface-card-dark rounded-[24px] p-5">
                        <p className="text-sm font-semibold text-white">Field note</p>
                        <p className="mt-3 text-sm leading-7 text-white/58">
                          Check nearby leaves on the same plant for similar spotting, discoloration, or edge damage to understand whether this looks isolated or spreading.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel-luxe relative overflow-hidden p-7 group hover:border-accent-rose/50 transition-all">
                  <div className="absolute -right-16 bottom-0 h-36 w-36 rounded-full bg-accent-rose/10 blur-3xl" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent-rose/6 via-transparent to-transparent" />

                  <div className="relative z-10 flex h-full flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-accent-rose/40 bg-accent-rose/15 p-3">
                        <FeatureIcon name="spark" className="h-5 w-5 text-accent-rose" />
                      </div>
                      <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-white/60">Action plan</p>
                        <p className="mt-1 text-sm text-white/45">Compact treatment summary</p>
                      </div>
                    </div>

                    <div className="surface-card rounded-[24px] p-5">
                      <p className="text-sm text-white/60">Recommended treatment</p>
                      <h3 className="mt-3 text-xl font-bold leading-8 text-white">{treatmentSummary}</h3>
                      <p className="mt-4 text-sm leading-7 text-white/62">
                        {result.treatment || 'Contact an agricultural expert for a personalized treatment plan.'}
                      </p>
                    </div>

                    <div className="surface-card-dark flex items-center gap-3 rounded-[20px] px-4 py-4">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent-rose/15 text-accent-rose">
                        <FeatureIcon name="zap" className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{severityTone} response</p>
                        <p className="text-sm text-white/55">Follow the treatment plan and re-scan after changes in symptoms.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <button 
                onClick={() => setResult(null)}
                className="btn-primary text-base font-semibold"
              >
                <FeatureIcon name="scan" className="h-5 w-5" />
                Scan Another Leaf
              </button>
              <button 
                onClick={() => navigate('/chat', { state: { disease: result.disease } })}
                className="btn-ghost text-base font-semibold"
              >
                <FeatureIcon name="chat" className="h-5 w-5" />
                Ask Assistant
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
