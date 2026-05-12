export const locales = ['fr', 'en', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export const localeLabel: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  it: 'Italiano',
};
