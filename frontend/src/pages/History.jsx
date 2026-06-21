import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteHistoryItem, fetchHistory } from '../api/client.js'
import Loader from '../components/Loader.jsx'
import FeatureIcon from '../components/FeatureIcon.jsx'
import { imageAssets } from '../assets/imageAssets.js'

export default function History() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await fetchHistory({ limit: 60 })
        if (alive) setRows(data)
      } catch (e) {
        if (alive) setError(e.message)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter(r => r.disease.toLowerCase().includes(q))
  }, [rows, query])

  const stats = useMemo(() => {
    const total = rows.length
    const healthy = rows.filter(r => /healthy/i.test(r.disease)).length
    const avg = total ? rows.reduce((a, r) => a + (r.confidence || 0), 0) / total : 0
    return { total, healthy, diseased: total - healthy, avg: Math.round(avg * 100) }
  }, [rows])

  async function handleDelete(rowId) {
    const confirmed = window.confirm('Delete this history image? This cannot be undone.')
    if (!confirmed) return

    setDeleteError(null)
    setDeletingId(rowId)
    try {
      await deleteHistoryItem(rowId)
      setRows(current => current.filter(row => row.id !== rowId))
    } catch (e) {
      setDeleteError(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="premium-shell space-y-12 md:space-y-16">
      {/* HERO HEADER */}
      <section className="relative pt-4 md:pt-6">
        <div className="absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        
        <div className="enterprise-shell mobile-depth-card reveal-up px-5 py-6 sm:px-8 sm:py-10 md:px-10 md:py-12">
          <div className="kinetic-band" />
          <img
            src={imageAssets.leafMacro}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 saturate-125"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/76 to-black/58" />
          <div className="ambient-frame" />
          <div className="enterprise-grid absolute inset-0 opacity-30" />

          <div className="relative space-y-8">
            <div className="space-y-6">
              <div className="glass-strip inline-flex items-center gap-3 px-4 py-2 reveal-up" style={{ animationDelay: '0.1s' }}>
                <span className="eyebrow-dot" />
                <span className="text-[10px] uppercase tracking-[0.34em] text-white/55">Complete Record</span>
                <span className="h-4 w-px bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-neon/80">
                  {rows.length} {rows.length === 1 ? 'scan' : 'scans'}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div className="space-y-4">
                  <h1 className="headline-luxe text-[38px] font-semibold heading-gradient sm:text-6xl md:text-7xl">
                    Your scan log.
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-white/66 md:text-lg md:leading-9">
                    Every prediction you've run, with images and heatmaps attached. Click any card to review its diagnosis and compare with other findings.
                  </p>
                </div>

                <Link to="/scan" className="btn-primary text-base font-semibold">
                  <FeatureIcon name="scan" className="h-5 w-5" />
                  New scan
                </Link>
              </div>

              <div className="divider-neon" />

              <div className="grid gap-4 border-t border-white/8 pt-6 md:pt-8">
                <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">Overview</p>
                <div className="grid gap-4 sm:grid-cols-4">
                  {!loading && !error && (
                    <>
                      <div className="space-y-2">
                        <p className="text-2xl font-semibold text-white md:text-3xl">{stats.total}</p>
                        <p className="text-sm leading-6 text-white/48">Total scans</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-semibold text-neon md:text-3xl">{stats.healthy}</p>
                        <p className="text-sm leading-6 text-white/48">Healthy leaves</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-semibold text-accent-amber md:text-3xl">{stats.diseased}</p>
                        <p className="text-sm leading-6 text-white/48">With disease</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-semibold text-accent-sky md:text-3xl">{stats.avg}%</p>
                        <p className="text-sm leading-6 text-white/48">Avg confidence</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR & LOADING STATES */}
      {loading && <Loader messages={['Fetching records...', 'Loading predictions...']} />}

      {error && (
        <div className="glass border-red-500/30 p-4 text-sm text-red-300 flex items-center gap-2 reveal-up">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Couldn&apos;t load history: {error}
        </div>
      )}

      {deleteError && (
        <div className="glass border-red-500/30 p-4 text-sm text-red-300 flex items-center gap-2 reveal-up">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Couldn&apos;t delete history item: {deleteError}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && rows.length === 0 && (
        <div className="enterprise-shell mobile-depth-card p-8 text-center reveal-up sm:p-12">
          <div className="kinetic-band" />
          <img
            src={imageAssets.leafMacro}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-16"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/78" />
          <div className="ambient-frame opacity-40" />
          <div className="relative space-y-6">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shadow-lg shadow-neon/20">
              <FeatureIcon name="history" className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-white">No scans yet</p>
              <p className="text-sm text-white/50 max-w-sm mx-auto">Run your first leaf diagnosis to start building your scan history.</p>
            </div>
            <Link to="/scan" className="btn-primary inline-flex mt-6">
              <FeatureIcon name="scan" className="h-4 w-4" />
              Start scanning
            </Link>
          </div>
        </div>
      )}

      {/* SEARCH & FILTER */}
      {!loading && !error && rows.length > 0 && (
        <div className="reveal-up">
          <div className="relative max-w-md">
            <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" strokeWidth="1.6" stroke="currentColor">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by disease..."
              className="w-full bg-white/5 border border-white/10 focus:border-neon/50 focus:ring-2 focus:ring-neon/20 outline-none rounded-2xl pl-12 pr-5 py-3 text-sm placeholder-white/40 transition"
            />
          </div>
        </div>
      )}

      {/* HISTORY GRID */}
      {!loading && filtered.length > 0 && (
        <div className="reveal-up">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r, i) => (
              <HistoryCard
                key={r.id}
                row={r}
                delay={i * 0.05}
                deleting={deletingId === r.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && rows.length > 0 && (
        <div className="text-center py-12 reveal-up">
          <p className="text-white/60">No results match "{query}"</p>
        </div>
      )}
    </div>
  )
}

function HistoryCard({ row, delay = 0, deleting = false, onDelete }) {
  const pct = Math.round((row.confidence || 0) * 100)
  const healthy = /healthy/i.test(row.disease)
  const state = { result: { ...row, source: 'history' } }

  return (
    <div
      className="glass glass-hover surface-card mobile-depth-card group block overflow-hidden rounded-2xl reveal-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-video overflow-hidden border border-white/10 bg-black/40">
        <Link to="/result" state={state} className="block h-full">
          <img
            src={row.image_url}
            alt={row.disease}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.06] transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
          <span className={`absolute top-3 right-3 chip ${healthy ? 'chip-neon' : ''} !text-[10px] pointer-events-none font-semibold shadow-lg`}>
            {pct}%
          </span>
        </Link>

        <button
          type="button"
          onClick={() => onDelete(row.id)}
          disabled={deleting}
          className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-black/70 backdrop-blur px-3 py-1.5 text-[10px] font-semibold text-red-200 transition hover:border-red-300/60 hover:bg-black/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="p-4">
        <Link to="/result" state={state} className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`font-semibold text-sm truncate transition ${healthy ? 'text-neon' : 'text-white group-hover:text-white/80'}`}>
              {row.disease}
            </p>
            <p className="text-xs text-white/40 font-mono mt-1">
              {new Date(row.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/40 group-hover:text-neon transition" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  )
}
