import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
   size?: 'default' | 'sm' | 'lg' | 'icon';
}

const variantClasses: Record<string, string> = {
   default: 'bg-primary text-primary-foreground shadow-sm shadow-primary/10 hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-primary/60',
   destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-1 focus-visible:ring-destructive/60',
   outline: 'border border-border/70 bg-card/60 hover:border-primary/45 hover:bg-accent hover:text-accent-foreground focus-visible:border-primary/70',
   secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-1 focus-visible:ring-ring/50',
   ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring/50',
   link: 'text-primary underline-offset-4 hover:underline',
};

const sizeClasses: Record<string, string> = {
   default: 'min-h-11 px-4 py-2',
   sm: 'min-h-10 rounded-lg px-3',
   lg: 'min-h-12 rounded-lg px-6 sm:px-8',
   icon: 'h-11 w-11 shrink-0',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
   ({ className, variant = 'default', size = 'default', ...props }, ref) => {
      return (
         <button
            className={cn(
               'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98]',
               'focus-visible:outline-none',
               'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
               variantClasses[variant],
               sizeClasses[size],
               className,
            )}
            ref={ref}
            {...props}
         />
      );
   },
);
Button.displayName = 'Button';

export { Button };
