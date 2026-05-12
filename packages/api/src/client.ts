import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from './router';

type ClientOptions = {
  url: string;
  getAuthHeader?: () => Promise<string | undefined> | string | undefined;
};

export function createFoxEatsClient({ url, getAuthHeader }: ClientOptions) {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url,
        transformer: superjson,
        async headers() {
          const token = await getAuthHeader?.();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

export type FoxEatsClient = ReturnType<typeof createFoxEatsClient>;
