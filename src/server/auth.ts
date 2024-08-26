import { DrizzleAdapter } from '@auth/drizzle-adapter';
import {
  getServerSession,
  type User,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth';
import { type Adapter } from 'next-auth/adapters';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { OAuth2Client } from 'google-auth-library';
import { headers } from 'next/headers';

import { env } from '@/env';
import { db } from '@/server/db';
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from '@/server/db/schema';
import {
  decode,
  encode,
  type JWT,
  type JWTDecodeParams,
  type JWTEncodeParams,
} from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
}) as Adapter;

export const googleAuthClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(';').map((cookie) => {
      const [key, value] = cookie.split('=').map((part) => part.trim());
      return [key, value];
    }),
  ) as Record<string, string>;
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    async signIn({ user, account }) {
      if (account?.type === 'credentials') {
        const sessionToken = uuidv4();
        const sessionMaxAge = 30 * 24 * 60 * 60; // 30 days
        const sessionExpiry = new Date(Date.now() + sessionMaxAge * 1000);

        await adapter.createSession!({
          userId: user.id,
          expires: sessionExpiry,
          sessionToken: sessionToken,
        });

        const cookies = (await import('next/headers')).cookies();

        cookies.set('next-auth.session-token', sessionToken, {
          expires: sessionExpiry,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        });
      }
      return true;
    },
  },
  jwt: {
    encode: async ({ token, secret }) => {
      if (typeof window !== 'undefined') {
        return encode({ token, secret });
      }

      const cookie = parseCookies(headers().get('cookie') ?? '');
      const sessionToken = cookie['next-auth.session-token'];

      if (sessionToken) {
        return sessionToken;
      }

      return '';
    },
    decode: async ({ token, secret }) => {
      if (typeof window !== 'undefined') {
        return decode({ token, secret });
      }

      const cookie = parseCookies(headers().get('cookie') ?? '');
      const sessionToken = cookie['next-auth.session-token'];

      if (sessionToken) {
        const session = await adapter.getSessionAndUser!(sessionToken);
        return session;
      }

      return null;
    },
  },
  pages: {
    signIn: '/signin',
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
    }),
    CredentialsProvider({
      id: 'googleonetap',
      name: 'google-one-tap',
      credentials: {
        credential: { type: 'text' },
      },
      authorize: async (
        credentials: Record<'credential', string> | undefined,
      ): Promise<User | null> => {
        const token = credentials!.credential;
        const ticket = await googleAuthClient.verifyIdToken({
          idToken: token,
          audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
          throw new Error('Cannot extract payload from signin token');
        }

        const {
          email,
          sub,
          given_name,
          family_name,
          email_verified,
          picture: image,
        } = payload;
        if (!email) {
          throw new Error('Email not available');
        }

        let user = await adapter.getUserByEmail!(email);

        if (!user && adapter.createUser) {
          user = await adapter.createUser({
            name: [given_name, family_name].join(' '),
            email,
            image,
            emailVerified: email_verified ? new Date() : null,
          });
        }

        const account = await adapter.getUserByAccount!({
          provider: 'google',
          providerAccountId: sub,
        });

        if (!account && user && adapter.linkAccount) {
          await adapter.linkAccount({
            userId: user.id,
            provider: 'google',
            providerAccountId: sub,
            type: 'oauth',
          });
        }
        return user;
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
