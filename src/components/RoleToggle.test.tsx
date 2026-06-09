import { fireEvent, render, screen } from '@testing-library/react';

import { RoleToggle } from '@/components/RoleToggle';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams('role=manager&city=auckland'),
}));

describe('RoleToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders manager and analyst options', () => {
    render(<RoleToggle role='manager' />);

    expect(screen.getByRole('button', { name: 'Manager' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Analyst' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('updates URL when analyst is selected', () => {
    render(<RoleToggle role='manager' />);

    fireEvent.click(screen.getByRole('button', { name: 'Analyst' }));

    expect(mockPush).toHaveBeenCalledWith(
      '/dashboard?role=analyst&city=auckland',
      { scroll: false }
    );
  });
});
