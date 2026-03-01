/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6e5ff', 100: '#c2c0ff', 200: '#9590ff', 300: '#6860ff', 400: '#3d30ff',
          500: '#0500ff', 600: '#0400cc', 700: '#030099', 800: '#020066', 900: '#010033',
          neon: '#0500ff',
        },
        accent: {
          50: '#fff0eb', 100: '#ffd6c7', 200: '#ffb8a3', 300: '#ff9a7f', 400: '#ff6b40',
          500: '#ff3d00', 600: '#cc3100', 700: '#992500', 800: '#661900', 900: '#330c00',
          neon: '#ff3d00',
        },
        surface: {
          900: '#000000', 800: '#0a0a0a', 700: '#111111', 600: '#171717', 500: '#1f1f1f',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
        'gradient-brand': 'linear-gradient(90deg, #0500ff 0%, #ff3d00 100%)',
        'gradient-brand-vertical': 'linear-gradient(180deg, #0500ff 0%, #ff3d00 100%)',
      },
      animation: {
        'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
      },
      keyframes: {
        'spin-around': {
          '0%': { transform: 'translateZ(0) rotate(0)' },
          '15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
          '65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
          '100%': { transform: 'translateZ(0) rotate(360deg)' },
        },
        'shimmer-slide': {
          to: { transform: 'translate(calc(100cqw - 100%), 0)' },
        },
      },
    },
  },
  plugins: [],
}
