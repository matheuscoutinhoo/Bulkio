import * as React from 'react';
import { cn } from '@/lib/utils';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
   ({ className, children, ...props }, ref) => {
      return (
         <select
            className={cn(
               'flex min-h-11 w-full rounded-lg border border-input bg-card/70 px-3.5 py-2 text-sm shadow-sm transition-[border-color,box-shadow,background-color]',
               'ring-offset-background',
               'hover:border-primary/35 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
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
