import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';
import { PUBLIC_ROUTE } from './constant';
import { getSession } from 'next-auth/react';

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const session = req.cookies.get('next-auth.session-token');
  const isAuthenticated = !!token || !!session;

  // if (PUBLIC_ROUTE.includes(req.nextUrl.pathname) && isAuthenticated) {
  //   return NextResponse.redirect(new URL('/dashboard', req.url));
  // }

  // if (!PUBLIC_ROUTE.includes(req.nextUrl.pathname) && !isAuthenticated) {
  //   return NextResponse.redirect(new URL('/signin', req.url));
  // }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.gif|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.ico|.*\\.mp4|.*\\.webm|.*\\.ogv|.*\\.ogg|.*\\.mp3|.*\\.wav|.*\\.flac$).*)',
  ],
};
