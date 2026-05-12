import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, users, sessions, accounts, verifications } from '@foxeats/db';
import { sendMagicLinkEmail } from '@foxeats/notifications';

type SocialProviders = NonNullable<Parameters<typeof betterAuth>[0]['socialProviders']>;

function socialProviders(): SocialProviders {
  const providers: SocialProviders = {};
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    providers.apple = {
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    };
  }
  return providers;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  emailAndPassword: { enabled: false },
  socialProviders: socialProviders(),
  plugins: [
    magicLink({
      expiresIn: 60 * 15,
      disableSignUp: false,
      async sendMagicLink({ email, url }) {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    'foxeats://',
    'foxeats-driver://',
  ],
});

export type Auth = typeof auth;
export type Session = Auth['$Infer']['Session'];
