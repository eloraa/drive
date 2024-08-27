'use client';

import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { GoogleLogin } from './google-login';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { signIn } from 'next-auth/react';

export const Signin = () => {
  const [isEmail, setIsEmail] = useState(false);
  const sendMagicLink = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const email = target.email.value as string;
    if (!email) return;

    console.log('email', email);

    void signIn('email', { email, redirect: false });
  };

  useEffect(() => {
    if (window.opener) {
      window.close();
    }
  }, []);
  return (
    <div className='flex gap-8 overflow-hidden p-2'>
      <div
        className={cn(
          'w-full min-w-full space-y-2 pt-2 transition-transform',
          isEmail && '-translate-x-full',
        )}
        ref={(el) => {
          if (!el) return;

          el.addEventListener('transitionend', () => {
            if (isEmail) el.classList.add('hidden');
            else el.classList.remove('hidden');
          });
        }}
      >
        <GoogleLogin />
        <Button
          onClick={() => setIsEmail(true)}
          variant='outline'
          className='flex items-center gap-2 max-md:w-full md:mx-auto md:px-16'
        >
          <div className='h-4 w-4'>
            <Mail />
          </div>
          Continue with Email
        </Button>
      </div>

      <div
        className={cn(
          'w-full min-w-full space-y-2 pt-2 transition-transform',
          !isEmail && 'translate-x-full',
        )}
        ref={(el) => {
          if (!el) return;

          el.addEventListener('transitionend', () => {
            if (!isEmail) el.classList.add('hidden');
            else el.classList.remove('hidden');
          });
        }}
      >
        <div className='flex items-center justify-center pb-2'>
          <Button
            variant='link'
            className='gap-2 text-white'
            onClick={() => setIsEmail(false)}
          >
            <ArrowLeft className='h-4 w-4' /> Go Back
          </Button>
        </div>
        <form onSubmit={sendMagicLink} className='space-y-2'>
          <div className='w-full md:mx-auto md:max-w-64'>
            <Input
              placeholder='Email'
              className='w-full'
              type='email'
              name='email'
            />
          </div>
          <Button className='mx-auto flex w-full max-w-32 items-center justify-between gap-2'>
            Sign In
            <div className='h-4 w-4'>
              <ArrowRight />
            </div>
          </Button>
        </form>

        <div className='pt-4'>
          <p className='flex items-center justify-center gap-2 text-xs text-neutral-500'>
            <span className='h-4 w-4'>
              <svg focusable='false' aria-hidden='true' viewBox='0 0 24 24'>
                <path
                  d='m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z'
                  fill='currentColor'
                ></path>
              </svg>
            </span>
            We&apos;ll send you a magic link to sign in
          </p>
        </div>
      </div>
    </div>
  );
};
