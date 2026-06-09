import { fireEvent, render, screen } from '@testing-library/react';

import { THEME_STORAGE_KEY } from '@/lib/theme';

import { ThemeToggle } from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });
  });

  it('renders theme selector after mount', async () => {
    render(<ThemeToggle />);

    expect(await screen.findByLabelText('Select theme')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Toggle light and dark theme')
    ).toBeInTheDocument();
  });

  it('applies dark theme when swap is toggled on', async () => {
    render(<ThemeToggle />);
    await screen.findByLabelText('Select theme');

    fireEvent.click(screen.getByLabelText('Toggle light and dark theme'));

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('applies cupcake theme from select', async () => {
    render(<ThemeToggle />);
    const select = await screen.findByLabelText('Select theme');

    fireEvent.change(select, { target: { value: 'cupcake' } });

    expect(document.documentElement.getAttribute('data-theme')).toBe('cupcake');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('cupcake');
  });
});
