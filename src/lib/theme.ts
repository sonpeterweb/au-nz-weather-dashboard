export const THEME_STORAGE_KEY = 'weather-dashboard-theme';

export const THEMES = ['light', 'dark', 'cupcake'] as const;

export type ThemeName = (typeof THEMES)[number];

export function isThemeName(value: string): value is ThemeName {
  return THEMES.includes(value as ThemeName);
}

export function getDefaultTheme(): ThemeName {
  return 'light';
}
