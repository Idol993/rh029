/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bg: {
          primary: '#0a0f1a',
          secondary: '#111827',
          card: '#1a2332',
          'card-hover': '#1f2b3d',
        },
        border: {
          DEFAULT: '#2a3548',
          light: '#374357',
        },
        txt: {
          primary: '#e8edf5',
          secondary: '#8896ab',
          muted: '#5a6a80',
        },
        accent: {
          green: '#00d4aa',
          'green-light': '#33e0be',
          'green-dim': 'rgba(0, 212, 170, 0.12)',
          orange: '#ff6b35',
          'orange-dim': 'rgba(255, 107, 53, 0.12)',
          red: '#ff3b5c',
          'red-dim': 'rgba(255, 59, 92, 0.12)',
          yellow: '#fbbf24',
          'yellow-dim': 'rgba(251, 191, 36, 0.12)',
          blue: '#3b82f6',
          'blue-dim': 'rgba(59, 130, 246, 0.12)',
          cyan: '#06b6d4',
          'cyan-dim': 'rgba(6, 182, 212, 0.12)',
        },
      },
      fontFamily: {
        display: ['JetBrains Mono', 'DIN Alternate', 'monospace'],
        body: ['Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s infinite',
        'pulse-red': 'pulse-red 1.5s infinite',
        'pulse-orange': 'pulse-orange 1.8s infinite',
        glow: 'glow 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
