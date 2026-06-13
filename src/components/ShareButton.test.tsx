import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ShareButton } from '@/components/ShareButton';

describe('ShareButton', () => {
  const originalLocation = window.location;
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        href: 'http://localhost:3000/dashboard?view=charts&city=sydney',
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
    document.execCommand = originalExecCommand;
    jest.restoreAllMocks();
  });

  it('copies the current dashboard URL to the clipboard', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(<ShareButton />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy dashboard link' })
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        'http://localhost:3000/dashboard?view=charts&city=sydney'
      );
    });

    expect(
      await screen.findByRole('button', { name: 'Dashboard link copied' })
    ).toHaveTextContent('Copied!');
  });

  it('announces a copy failure when clipboard access is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    document.execCommand = jest.fn().mockReturnValue(false);

    render(<ShareButton />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy dashboard link' })
    );

    expect(
      await screen.findByRole('button', {
        name: 'Failed to copy dashboard link',
      })
    ).toHaveTextContent('Copy failed');
    expect(
      screen.getByText(
        'Unable to copy dashboard link. Copy the URL from your browser instead.'
      )
    ).toBeInTheDocument();
  });
});
