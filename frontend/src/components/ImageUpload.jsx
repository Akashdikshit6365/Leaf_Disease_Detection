import { useCallback, useRef, useState } from 'react'
import FeatureIcon from './FeatureIcon.jsx'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/bmp'
const MAX_MB = 10

export default function ImageUpload({ onFile, disabled = false }) {
  const inputRef = useRef(null)
  const [isDragging, setDragging] = useState(false)
  const [error, setError] = useState(null)

  const validate = useCallback((file) => {
    if (!file) return false
    if (!file.type.startsWith('image/')) { setError('Only image files are supported.'); return false }
    if (file.size > MAX_MB * 1024 * 1024) { setError(`Max file size is ${MAX_MB} MB.`); return false }
    setError(null)
    return true
  }, [])

  const handleFile = (file) => {
    if (validate(file)) onFile?.(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={[
          'group relative flex min-h-[480px] w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed p-12 text-center transition-all duration-500',
          isDragging 
            ? 'border-neon bg-neon/[0.12] shadow-lg shadow-neon/40 -translate-y-1' 
            : 'border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.02]',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-neon/60 hover:bg-neon/[0.06] hover:-translate-y-0.5',
        ].join(' ')}
      >
        <div className="absolute inset-0 ambient-frame" />
        <div className="absolute inset-0 dot-bg opacity-25 transition-opacity group-hover:opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.10),transparent_40%),radial-gradient(circle_at_bottom,rgba(57,255,136,0.12),transparent_45%)] pointer-events-none" />
        <div className="absolute -top-24 -right-20 h-80 w-80 orb orb-neon opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none" />
        
        <div className="absolute left-8 top-8 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-[10px] font-mono uppercase tracking-[0.28em] text-white/50 backdrop-blur-sm">
          Upload image
        </div>

        <div className="relative z-10 space-y-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-neon/30 bg-gradient-to-br from-neon/20 to-neon/5 text-neon shadow-lg shadow-neon/30 group-hover:scale-110 group-hover:shadow-neon/50 transition-transform">
            <FeatureIcon name="upload" className="h-10 w-10" />
          </div>

          <div className="space-y-3">
            <p className="text-2xl font-bold text-white">
              Drop your image here
            </p>
            <p className="mx-auto max-w-sm text-base leading-7 text-white/62">
              Drag a clear leaf photo from your device, or click to browse your files.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <span className="chip bg-white/[0.05] !px-4 !py-2 text-white/65">
              <FeatureIcon name="image" className="h-3.5 w-3.5 text-neon" />
              JPG, PNG, WEBP
            </span>
            <span className="chip bg-white/[0.05] !px-4 !py-2 text-white/65">
              <FeatureIcon name="zap" className="h-3.5 w-3.5 text-neon" />
              Up to {MAX_MB} MB
            </span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </button>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/8 px-5 py-4 backdrop-blur-sm flex items-start gap-3">
          <span className="mt-1 h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}
    </div>
  )
}
