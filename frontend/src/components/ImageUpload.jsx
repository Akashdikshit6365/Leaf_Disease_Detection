import { useCallback, useRef, useState } from 'react'
import FeatureIcon from './FeatureIcon.jsx'
import { imageAssets } from '../assets/imageAssets.js'

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
          'group relative flex min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-[18px] border border-dashed p-6 text-center transition-all duration-500 sm:min-h-[480px] sm:p-10',
          isDragging 
            ? 'border-neon bg-neon/[0.12] shadow-lg shadow-neon/40 -translate-y-1' 
            : 'border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.02]',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-neon/60 hover:bg-neon/[0.06] hover:-translate-y-0.5',
        ].join(' ')}
      >
        <img
          src={imageAssets.diseasedLeaf}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-28 saturate-125 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-36"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/72 via-black/64 to-black/78" />
        <div className="absolute inset-0 ambient-frame" />
        <div className="absolute inset-0 enterprise-grid opacity-20 transition-opacity group-hover:opacity-35 pointer-events-none" />
        
        <div className="absolute left-4 top-4 rounded-md border border-white/15 bg-black/45 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-white/58 backdrop-blur-sm sm:left-6 sm:top-6">
          Upload image
        </div>

        <div className="relative z-10 space-y-5">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[18px] border border-neon/30 bg-black/45 text-neon shadow-lg shadow-neon/20 backdrop-blur-md transition-transform group-hover:scale-105 sm:h-24 sm:w-24">
            <FeatureIcon name="upload" className="h-9 w-9" />
          </div>

          <div className="space-y-3">
            <p className="text-2xl font-bold text-white sm:text-3xl">
              Add a clear leaf photo
            </p>
            <p className="mx-auto max-w-sm text-sm leading-7 text-white/66 sm:text-base">
              Drag a clear leaf photo from your device, or click to browse your files.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:gap-3">
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
