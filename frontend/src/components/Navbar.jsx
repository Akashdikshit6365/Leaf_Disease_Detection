import { NavLink, Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

const tabs = [
  { to: '/', label: 'Home' },
  { to: '/scan', label: 'Scan' },
  { to: '/chat', label: 'Chat' },
  { to: '/history', label: 'History' },
]

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-gradient-to-b from-ink-900/88 via-ink-900/58 to-transparent backdrop-blur-2xl">
      <div className="absolute inset-x-0 bottom-0 divider-neon opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,136,0.06),transparent_50%)] pointer-events-none" />
      
      <div className="container relative z-10 mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 md:h-[76px] md:px-8">
        <Link to="/" className="group flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <Logo size={38} />
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight text-white">
              Leaf<span className="text-neon font-bold">AI</span>
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/36 transition-colors group-hover:text-white/54">
              Visual crop diagnostics
            </div>
          </div>
        </Link>

        <nav className="nav-dock hidden items-center gap-1 p-1.5 md:flex">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2.5 text-sm font-medium tracking-[0.01em] transition-all duration-300 ${
                  isActive
                    ? 'nav-chip-active'
                    : 'text-white/58 hover:text-white/88'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && (
            <div className="glass-strip hidden items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.24em] text-white/40 lg:inline-flex">
              <span className="h-2 w-2 rounded-full bg-neon shadow-neon animate-glowPulse" />
              {user?.name || 'Workspace'}
            </div>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/scan" className="btn-primary !px-4 !py-2.5 text-sm font-semibold flex items-center gap-2 sm:!px-5">
                Scan
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <button type="button" onClick={logout} className="btn-ghost !px-4 !py-2.5 text-sm font-semibold">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2.5 text-sm font-semibold sm:!px-5">
              Login
            </Link>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <nav className="nav-dock mx-auto grid max-w-md grid-cols-4 gap-1 p-1 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.95)]">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-2 py-3 text-center text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'nav-chip-active'
                    : 'text-white/58 hover:bg-white/[0.07] hover:text-white'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
