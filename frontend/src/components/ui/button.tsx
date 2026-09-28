import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
   size?: 'default' | 'sm' | 'lg' | 'icon';
}

const variantClasses: Record<string, string> = {
   default: 'border border-primary/80 bg-primary text-primary-foreground shadow-sm shadow-primary/15 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20',
   destructive: 'border border-destructive/80 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
   outline: 'border border-input bg-card/70 shadow-sm hover:border-primary/30 hover:bg-accent hover:text-accent-foreground',
   secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
   ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
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
               'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
