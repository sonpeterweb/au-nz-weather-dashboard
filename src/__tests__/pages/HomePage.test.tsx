import { render, screen } from '@testing-library/react';

import HomePage from '@/app/page';
import { siteConfig } from '@/constant/config';

jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid='theme-toggle' />,
}));

describe('Homepage', () => {
  it('renders the landing hero', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: siteConfig.title, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(siteConfig.landingPitch)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open dashboard' })
    ).toHaveAttribute('href', '/dashboard');
  });

  it('shows the tech stack badges', () => {
    render(<HomePage />);

    expect(screen.getByLabelText('Tech stack')).toBeInTheDocument();
    expect(screen.getByText('Next.js 15')).toBeInTheDocument();
    expect(screen.getByText('Recharts')).toBeInTheDocument();
    expect(screen.getByText('Zod')).toBeInTheDocument();
  });
});
