/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/webview/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: 'var(--canvas-bg)',
          surface: 'var(--canvas-surface)',
          panel: 'var(--canvas-panel)',
          border: 'var(--canvas-border)',
          muted: 'var(--canvas-muted)',
          accent: 'var(--canvas-accent)',
          'accent-soft': 'var(--canvas-accent-soft)',
          success: 'var(--canvas-success)',
          error: 'var(--canvas-error)',
          text: 'var(--canvas-text)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
