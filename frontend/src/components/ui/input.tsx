import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
   ({ className, type, ...props }, ref) => {
      return (
         <input
            type={type}
            className={cn(
               'flex min-h-11 w-full rounded-xl border border-primary/60 bg-background/70 px-4 py-2.5 text-sm caret-primary transition-[border-color,background-color]',
               'file:border-0 file:bg-transparent file:text-sm file:font-medium',
               'placeholder:text-muted-foreground',
               'hover:border-primary/80 focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none',
               'aria-invalid:border-destructive/75 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-60',
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
