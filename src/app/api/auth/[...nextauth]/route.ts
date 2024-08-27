import { authOptions } from '@/server/auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';

type CombineRequest = Request & NextApiRequest & NextRequest;
type CombineResponse = Response & NextApiResponse & NextResponse;

async function auth(
  req: CombineRequest,
  res: CombineResponse,
): Promise<ReturnType<typeof NextAuth>> {
  return await NextAuth(req, res, authOptions(req, res));
}

export { auth as GET, auth as POST };
