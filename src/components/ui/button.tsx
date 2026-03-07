import * as React from 'react';
import { cn } from '@/src/lib/utils';

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'destructive' | 'outline' | 'ghost' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          {
            'bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90': variant === 'default',
            'bg-red-500 text-zinc-50 hover:bg-red-500/90': variant === 'destructive',
            'border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900': variant === 'outline',
            'hover:bg-zinc-100 hover:text-zinc-900': variant === 'ghost',
          },
          'h-10 py-2 px-4',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
