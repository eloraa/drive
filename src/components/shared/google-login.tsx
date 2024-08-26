'use client';

import { Button } from '../ui/button';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type GoogleLoginProps = React.ComponentPropsWithoutRef<'button'> & {
  onClick?: () => void;
  className?: string;
};

export const GoogleLogin = forwardRef<HTMLButtonElement, GoogleLoginProps>(
  ({ className, onClick, ...props }, ref) => {
    const router = useRouter();

    const popupCenter = (url: string, title: string) => {
      if (onClick) return onClick();
      const dualScreenLeft = window.screenLeft ?? window.screenX;
      const dualScreenTop = window.screenTop ?? window.screenY;

      const width =
        window.innerWidth ??
        document.documentElement.clientWidth ??
        screen.width;

      const height =
        window.innerHeight ??
        document.documentElement.clientHeight ??
        screen.height;

      const systemZoom = width / window.screen.availWidth;

      const left = (width - 400) / 2 / systemZoom + dualScreenLeft;
      const top = (height - 650) / 2 / systemZoom + dualScreenTop;

      const newWindow = window.open(
        url,
        title,
        `width=${400 / systemZoom},height=${
          650 / systemZoom
        },top=${top},left=${left}`,
      );

      window.onLoginSuccess = () => {
        router.refresh();
      };

      newWindow?.focus();
    };
    return (
      <Button
        ref={ref}
        onClick={() => popupCenter('/google-signin', 'Google Sign In')}
        className={cn(
          'flex items-center gap-2 max-md:w-full md:mx-auto md:px-16',
          className,
        )}
        {...props}
      >
        <div className='h-4 w-4'>
          <svg width='16' height='16' fill='none' viewBox='0 0 16 16'>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M8.12112 7.14231V9.20025H11.5931C11.4521 10.0836 10.5431 11.7877 8.12112 11.7877C6.03125 11.7877 4.3262 10.0912 4.3262 8.00022C4.3262 5.90951 6.03125 4.21296 8.12112 4.21296C9.30964 4.21296 10.1061 4.71012 10.5607 5.13841L12.2229 3.57031C11.1564 2.59105 9.77419 2 8.12202 2C4.73812 2 2 4.68355 2 8C2 11.3164 4.73812 14 8.12202 14C11.6544 14 14 11.5649 14 8.13798C14 7.74424 13.9571 7.44438 13.9042 7.14432L8.12202 7.14188L8.12112 7.14233V7.14231Z'
              fill='currentColor'
            ></path>
          </svg>
        </div>
        Sign In with Google
      </Button>
    );
  },
);

GoogleLogin.displayName = 'GoogleLogin';
