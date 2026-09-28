import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
   variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const variantClasses: Record<string, string> = {
   default: 'border-transparent bg-primary text-primary-foreground',
   secondary: 'border-transparent bg-secondary text-secondary-foreground',
   destructive: 'border-transparent bg-destructive text-destructive-foreground',
   outline: 'text-foreground',
};

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
   return (
      <span
         className={cn(
            'inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-none transition-colors',
            variantClasses[variant],
            className,
         )}
         {...props}
      />
   );
}

export { Badge };
