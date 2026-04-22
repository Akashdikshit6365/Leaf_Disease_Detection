/**
 * Stroke-style SVG icon set used by the Home page feature cards.
 * Each key returns a complete 24×24 <svg>.
 */
const ICONS = {
  scan:     <><circle cx="12" cy="12" r="3.5" /><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /></>,
  brain:    <><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8V13a3 3 0 0 0 2 2.8V17a3 3 0 0 0 3 3h1V4H9Z" /><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8V13a3 3 0 0 1-2 2.8V17a3 3 0 0 1-3 3h-1V4h1Z" /></>,
  chat:     <><path d="M4 6h16v10H8l-4 3V6Z" /><path d="M8 10h8M8 13h5" /></>,
  clock:    <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>,
  shield:   <><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  spark:    <><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M6.3 17.7l2.8-2.8M14.9 9.1l2.8-2.8" /></>,
  leaf:     <><path d="M20 4C11 3 4 10 5 20c9 1 16-6 15-16Z" /><path d="M6 19 17 8" /></>,
  camera:   <><rect x="3" y="6" width="18" height="13" rx="3" /><circle cx="12" cy="12.5" r="3.5" /><path d="M8 6l1.5-2h5L16 6" /></>,
  upload:   <><path d="M12 3v12m0-12 4 4m-4-4-4 4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /></>,
  database: <><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
  cloud:    <><path d="M7 16a5 5 0 1 1 2-9.5A6 6 0 0 1 20 11a4 4 0 0 1-1 8H7Z" /></>,
  history:  <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  layers:   <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5M3 17l9 5 9-5" /></>,
  zap:      <><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" /></>,
}

export default function FeatureIcon({ name = 'spark', className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
         className={className} stroke="currentColor" aria-hidden="true">
      {ICONS[name] || ICONS.spark}
    </svg>
  )
}
