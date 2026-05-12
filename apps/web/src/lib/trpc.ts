'use client';

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@foxeats/api';

export const trpc = createTRPCReact<AppRouter>();

export function trpcClientConfig() {
  return {
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: '/api/trpc',
        transformer: superjson,
      }),
    ],
  };
}
