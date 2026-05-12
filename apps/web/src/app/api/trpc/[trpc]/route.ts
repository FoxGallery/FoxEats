import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@foxeats/api/router';
import { db } from '@foxeats/db';
import { auth } from '@foxeats/auth';
import { headers } from 'next/headers';

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const session = await auth.api.getSession({ headers: await headers() });
      return {
        session,
        db,
        ip: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      };
    },
  });
};

export { handler as GET, handler as POST };
