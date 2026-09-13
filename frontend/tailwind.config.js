/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wellness: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        slate: {
          850: '#151e2e',
          950: '#0a0f1d',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe-in': 'breatheIn 4s ease-in-out forwards',
        'breathe-hold': 'breatheHold 4s ease-in-out forwards',
        'breathe-out': 'breatheOut 6s ease-in-out forwards',
      },
      keyframes: {
        breatheIn: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.4)', opacity: '1' }
        },
        breatheHold: {
          '0%': { transform: 'scale(1.4)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0.95' }
        },
        breatheOut: {
          '0%': { transform: 'scale(1.4)', opacity: '0.95' },
          '100%': { transform: 'scale(1)', opacity: '0.6' }
        }
      }
    },
  },
  plugins: [],
}
