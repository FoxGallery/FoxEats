import { colors, radii, spacing, fontFamily, fontSize, shadows } from '@foxeats/design-tokens';

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors,
      borderRadius: radii,
      spacing,
      fontFamily,
      fontSize,
      boxShadow: shadows,
    },
  },
};
