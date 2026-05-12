/**
 * FoxEats — Design Tokens v2 (DA-A "Riviera Moderne")
 * Source unique TS pour Tailwind (web) et NativeWind (mobile).
 * Doit rester en sync avec tokens.css.
 */

export const colors = {
  /* Light palette (defaults) */
  light: {
    bg: '#FAFAFA',
    bgElevated: '#FFFFFF',
    bgSubtle: '#F2F3F5',
    ink: '#0A0A0F',
    inkSoft: '#1C1D23',
    inkMuted: '#6B6E78',
    inkSubtle: '#A4A7B1',
    inkInverse: '#FFFFFF',
    brand: '#FF5A4A',
    brandHover: '#E84A3C',
    brandSoft: '#FFF0EE',
    brandStrong: '#C8261A',
    accent: '#0F2A56',
    accentHover: '#082046',
    accentSoft: '#E8EDF6',
    success: '#1FA060',
    successSoft: '#E3F7EB',
    warn: '#D97706',
    warnSoft: '#FEF3C7',
    danger: '#E11D2B',
    dangerSoft: '#FEE2E2',
    border: '#E7E8EC',
    borderStrong: '#D4D6DC',
  },
  dark: {
    bg: '#0A0A0F',
    bgElevated: '#15161D',
    bgSubtle: '#1E2030',
    ink: '#F5F5F7',
    inkSoft: '#E1E2E6',
    inkMuted: '#9A9DA7',
    inkSubtle: '#6B6E78',
    inkInverse: '#0A0A0F',
    brand: '#FF7868',
    brandHover: '#FF8A7A',
    brandSoft: '#2A1815',
    brandStrong: '#FF5A4A',
    accent: '#4D8BFF',
    accentHover: '#6499FF',
    accentSoft: '#15203A',
    success: '#34C477',
    successSoft: '#0F2A1C',
    warn: '#F59E0B',
    warnSoft: '#2A1F08',
    danger: '#F87171',
    dangerSoft: '#2A1416',
    border: '#2D2F3A',
    borderStrong: '#3E404C',
  },
} as const;

/* Aliases plats pour NativeWind preset (mobile) — utilise la palette light
 * comme défaut, le mobile gère dark via colorScheme + StyleSheet override. */
export const colorsFlat = {
  primary: { DEFAULT: colors.light.accent, 600: colors.light.accentHover },
  accent: { DEFAULT: colors.light.brand, 500: colors.light.brandHover },
  brand: colors.light.brand,
  surface: colors.light.bg,
  ink: {
    DEFAULT: colors.light.ink,
    muted: colors.light.inkMuted,
    subtle: colors.light.inkSubtle,
    inverse: colors.light.inkInverse,
  },
} as const;

export const radii = {
  none: '0',
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '20px',
  xl: '28px',
  '2xl': '36px',
  pill: '9999px',
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
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const fontFamily = {
  display: ['Cabinet Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
} as const;

export const fontSize = {
  '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.02em' }],
  xs: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
  sm: ['14px', { lineHeight: '20px' }],
  base: ['16px', { lineHeight: '24px' }],
  lg: ['18px', { lineHeight: '28px' }],
  xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
  '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.015em' }],
  '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
  '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.025em' }],
  '5xl': ['48px', { lineHeight: '52px', letterSpacing: '-0.03em' }],
  '6xl': ['60px', { lineHeight: '64px', letterSpacing: '-0.035em' }],
  '7xl': ['76px', { lineHeight: '78px', letterSpacing: '-0.04em' }],
  hero: ['96px', { lineHeight: '0.95', letterSpacing: '-0.045em' }],
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgba(10, 10, 15, 0.04)',
  sm: '0 2px 4px -1px rgba(10, 10, 15, 0.06), 0 1px 2px -1px rgba(10, 10, 15, 0.04)',
  md: '0 6px 12px -2px rgba(10, 10, 15, 0.08), 0 2px 4px -2px rgba(10, 10, 15, 0.04)',
  lg: '0 16px 32px -8px rgba(10, 10, 15, 0.10), 0 4px 8px -4px rgba(10, 10, 15, 0.06)',
  xl: '0 24px 48px -12px rgba(10, 10, 15, 0.14)',
  food: '0 24px 56px -16px rgba(255, 90, 74, 0.18)',
} as const;

export const motion = {
  spring: { stiffness: 240, damping: 22, mass: 1 },
  duration: { fast: 120, base: 200, slow: 320 },
  easing: {
    out: [0.16, 1, 0.3, 1] as const,
    inOut: [0.65, 0, 0.35, 1] as const,
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
