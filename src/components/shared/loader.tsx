import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type LoaderProps = {
  className?: string,
};
export const Loader = forwardRef<SVGSVGElement, LoaderProps>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn('h-11 w-11', className)}
      viewBox='0 0 100 100'
      {...props}
    >
      <polyline
        fill='none'
        points='0, 0, 100, 0, 100, 100'
        strokeWidth='15'
        className='stroke-gray-400'
      ></polyline>
      <polyline
        fill='none'
        points='0, 0, 0, 100, 100, 100'
        strokeWidth='15'
        className='stroke-gray-400'
      ></polyline>
      <polyline
        fill='none'
        points='0, 0, 100, 0, 100, 100'
        strokeWidth='15'
        className='origin-center transform animate-loading'
      ></polyline>
      <polyline
        fill='none'
        points='0, 0, 0, 100, 100, 100'
        strokeWidth='15'
        className='origin-center transform animate-loading'
      ></polyline>
    </svg>
  ),
);

Loader.displayName = 'Loader';
