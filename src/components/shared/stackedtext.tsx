import { cn } from '@/lib/utils';
import * as React from 'react';

const StackedTextWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center overflow-hidden py-2',
        className,
      )}
      {...props}
    />
  );
});
StackedTextWrapper.displayName = 'StackedTextWrapper';

const StackedText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-1 whitespace-nowrap pr-3 text-sm',
        className,
      )}
      {...props}
    />
  );
});
StackedText.displayName = 'StackedText';

export { StackedTextWrapper, StackedText };
