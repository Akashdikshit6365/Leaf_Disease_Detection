import { useCallback, useEffect, useRef, useState } from 'react'
import FeatureIcon from './FeatureIcon.jsx'

export default function CameraCapture({ onCapture, disabled = false }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setActive(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)
    } catch (err) {
      setError(err?.message || 'Unable to access camera.')
    }
  }, [])

  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' })
      onCapture?.(file)
      stop()
    }, 'image/png', 0.95)
  }, [onCapture, stop])

  useEffect(() => () => stop(), [stop])

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-[28px] border border-white/10 bg-black/70">
        <div className="absolute inset-0 ambient-frame" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom,rgba(57,255,136,0.18),transparent_40%)]" />
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-neon/30 bg-neon/10 text-neon shadow-neon animate-glowPulse">
              <FeatureIcon name="camera" className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Camera is off</p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Start the camera to capture a leaf image with on-screen framing guides.
              </p>
            </div>
          </div>
        )}

        {active && (
          <>
            <div className="absolute inset-0 pointer-events-none">
              <ReticleCorner className="left-4 top-4" />
              <ReticleCorner className="right-4 top-4" flipX />
              <ReticleCorner className="bottom-4 left-4" flipY />
              <ReticleCorner className="bottom-4 right-4" flipX flipY />
            </div>
            <div className="absolute inset-0 scanline" />
            <div className="absolute inset-5 rounded-[22px] border border-white/10" />
            <div className="absolute left-1/2 top-4 -translate-x-1/2 chip-neon !px-3 !py-1 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-neon animate-glowPulse" />
              LIVE CAPTURE
            </div>
          </>
        )}
      </div>

      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Camera mode</p>
            <p className="mt-2 text-sm text-white/65">
              Use the rear camera and keep the leaf centered for the cleanest result.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!active ? (
              <button className="btn-primary" onClick={start} disabled={disabled}>
                <FeatureIcon name="camera" className="h-4 w-4" />
                Start camera
              </button>
            ) : (
              <>
                <button className="btn-primary" onClick={capture} disabled={disabled}>
                  Capture frame
                </button>
                <button className="btn-ghost" onClick={stop}>
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> {error}
        </p>
      )}
    </div>
  )
}

function ReticleCorner({ className = '', flipX = false, flipY = false }) {
  const transform = `${flipX ? 'scaleX(-1)' : ''} ${flipY ? 'scaleY(-1)' : ''}`
  return (
    <svg className={`absolute h-7 w-7 text-neon ${className}`} viewBox="0 0 24 24" style={{ transform }}>
      <path d="M3 8V4h5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}
