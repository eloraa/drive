import { Onetap } from '@/components/shared/onetap';
import { Signin } from '@/components/shared/signin';
import { FolderLock } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import { env } from 'process';

export default async function SigninPage() {
  return (
    <main className='flex h-full w-full items-center justify-center'>
      <div className='container items-center justify-center space-y-2 text-center md:flex'>
        <div>
          <div>
            <figure className='mx-auto h-20 w-20'>
              <Image
                src='/cloud.gif'
                alt='Drive'
                width='80'
                height='80'
                unoptimized
                priority
              />
            </figure>
            <div>
              <FolderLock className='inline h-4 w-4' />
            </div>
            <h1>
              Sign in to <span className='font-medium'>Drive</span>
            </h1>
            <p className='text-sm text-neutral-600'>
              Login to start uploading your files today.
            </p>
          </div>
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
