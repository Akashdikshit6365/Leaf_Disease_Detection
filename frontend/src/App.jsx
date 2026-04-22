import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import AuroraBackground from './components/AuroraBackground.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Scan from './pages/Scan.jsx'
import Result from './pages/Result.jsx'
import Chat from './pages/Chat.jsx'
import History from './pages/History.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <AuroraBackground />
      <ScrollToTop />
      <div className="relative flex min-h-screen flex-col">
        <Navbar />

        <main className="relative container mx-auto max-w-7xl flex-1 px-4 py-8 sm:py-10 md:px-8 md:py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/result" element={<Result />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="relative mt-8 border-t border-white/5 bg-black/18 backdrop-blur-xl">
          <div className="divider-neon opacity-70" />
          <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
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
                  { label: 'Engine', value: 'Groq-powered' },
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
