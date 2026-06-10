import { renderHook } from '@testing-library/react';

import { useDashboardSearchParams } from '@/hooks/useDashboardSearchParams';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams('role=manager&city=auckland'),
}));

describe('useDashboardSearchParams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pushes updated search params to the dashboard route', () => {
    const { result } = renderHook(() => useDashboardSearchParams());

    result.current.updateParams({
      role: 'analyst',
      city: ['auckland', 'sydney'],
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/dashboard?role=analyst&city=auckland%2Csydney',
      { scroll: false }
    );
  });
});
