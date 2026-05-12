const preset = require('../../packages/config/tailwind.preset.mjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../../packages/ui-mobile/src/**/*.{ts,tsx}'],
  presets: [preset.default ?? preset],
};
