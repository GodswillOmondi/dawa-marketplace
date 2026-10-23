/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alabaster: {
          DEFAULT: '#FDFBF7',
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#F7F2E7',
          300: '#EFE6D4',
        },
        espresso: {
          DEFAULT: '#1A1110',
          50: '#F5EFEB',
          100: '#E4D5CD',
          800: '#2A1C1A',
          900: '#1A1110',
          950: '#0F0A09',
        },
        brass: {
          DEFAULT: '#D4AF37',
          light: '#E5C564',
          dark: '#B28E22',
        },
        sage: {
          DEFAULT: '#9CAF88',
          light: '#B4C3A3',
          dark: '#7A8E65',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
