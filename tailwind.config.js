/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        th: {
          bg: 'var(--bg)',
          'bg-s': 'var(--bg-s)',
          'bg-t': 'var(--bg-t)',
          border: 'var(--border)',
          'border-hover': 'var(--border-hover)',
          text: 'var(--text)',
          'text-s': 'var(--text-s)',
          'text-m': 'var(--text-m)',
          surface: 'var(--surface)',
          'surface-hover': 'var(--surface-hover)',
          accent: 'var(--accent)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['"OPPO Sans 4.0"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
