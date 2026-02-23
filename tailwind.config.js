/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#09090b',
          surface: '#18181b',
          'surface-light': '#27272a',
          border: '#3f3f46',
          cyan: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#22c55e',
          red: '#ef4444',
          orange: '#f59e0b',
          text: '#fafafa',
          muted: '#a1a1aa',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(59,130,246,0.2), 0 0 20px rgba(59,130,246,0.1)',
        'neon-purple': '0 0 10px rgba(139,92,246,0.2), 0 0 20px rgba(139,92,246,0.1)',
        'neon-pink': '0 0 10px rgba(236,72,153,0.2), 0 0 20px rgba(236,72,153,0.1)',
        'neon-green': '0 0 10px rgba(34,197,94,0.2), 0 0 20px rgba(34,197,94,0.1)',
        'glow-sm': '0 0 10px rgba(59,130,246,0.15)',
        'glow-md': '0 0 20px rgba(59,130,246,0.2)',
        'glow-lg': '0 0 40px rgba(59,130,246,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glitch': 'glitch 1s linear infinite',
        'border-flow': 'border-flow 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59,130,246,0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(59,130,246,0.3)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'border-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': `
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        'neon-gradient': 'linear-gradient(135deg, #3b82f6, #8b5cf6, #6366f1)',
      },
    },
  },
  plugins: [],
}
