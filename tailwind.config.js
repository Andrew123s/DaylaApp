/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-border': 'pulse-border 2s infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgba(34, 197, 94, 0.5)' },
          '50%': { borderColor: 'rgba(34, 197, 94, 1)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};