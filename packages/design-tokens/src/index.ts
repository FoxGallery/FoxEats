/**
 * FoxEats — Design Tokens (DA-A "Méditerranée moderne")
 * Source unique pour Tailwind (web) et NativeWind (mobile).
 */

export const colors = {
  primary: {
    50: '#EAF0FB',
    100: '#C9D6F1',
    200: '#94ADE3',
    300: '#5F84D5',
    400: '#2D5BBE',
    500: '#0B3D91',
    600: '#093175',
    700: '#072558',
    800: '#04193C',
    900: '#020D1F',
    DEFAULT: '#0B3D91',
  },
  accent: {
    50: '#FFEDE9',
    100: '#FFC9BF',
    200: '#FFA194',
    300: '#FF7866',
    400: '#FF6B5C',
    500: '#E84E3F',
    600: '#B83A2F',
    700: '#892821',
    800: '#5A1814',
    900: '#2D0B09',
    DEFAULT: '#FF6B5C',
  },
  surface: {
    50: '#FFFDFA',
    100: '#FFF8EE',
    200: '#FAEED9',
    300: '#F0DEBE',
    DEFAULT: '#FFF8EE',
  },
  ink: {
    DEFAULT: '#0A1733',
    muted: '#5B6478',
    subtle: '#9AA1B0',
    inverse: '#FFFFFF',
  },
  success: { DEFAULT: '#1A8F4E', light: '#D6F0DF' },
  warn: { DEFAULT: '#E6A100', light: '#FFF1D1' },
  danger: { DEFAULT: '#C8261A', light: '#FBDAD7' },
  neutral: {
    50: '#F7F7F8',
    100: '#EEEFF2',
    200: '#D9DBE2',
    300: '#B7BBC6',
    400: '#8B92A2',
    500: '#5B6478',
    600: '#3F485B',
    700: '#2A3142',
    800: '#171C2A',
    900: '#0A0E18',
  },
} as const;

export const radii = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '20px',
  xl: '28px',
  full: '9999px',
} as const;

export const spacing = {
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const fontFamily = {
  display: ['Cabinet Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
} as const;

export const fontSize = {
  xs: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
  sm: ['14px', { lineHeight: '20px' }],
  base: ['16px', { lineHeight: '24px' }],
  lg: ['18px', { lineHeight: '28px' }],
  xl: ['20px', { lineHeight: '28px' }],
  '2xl': ['24px', { lineHeight: '32px' }],
  '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.01em' }],
  '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
  '5xl': ['48px', { lineHeight: '52px', letterSpacing: '-0.02em' }],
  '6xl': ['60px', { lineHeight: '64px', letterSpacing: '-0.03em' }],
  hero: ['80px', { lineHeight: '84px', letterSpacing: '-0.04em' }],
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgba(10, 23, 51, 0.06)',
  sm: '0 2px 4px -1px rgba(10, 23, 51, 0.08), 0 1px 2px -1px rgba(10, 23, 51, 0.04)',
  md: '0 8px 16px -4px rgba(10, 23, 51, 0.10), 0 2px 4px -2px rgba(10, 23, 51, 0.06)',
  lg: '0 16px 32px -8px rgba(10, 23, 51, 0.14), 0 4px 8px -4px rgba(10, 23, 51, 0.08)',
  xl: '0 24px 48px -12px rgba(10, 23, 51, 0.18)',
  glow: '0 0 0 4px rgba(11, 61, 145, 0.12)',
} as const;

export const motion = {
  spring: { stiffness: 240, damping: 22, mass: 1 },
  duration: { fast: 120, base: 200, slow: 320 },
  easing: { standard: [0.2, 0, 0, 1], emphasized: [0.3, 0, 0, 1] },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
