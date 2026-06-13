'use client';

import { useCallback, useEffect, useState } from 'react';

type ShareStatus = 'idle' | 'copied' | 'error';

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('Copy command failed');
  }
}

export function ShareButton() {
  const [status, setStatus] = useState<ShareStatus>('idle');

  useEffect(() => {
    if (status === 'idle') {
      return;
    }

    const timer = window.setTimeout(() => setStatus('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleShare = useCallback(async () => {
    try {
      await copyToClipboard(window.location.href);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }, []);

  const label =
    status === 'copied'
      ? 'Dashboard link copied'
      : status === 'error'
      ? 'Failed to copy dashboard link'
      : 'Copy dashboard link';

  return (
    <div className='flex flex-col items-stretch'>
      <button
        type='button'
        className='btn btn-outline btn-sm'
        onClick={handleShare}
        aria-label={label}
      >
        {status === 'copied'
          ? 'Copied!'
          : status === 'error'
          ? 'Copy failed'
          : 'Share'}
      </button>
      <p className='sr-only' aria-live='polite'>
        {status === 'copied' ? 'Dashboard link copied to clipboard.' : null}
        {status === 'error'
          ? 'Unable to copy dashboard link. Copy the URL from your browser instead.'
          : null}
      </p>
    </div>
  );
}
