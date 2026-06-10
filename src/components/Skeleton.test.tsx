import { render } from '@testing-library/react';

import { Skeleton } from '@/components/Skeleton';

describe('Skeleton', () => {
  it('renders with skeleton styling', () => {
    const { container } = render(<Skeleton className='h-8 w-24' />);
    expect(container.firstChild).toHaveClass('skeleton', 'h-8', 'w-24');
  });
});
