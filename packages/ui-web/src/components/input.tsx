import * as React from 'react';
import { cn } from '../lib/cn';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'text-ink placeholder:text-ink-subtle focus:border-primary focus:ring-primary/20 h-11 w-full rounded-md border border-neutral-200 bg-white px-4 text-base focus:outline-none focus:ring-2',
        className,
      )}
      {...props}
    />
  );
});
