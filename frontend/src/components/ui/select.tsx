import * as React from 'react';
import { cn } from '@/lib/utils';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
   ({ className, children, ...props }, ref) => {
      return (
         <select
            className={cn(
               'flex min-h-11 w-full rounded-xl border border-primary/60 bg-background/70 px-4 py-2.5 text-sm transition-[border-color,background-color]',
               'hover:border-primary/80 focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none',
               'aria-invalid:border-destructive disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-60',
               className,
            )}
            ref={ref}
            {...props}
         >
            {children}
         </select>
      );
   },
);
Select.displayName = 'Select';

export { Select };
