/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui-mobile/src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0B3D91', 600: '#093175' },
        accent: { DEFAULT: '#FF6B5C', 500: '#E84E3F' },
        surface: '#FFF8EE',
        ink: {
          DEFAULT: '#0A1733',
          muted: '#5B6478',
          subtle: '#9AA1B0',
          inverse: '#FFFFFF',
        },
        neutral: {
          50: '#F7F7F8',
          100: '#EEEFF2',
          200: '#D9DBE2',
        },
      },
      fontFamily: {
        display: ['Cabinet Grotesk'],
        sans: ['Inter'],
      },
    },
  },
};
