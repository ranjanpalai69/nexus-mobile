/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5C00',
          pink: '#E91E8C',
          purple: '#9333EA',
          cyan: '#06B6D4',
        },
        dark: {
          bg: '#0F0A1E',
          card: '#1A1030',
          border: '#2A1F45',
          muted: '#6B7280',
        },
      },
    },
  },
  plugins: [],
}
