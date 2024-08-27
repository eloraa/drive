import { Onetap } from '@/components/shared/onetap';
import { Signin } from '@/components/shared/signin';
import Script from 'next/script';
import { env } from 'process';

export default async function SigninPage() {
  return (
    <main className='flex h-full w-full items-center justify-center'>
      <div className='container items-center justify-center text-center md:flex'>
        <div>
          <Signin />
        </div>
      </div>
      <Onetap clientId={env.GOOGLE_CLIENT_ID ?? ''} />
      <Script
        defer
        strategy='beforeInteractive'
        src='https://accounts.google.com/gsi/client'
        async
      ></Script>
    </main>
  );
}
