import { getDefaultTheme, isThemeName, THEMES } from './theme';

describe('theme', () => {
  it('exposes supported themes', () => {
    expect(THEMES).toEqual(['light', 'dark', 'cupcake']);
  });

  it('validates theme names', () => {
    expect(isThemeName('light')).toBe(true);
    expect(isThemeName('dark')).toBe(true);
    expect(isThemeName('cupcake')).toBe(true);
    expect(isThemeName('neon')).toBe(false);
  });

  it('returns light as default theme', () => {
    expect(getDefaultTheme()).toBe('light');
  });
});
