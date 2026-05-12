import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-ink-inverse hover:bg-primary-600',
        accent: 'bg-accent text-ink-inverse hover:bg-accent-500',
        ghost: 'bg-transparent text-ink hover:bg-neutral-100',
        outline: 'border border-neutral-200 bg-transparent text-ink hover:bg-neutral-50',
        danger: 'bg-danger text-ink-inverse hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-md',
        md: 'h-11 px-5 text-base rounded-lg',
        lg: 'h-14 px-7 text-lg rounded-xl',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
