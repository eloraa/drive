'use client';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Loader } from './loader';
import { FolderLock } from 'lucide-react';
import { redirect } from 'next/navigation';

export const SigninWrapper = () => {
  return (
    <SessionProvider>
      <Signin />
    </SessionProvider>
  );
};
const Signin = () => {
  const { data: session, status } = useSession();
  const [dots, setDots] = useState('');

  

  useEffect(() => {
    console.log(session, status);
    if (!(status === 'loading') && !session) void signIn('google');
    if (session && window.opener && window.opener !== window) {
      window.close();
    }
    // if (session && !window.opener && window.opener === window) {
    //   redirect('/signin');
    // }
  }, [session, status]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : ''));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='space-y-4 text-center text-sm'>
        <div className='relative flex items-center justify-center'>
          <span className='absolute'>
            <FolderLock className='h-4 w-4' strokeWidth='3' />
          </span>
          <Loader />
        </div>
        <h1>Signing in{dots}</h1>
      </div>
    </div>
  );
};
