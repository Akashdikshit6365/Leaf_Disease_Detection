import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import AuroraBackground from './components/AuroraBackground.jsx'
import Navbar from './components/Navbar.jsx'
import ScrollEffects from './components/ScrollEffects.jsx'
import Home from './pages/Home.jsx'
import Scan from './pages/Scan.jsx'
import Result from './pages/Result.jsx'
import Chat from './pages/Chat.jsx'
import History from './pages/History.jsx'
import Auth from './pages/Auth.jsx'
import { useAuth } from './auth/AuthContext.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function ProtectedRoute({ children }) {
  const location = useLocation()
  const { checking, isAuthenticated } = useAuth()

  if (checking) {
    return (
      <div className="enterprise-shell mobile-depth-card mx-auto max-w-xl p-8 text-center text-white/68">
        Checking your session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default function App() {
  return (
    <>
      <AuroraBackground />
      <ScrollEffects />
      <ScrollToTop />
      <div className="relative flex min-h-screen flex-col">
        <Navbar />

        <main className="relative container mx-auto max-w-7xl flex-1 px-4 py-8 sm:py-10 md:px-8 md:py-12" style={{
          paddingTop: 'max(2rem, calc(env(safe-area-inset-top, 0) + 2rem))',
          paddingBottom: 'max(6.5rem, calc(env(safe-area-inset-bottom, 0) + 6.5rem))',
          paddingLeft: 'max(1rem, calc(env(safe-area-inset-left, 0) + 1rem))',
          paddingRight: 'max(1rem, calc(env(safe-area-inset-right, 0) + 1rem))',
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
            <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="relative mt-10 border-t border-white/5 bg-black/18 pb-[calc(env(safe-area-inset-bottom,0)+5.75rem)] backdrop-blur-xl md:pb-0">
          <div className="divider-neon opacity-70" />
          <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
            <div className="panel-orbit grid gap-8 px-5 py-6 md:grid-cols-[1.2fr_0.8fr] md:items-end md:px-8 md:py-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-white/42">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-neon animate-glowPulse" />
                  LeafAI
                </div>

                <div>
                  <p className="text-xl font-semibold text-white">Plant diagnostics with a clearer visual flow.</p>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-white/48">
                    Scan, review, and respond through one calm interface designed to keep diagnosis and guidance in the same place.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3 md:justify-items-end">
                {[
                  { label: 'Product', value: 'LeafAI' },
                  { label: 'Version', value: 'v1.0' },
                  { label: 'Mode', value: 'Smart diagnosis' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1 sm:text-center md:text-right">
                    <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/34">{item.label}</p>
                    <p className="text-sm font-medium text-white/68">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
