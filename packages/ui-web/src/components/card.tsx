import * as React from 'react';
import { cn } from '../lib/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg bg-white p-4 shadow-md ring-1 ring-neutral-100', className)}
      {...props}
    />
  );
}
