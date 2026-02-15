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
          bg: '#0a0a0f',
          surface: '#12121a',
          'surface-light': '#1a1a25',
          border: '#1e1e2e',
          cyan: '#00fff2',
          purple: '#bf00ff',
          pink: '#ff00aa',
          green: '#00ff88',
          red: '#ff0055',
          orange: '#ff8800',
          text: '#e4e4e7',
          muted: '#71717a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00fff2, 0 0 20px #00fff2, 0 0 40px #00fff2',
        'neon-purple': '0 0 5px #bf00ff, 0 0 20px #bf00ff, 0 0 40px #bf00ff',
        'neon-pink': '0 0 5px #ff00aa, 0 0 20px #ff00aa, 0 0 40px #ff00aa',
        'neon-green': '0 0 5px #00ff88, 0 0 20px #00ff88, 0 0 40px #00ff88',
        'glow-sm': '0 0 10px rgba(0, 255, 242, 0.3)',
        'glow-md': '0 0 20px rgba(0, 255, 242, 0.4)',
        'glow-lg': '0 0 40px rgba(0, 255, 242, 0.5)',
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
          '0%': { boxShadow: '0 0 5px #00fff2, 0 0 10px #00fff2' },
          '100%': { boxShadow: '0 0 10px #00fff2, 0 0 20px #00fff2, 0 0 30px #00fff2' },
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
          linear-gradient(rgba(0, 255, 242, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 242, 0.03) 1px, transparent 1px)
        `,
        'neon-gradient': 'linear-gradient(135deg, #00fff2, #bf00ff, #ff00aa)',
      },
    },
  },
  plugins: [],
}
