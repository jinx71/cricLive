/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // CricLive accent — Royal blue
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bdd1ff',
          300: '#8fb1ff',
          400: '#5b87ff',
          500: '#3b62f5',
          600: '#2641d9',
          700: '#1f33b0',
          800: '#1e2f8e',
          900: '#1e2c70',
          950: '#131a45',
        },
        accent: {
          gold: '#f5b740',
          live: '#e63946',
          pitch: '#06b06c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 6px 24px -8px rgba(31, 51, 176, 0.18)',
      },
      borderRadius: {
        xl: '0.9rem',
      },
      animation: {
        'pulse-live': 'pulseLive 1.4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
      },
      keyframes: {
        pulseLive: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.55, transform: 'scale(0.92)' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
