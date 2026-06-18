'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied:         "Access wasn't granted. You can try again or connect a different account.",
  state_expired:         'The connection timed out. Please try again.',
  state_mismatch:        'Something went wrong. Please try again.',
  token_exchange_failed: 'Something went wrong on our end. Please try again.',
  channel_fetch_failed:  'We couldn\'t reach YouTube. Please try again.',
  no_channel:            'No YouTube channel found for this Google account.',
};

function OAuthCallbackInner() {
  const params = useSearchParams();

  useEffect(() => {
    const status = params.get('status');

    if (!window.opener) {
      // Opened directly (not as popup) — go home
      window.location.href = '/';
      return;
    }

    if (status === 'success') {
      const subscriberCountRaw = params.get('subscriberCount');
      window.opener.postMessage(
        {
          type:            'YOUTUBE_OAUTH_CALLBACK',
          status:          'success',
          channelId:       params.get('channelId'),
          channelName:     params.get('channelName'),
          thumbnailUrl:    params.get('thumbnailUrl') ?? undefined,
          subscriberCount: subscriberCountRaw ? parseInt(subscriberCountRaw, 10) : undefined,
        },
        window.location.origin,
      );
    } else {
      const reason = params.get('reason') ?? 'unknown_error';
      window.opener.postMessage(
        {
          type:   'YOUTUBE_OAUTH_CALLBACK',
          status: 'error',
          error:  ERROR_MESSAGES[reason] ?? 'Connection failed. Please try again.',
        },
        window.location.origin,
      );
    }

    window.close();
  }, [params]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif', color: '#696764', fontSize: 14 }}>
      Connecting your YouTube channel…
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }} />}>
      <OAuthCallbackInner />
    </Suspense>
  );
}
