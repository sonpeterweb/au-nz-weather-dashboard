import { fireEvent, render, screen } from '@testing-library/react';

import { ViewToggle } from '@/components/ViewToggle';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams('view=summary&city=auckland'),
}));

describe('ViewToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders summary and charts options', () => {
    render(<ViewToggle view='summary' />);

    expect(screen.getByRole('button', { name: 'Summary' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Charts' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('updates URL when charts is selected', () => {
    render(<ViewToggle view='summary' />);

    fireEvent.click(screen.getByRole('button', { name: 'Charts' }));

    expect(mockPush).toHaveBeenCalledWith(
      '/dashboard?view=charts&city=auckland',
      { scroll: false }
    );
  });
});
