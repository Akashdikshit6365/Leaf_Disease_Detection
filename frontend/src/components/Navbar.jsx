import { NavLink, Link } from 'react-router-dom'
import Logo from './Logo.jsx'

const tabs = [
  { to: '/', label: 'Home' },
  { to: '/scan', label: 'Scan' },
  { to: '/chat', label: 'Chat' },
  { to: '/history', label: 'History' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-gradient-to-b from-ink-900/82 to-ink-900/34 backdrop-blur-2xl">
      <div className="absolute inset-x-0 bottom-0 divider-neon opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,136,0.06),transparent_50%)] pointer-events-none" />
      
      <div className="container relative z-10 mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="group flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <Logo size={38} />
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight text-white">
              Leaf<span className="text-neon font-bold">AI</span>
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/36 transition-colors group-hover:text-white/54">
              Visual crop diagnosis
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `relative px-1 py-2 text-sm font-medium tracking-[0.01em] transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-white/58 hover:text-white/88'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-white/40 lg:block">
            Ready to scan
          </div>
          <Link to="/scan" className="btn-primary !px-4 !py-2.5 text-sm font-semibold flex items-center gap-2 sm:!px-5">
            Scan
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-3 md:hidden">
        <nav className="grid grid-cols-4 gap-2 rounded-[24px] border border-white/8 bg-white/[0.03] p-2 backdrop-blur-xl">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `rounded-[18px] px-2 py-2.5 text-center text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-ink-900 shadow-[0_12px_28px_-18px_rgba(255,255,255,0.75)]'
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
