/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:   { 900: '#050608', 800: '#0a0d12', 700: '#111419', 600: '#171b22', 500: '#1e242d' },
        neon:  { DEFAULT: '#39FF88', 300: '#9cffc4', 400: '#5bff9f', 500: '#39FF88', 600: '#16d86a', 700: '#0e9e4b' },
        accent: {
          sky:    '#38bdf8',
          violet: '#a855f7',
          amber:  '#fbbf24',
          rose:   '#fb7185',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        neon:       '0 0 24px rgba(57,255,136,0.35)',
        'neon-lg':  '0 0 60px rgba(57,255,136,0.55)',
        glass:      '0 10px 40px -12px rgba(0,0,0,0.7)',
        'inner-top':'inset 0 1px 0 0 rgba(255,255,255,0.08)',
      },
      backdropBlur: { xs: '2px' },
      backgroundImage: {
        'radial-fade': 'radial-gradient(ellipse at center, rgba(57,255,136,0.18), transparent 60%)',
      },
      keyframes: {
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseRing:  { '0%': { transform: 'scale(0.95)', opacity: '0.7' }, '70%': { transform: 'scale(1.25)', opacity: '0' }, '100%': { transform: 'scale(0.95)', opacity: '0' } },
        float:      { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(0,-14px,0)' } },
        drift:      { '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' }, '33%': { transform: 'translate3d(28px,-18px,0) scale(1.05)' }, '66%': { transform: 'translate3d(-22px,24px,0) scale(0.96)' } },
        glowPulse:  { '0%,100%': { boxShadow: '0 0 24px rgba(57,255,136,0.35)' }, '50%': { boxShadow: '0 0 48px rgba(57,255,136,0.6)' } },
        typing:     { '0%': { opacity: '0.3' }, '30%': { opacity: '1' }, '100%': { opacity: '0.3' } },
        blurIn:     { '0%': { opacity: '0', backdropFilter: 'blur(0px)' }, '100%': { opacity: '1', backdropFilter: 'blur(20px)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translate3d(32px, 0, 0)' }, '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' } },
        slideInLeft: { '0%': { opacity: '0', transform: 'translate3d(-32px, 0, 0)' }, '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' } },
        scaleIn:    { '0%': { opacity: '0', transform: 'scale(0.92)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        fadeInUp:   { '0%': { opacity: '0', transform: 'translate3d(0, 12px, 0)' }, '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' } },
      },
      animation: {
        shimmer:   'shimmer 2.2s linear infinite',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
        float:     'float 6s ease-in-out infinite',
        drift:     'drift 14s ease-in-out infinite',
        glowPulse: 'glowPulse 2.4s ease-in-out infinite',
        typing:    'typing 1.4s ease-in-out infinite',
        blurIn:    'blurIn 0.6s ease-out',
        slideInRight: 'slideInRight 0.5s ease-out',
        slideInLeft: 'slideInLeft 0.5s ease-out',
        scaleIn:   'scaleIn 0.4s ease-out',
        fadeInUp:  'fadeInUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
