import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
   ({ className, type, ...props }, ref) => {
      return (
         <input
            type={type}
            className={cn(
               'flex min-h-11 w-full rounded-lg border border-input bg-card/70 px-3.5 py-2 text-sm shadow-sm transition-[border-color,box-shadow,background-color]',
               'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
               'placeholder:text-muted-foreground',
               'hover:border-primary/35 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
               'aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-60',
               className,
            )}
            ref={ref}
            {...props}
         />
      );
   },
);
Input.displayName = 'Input';

export { Input };
