import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import FeatureIcon from '../components/FeatureIcon.jsx'
import { imageAssets } from '../assets/imageAssets.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Auth({ mode = 'login' }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login, register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const target = location.state?.from?.pathname || '/scan'
  const title = isRegister ? 'Create your LeafAI account.' : 'Welcome back.'
  const subtitle = isRegister
    ? 'Save scans, track disease patterns, and keep diagnosis records tied to your workspace.'
    : 'Sign in to continue scanning and reviewing your private crop records.'

  const canSubmit = useMemo(() => {
    const hasEmail = form.email.trim().length > 0
    const hasPassword = form.password.length >= (isRegister ? 8 : 1)
    const hasName = !isRegister || form.name.trim().length >= 2
    return hasEmail && hasPassword && hasName && !busy
  }, [busy, form, isRegister])

  if (isAuthenticated) {
    return <Navigate to={target} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return

    setBusy(true)
    setError(null)
    try {
      if (isRegister) {
        await register(form)
      } else {
        await login({ email: form.email, password: form.password })
      }
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
      <section className="enterprise-shell mobile-depth-card min-h-[420px] overflow-hidden px-6 py-8 sm:px-8 md:px-10">
        <div className="kinetic-band" />
        <img
          src={imageAssets.leafMacro}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-24 saturate-125"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/88 via-black/70 to-black/54" />
        <div className="ambient-frame" />
        <div className="enterprise-grid absolute inset-0 opacity-35" />

        <div className="relative flex h-full flex-col justify-between gap-10">
          <div className="space-y-5">
            <span className="luxury-kicker">
              <span className="eyebrow-dot" />
              Secure workspace
            </span>
            <h1 className="headline-luxe max-w-xl text-[40px] font-semibold heading-gradient sm:text-6xl">
              {title}
            </h1>
            <p className="max-w-xl text-base leading-8 text-white/64">
              {subtitle}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: 'history', label: 'Private history' },
              { icon: 'scan', label: 'Saved scans' },
              { icon: 'brain', label: 'AI context' },
            ].map((item) => (
              <div key={item.label} className="glass-strip flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-white/68">
                <FeatureIcon name={item.icon} className="h-4 w-4 text-neon" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="enterprise-shell mobile-depth-card px-5 py-6 sm:px-8 sm:py-8">
        <div className="kinetic-band" />
        <div className="ambient-frame opacity-50" />

        <form onSubmit={handleSubmit} className="relative mx-auto flex max-w-md flex-col gap-5">
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-neon/70">
              {isRegister ? 'New account' : 'Account access'}
            </p>
            <h2 className="text-2xl font-semibold text-white">
              {isRegister ? 'Start your workspace' : 'Sign in'}
            </h2>
          </div>

          {isRegister && (
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
                placeholder="Akash"
                autoComplete="name"
              />
            </label>
          )}

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-neon/50 focus:ring-2 focus:ring-neon/20"
              placeholder={isRegister ? 'Minimum 8 characters' : 'Your password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary mt-2 justify-center text-base font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-white/48">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link to={isRegister ? '/login' : '/register'} state={location.state} className="font-semibold text-neon hover:text-white">
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
