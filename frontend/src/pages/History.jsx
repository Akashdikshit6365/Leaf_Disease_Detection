import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteHistoryItem, fetchHistory } from '../api/client.js'
import Loader from '../components/Loader.jsx'
import FeatureIcon from '../components/FeatureIcon.jsx'

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
    <div className="space-y-8">
      <header className="flex items-start justify-between flex-wrap gap-4 reveal-up">
        <div>
          <span className="chip">History</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold heading-gradient">Your scan log</h1>
          <p className="mt-3 text-white/60 text-sm max-w-xl">
            Every prediction you&apos;ve run, most recent first. Click any card to review
            its diagnosis and heatmap.
          </p>
        </div>
        <Link to="/scan" className="btn-primary">
          <FeatureIcon name="scan" className="w-4 h-4" />
          New scan
        </Link>
      </header>

      {/* stats rail */}
      {!loading && !error && rows.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal-fade">
          <Stat label="Total scans"   value={stats.total}    accent="text-white" />
          <Stat label="Healthy"       value={stats.healthy}  accent="text-neon" />
          <Stat label="Diseased"      value={stats.diseased} accent="text-accent-amber" />
          <Stat label="Avg confidence" value={`${stats.avg}%`} accent="text-accent-sky" />
        </div>
      )}

      {/* search */}
      {!loading && !error && rows.length > 0 && (
        <div className="relative max-w-md">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" strokeWidth="1.6" stroke="currentColor">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by disease..."
            className="w-full bg-white/5 border border-white/10 focus:border-neon/50 focus:ring-2 focus:ring-neon/20 outline-none rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-white/40 transition"
          />
        </div>
      )}

      {loading && <Loader messages={['Fetching records...', 'Loading predictions...']} />}

      {error && (
        <div className="glass border-red-500/30 p-4 text-sm text-red-300 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Couldn&apos;t load history: {error}
        </div>
      )}

      {deleteError && (
        <div className="glass border-red-500/30 p-4 text-sm text-red-300 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Couldn&apos;t delete history item: {deleteError}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="glass-strong p-14 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon mb-4 shadow-neon">
            <FeatureIcon name="history" className="w-6 h-6" />
          </div>
          <p className="text-lg font-medium">No scans yet</p>
          <p className="text-sm text-white/50 mt-1">Run your first diagnosis to see it here.</p>
          <Link to="/scan" className="btn-primary mt-6 inline-flex">Run your first scan</Link>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r, i) => (
            <HistoryCard
              key={r.id}
              row={r}
              delay={i * 0.03}
              deleting={deletingId === r.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, accent = 'text-white' }) {
  return (
    <div className="glass glass-hover surface-card p-4">
      <div className={`text-2xl font-semibold ${accent}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-white/40 mt-1">{label}</div>
    </div>
  )
}

function HistoryCard({ row, delay = 0, deleting = false, onDelete }) {
  const pct = Math.round((row.confidence || 0) * 100)
  const healthy = /healthy/i.test(row.disease)
  const state = { result: { ...row } }

  return (
    <div
      className="glass glass-hover surface-card group block p-4 reveal-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40">
        <Link to="/result" state={state} className="block h-full">
          <img
            src={row.image_url}
            alt={row.disease}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <span className={`absolute top-2 right-2 chip ${healthy ? 'chip-neon' : ''} !text-[10px] pointer-events-none`}>
            {pct}%
          </span>
        </Link>
        <button
          type="button"
          onClick={() => onDelete(row.id)}
          disabled={deleting}
          className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-lg border border-red-400/30 bg-black/65 px-2.5 py-1.5 text-[11px] font-medium text-red-200 transition hover:border-red-300/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <Link to="/result" state={state} className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`font-medium truncate ${healthy ? 'text-neon' : 'text-white'}`}>
              {row.disease}
            </p>
            <p className="text-xs text-white/50 font-mono mt-0.5">
              {new Date(row.created_at).toLocaleString()}
            </p>
          </div>
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-white/30 group-hover:text-neon transition" fill="none" strokeWidth="1.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
